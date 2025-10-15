import { useState } from 'react';
import { playNoteByName, WaveformType } from '@/lib/audioEngine';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  startOctave?: number;
  octaveCount?: number;
  onNotePress?: (note: string) => void;
  waveform?: WaveformType;
  disabled?: boolean;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = new Set(['C#', 'D#', 'F#', 'G#', 'A#']);

export function PianoKeyboard({
  startOctave = 3,
  octaveCount = 2,
  onNotePress,
  waveform = 'sine',
  disabled = false
}: PianoKeyboardProps) {
  const [activeNote, setActiveNote] = useState<string | null>(null);

  const handleNoteDown = (note: string) => {
    if (disabled) return;
    setActiveNote(note);
    playNoteByName(note, 0.5, waveform);
    onNotePress?.(note);
  };

  const handleNoteUp = () => {
    setActiveNote(null);
  };

  const generateKeys = () => {
    const keys: { note: string; isBlack: boolean; noteName: string }[] = [];
    for (let octave = startOctave; octave < startOctave + octaveCount; octave++) {
      for (const note of NOTES) {
        const fullNote = `${note}${octave}`;
        const isBlack = BLACK_KEYS.has(note);
        keys.push({ note: fullNote, isBlack, noteName: note });
      }
    }
    return keys;
  };

  const keys = generateKeys();

  return (
    <div className="relative w-full h-48 select-none">
      <div className="flex h-full gap-0.5">
        {keys.map((key) => {
          if (key.isBlack) return null;
          
          const isActive = activeNote === key.note;
          
          return (
            <button
              key={key.note}
              disabled={disabled}
              onTouchStart={(e) => {
                e.preventDefault();
                handleNoteDown(key.note);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleNoteUp();
              }}
              onMouseDown={() => handleNoteDown(key.note)}
              onMouseUp={handleNoteUp}
              onMouseLeave={handleNoteUp}
              className={cn(
                "relative flex-1 rounded-b-md border border-border bg-white transition-all",
                "hover:bg-gray-50 active:bg-gray-200",
                isActive && "bg-gray-300 scale-[0.98]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium tracking-wide">
                {key.noteName}
              </span>
            </button>
          );
        })}
      </div>

      <div className="absolute inset-0 flex pointer-events-none">
        {keys.map((key, index) => {
          if (!key.isBlack) return <div key={key.note} className="flex-1" />;
          
          const isActive = activeNote === key.note;
          const whiteKeyIndex = keys.slice(0, index).filter(k => !k.isBlack).length;
          
          return (
            <div key={key.note} className="flex-1 relative">
              <button
                disabled={disabled}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleNoteDown(key.note);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleNoteUp();
                }}
                onMouseDown={() => handleNoteDown(key.note)}
                onMouseUp={handleNoteUp}
                onMouseLeave={handleNoteUp}
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 w-8 h-28 pointer-events-auto",
                  "bg-gray-900 rounded-b-md border border-gray-950",
                  "hover:bg-gray-800 active:bg-gray-700 transition-all z-10",
                  isActive && "bg-gray-600 scale-[0.95]",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{ 
                  left: `${((whiteKeyIndex + 0.7) / keys.filter(k => !k.isBlack).length) * 100}%` 
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}