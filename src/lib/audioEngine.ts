let audioContext: AudioContext | null = null;

export const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

export const resumeAudioContext = async () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
};

export const noteToFrequency = (note: string): number => {
  const noteMap: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return 440;
  
  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr);
  const noteIndex = noteMap[noteName];
  
  const midiNote = (octave + 1) * 12 + noteIndex;
  return 440 * Math.pow(2, (midiNote - 69) / 12);
};

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export const playNote = (
  frequency: number,
  duration: number = 0.5,
  waveform: WaveformType = 'sine',
  volume: number = 0.3
): void => {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

export const playNoteByName = (
  note: string,
  duration: number = 0.5,
  waveform: WaveformType = 'sine',
  volume: number = 0.3
): void => {
  const frequency = noteToFrequency(note);
  playNote(frequency, duration, waveform, volume);
};

export const transposeNote = (note: string, semitones: number): string => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const match = note.match(/^([A-G]#?)(\d)$/);
  
  if (!match) return note;
  
  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr);
  const noteIndex = noteNames.indexOf(noteName);
  
  const totalSemitones = octave * 12 + noteIndex + semitones;
  const newOctave = Math.floor(totalSemitones / 12);
  const newNoteIndex = totalSemitones % 12;
  
  return `${noteNames[newNoteIndex]}${newOctave}`;
};

export const getNotesBetween = (minNote: string, maxNote: string): string[] => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const minMatch = minNote.match(/^([A-G]#?)(\d)$/);
  const maxMatch = maxNote.match(/^([A-G]#?)(\d)$/);
  
  if (!minMatch || !maxMatch) return [];
  
  const minOctave = parseInt(minMatch[2]);
  const maxOctave = parseInt(maxMatch[2]);
  const minNoteIndex = noteNames.indexOf(minMatch[1]);
  const maxNoteIndex = noteNames.indexOf(maxMatch[1]);
  
  const minTotal = minOctave * 12 + minNoteIndex;
  const maxTotal = maxOctave * 12 + maxNoteIndex;
  
  const notes: string[] = [];
  for (let i = minTotal; i <= maxTotal; i++) {
    const octave = Math.floor(i / 12);
    const noteIndex = i % 12;
    notes.push(`${noteNames[noteIndex]}${octave}`);
  }
  
  return notes;
};

export const getSemitonesBetween = (note1: string, note2: string): number => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const match1 = note1.match(/^([A-G]#?)(\d)$/);
  const match2 = note2.match(/^([A-G]#?)(\d)$/);
  
  if (!match1 || !match2) return 0;
  
  const octave1 = parseInt(match1[2]);
  const octave2 = parseInt(match2[2]);
  const noteIndex1 = noteNames.indexOf(match1[1]);
  const noteIndex2 = noteNames.indexOf(match2[1]);
  
  const total1 = octave1 * 12 + noteIndex1;
  const total2 = octave2 * 12 + noteIndex2;
  
  return total2 - total1;
};