import { cn } from '@/lib/utils';

interface MiniKeyboardProps {
  startNote?: string;
  endNote?: string;
  currentNote?: string | null;
  octaveCount?: number;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = new Set(['C#', 'D#', 'F#', 'G#', 'A#']);

export function MiniKeyboard({
  startNote = 'C3',
  endNote = 'B5',
  currentNote,
  octaveCount = 3,
}: MiniKeyboardProps) {
  const generateKeys = () => {
    const keys: { note: string; isBlack: boolean; noteName: string }[] = [];
    const startMatch = startNote.match(/^([A-G]#?)(\d)$/);
    const endMatch = endNote.match(/^([A-G]#?)(\d)$/);
    
    if (!startMatch || !endMatch) return keys;
    
    const startOctave = parseInt(startMatch[2]);
    const endOctave = parseInt(endMatch[2]);
    
    for (let octave = startOctave; octave <= endOctave; octave++) {
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
    <div className="relative w-full h-24 select-none bg-muted/30 rounded-lg p-2">
      <div className="relative w-full h-full">
        <div className="flex h-full gap-px">
          {keys.map((key) => {
            if (key.isBlack) return null;
            
            const isActive = currentNote === key.note;
            
            return (
              <div
                key={key.note}
                className={cn(
                  "relative flex-1 rounded-sm border transition-all",
                  isActive 
                    ? "bg-student border-student scale-105 shadow-lg z-20" 
                    : "bg-white border-border"
                )}
              >
                {isActive && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-student-foreground">
                    {key.note}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute inset-0 flex pointer-events-none">
          {keys.map((key, index) => {
            if (!key.isBlack) return <div key={key.note} className="flex-1" />;
            
            const isActive = currentNote === key.note;
            const whiteKeyIndex = keys.slice(0, index).filter(k => !k.isBlack).length;
            
            return (
              <div key={key.note} className="flex-1 relative">
                <div
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 w-4 h-14 rounded-b-sm border transition-all z-10",
                    isActive
                      ? "bg-student border-student scale-110 shadow-lg"
                      : "bg-gray-900 border-gray-950"
                  )}
                  style={{ 
                    left: `${((whiteKeyIndex + 0.7) / keys.filter(k => !k.isBlack).length) * 100}%` 
                  }}
                >
                  {isActive && (
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-student-foreground whitespace-nowrap">
                      {key.note}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
