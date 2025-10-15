import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface FullPianoKeyboardProps {
  upcomingNotes?: string[];
  currentNote?: string | null;
  className?: string;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = new Set(['C#', 'D#', 'F#', 'G#', 'A#']);

const NOTE_TO_MIDI = (note: string): number => {
  const noteMap: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return 0;
  
  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr);
  const noteIndex = noteMap[noteName];
  
  return (octave + 1) * 12 + noteIndex;
};

export function FullPianoKeyboard({ upcomingNotes = [], currentNote, className }: FullPianoKeyboardProps) {
  const keys = useMemo(() => {
    const allKeys: { note: string; isBlack: boolean; midiNote: number }[] = [];
    for (let octave = 0; octave <= 8; octave++) {
      for (const noteName of NOTES) {
        const note = `${noteName}${octave}`;
        const midiNote = NOTE_TO_MIDI(note);
        if (midiNote >= 21 && midiNote <= 108) {
          allKeys.push({
            note,
            isBlack: BLACK_KEYS.has(noteName),
            midiNote
          });
        }
      }
    }
    return allKeys;
  }, []);

  const whiteKeys = keys.filter(k => !k.isBlack);
  const blackKeys = keys.filter(k => k.isBlack);

  const upcomingNotesSet = new Set(upcomingNotes);

  const getKeyState = (note: string) => {
    if (currentNote === note) return 'current';
    if (upcomingNotesSet.has(note)) return 'upcoming';
    return 'default';
  };

  return (
    <div className={cn("relative w-full h-32 select-none overflow-x-auto bg-muted/30 rounded-lg p-2", className)}>
      <div className="relative h-full min-w-max">
        <div className="flex h-full gap-[1px]">
          {whiteKeys.map((key) => {
            const state = getKeyState(key.note);
            return (
              <div
                key={key.note}
                className={cn(
                  "relative flex-shrink-0 w-3 h-full rounded-b-sm border transition-all duration-150",
                  state === 'current' && "bg-primary border-primary scale-[1.02] shadow-lg z-20",
                  state === 'upcoming' && "bg-primary/20 border-primary/30",
                  state === 'default' && "bg-white border-border"
                )}
              />
            );
          })}
        </div>

        <div className="absolute inset-0 flex pointer-events-none">
          {whiteKeys.map((_, whiteIndex) => {
            if (whiteIndex >= whiteKeys.length - 1) return null;
            
            const nextWhiteKey = whiteKeys[whiteIndex + 1];
            const blackKeyBetween = blackKeys.find(bk => 
              bk.midiNote > whiteKeys[whiteIndex].midiNote && 
              bk.midiNote < nextWhiteKey.midiNote
            );
            
            if (!blackKeyBetween) {
              return <div key={`gap-${whiteIndex}`} className="flex-shrink-0 w-3" />;
            }

            const state = getKeyState(blackKeyBetween.note);
            
            return (
              <div key={`black-${whiteIndex}`} className="flex-shrink-0 w-3 relative">
                <div
                  className={cn(
                    "absolute left-[60%] -translate-x-1/2 w-2 h-[60%] rounded-b-sm border transition-all duration-150 z-10",
                    state === 'current' && "bg-primary border-primary/80 scale-[1.05] shadow-md",
                    state === 'upcoming' && "bg-primary/30 border-primary/40",
                    state === 'default' && "bg-gray-900 border-gray-950"
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
