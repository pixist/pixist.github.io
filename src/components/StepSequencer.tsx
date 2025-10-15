import { cn } from '@/lib/utils';
import { getNotesBetween } from '@/lib/audioEngine';
import { ArrowUp, ArrowDown } from '@phosphor-icons/react';

interface StepSequencerProps {
  steps: Array<string | null>;
  currentStep: number;
  onStepClick: (stepIndex: number, note: string) => void;
  onStepClear: (stepIndex: number) => void;
  availableNotes: string[];
  rootNote: string;
  minNote: string;
  maxNote: string;
  disabled?: boolean;
}

export function StepSequencer({
  steps,
  currentStep,
  onStepClick,
  onStepClear,
  availableNotes,
  rootNote,
  minNote,
  maxNote,
  disabled = false
}: StepSequencerProps) {
  const rootNotesBetween = getNotesBetween(rootNote, rootNote + '0');
  const rootNotePattern = rootNotesBetween.length > 0 ? rootNotesBetween[0].replace(/\d+$/, '') : '';
  
  const displayNotes = availableNotes.filter(note => {
    const noteName = note.replace(/\d+$/, '');
    return noteName === rootNotePattern;
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max">
        <div className="flex gap-1 mb-2">
          <div className="w-14" />
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-12 h-6 flex items-center justify-center text-xs font-medium rounded",
                currentStep === index && "bg-accent text-accent-foreground",
                currentStep !== index && "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {displayNotes.map((note) => {
          const isMinNote = note === minNote;
          const isMaxNote = note === maxNote;
          
          return (
            <div key={note} className="flex gap-1 mb-1">
              <div className="w-14 flex items-center justify-end pr-2 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  {isMinNote && <ArrowDown size={12} weight="bold" className="text-destructive" />}
                  {isMaxNote && <ArrowUp size={12} weight="bold" className="text-accent" />}
                  <span className={cn(
                    isMinNote && "text-destructive",
                    isMaxNote && "text-accent",
                    !isMinNote && !isMaxNote && "text-muted-foreground"
                  )}>
                    {note}
                  </span>
                </div>
              </div>
              {steps.map((stepNote, stepIndex) => {
                const isActive = stepNote === note;
                const isCurrent = currentStep === stepIndex;
                const isGhost = !isActive;
                
                return (
                  <button
                    key={stepIndex}
                    disabled={disabled}
                    onClick={() => {
                      if (isActive) {
                        onStepClear(stepIndex);
                      } else {
                        onStepClick(stepIndex, note);
                      }
                    }}
                    className={cn(
                      "w-12 h-10 rounded border-2 transition-all relative",
                      isActive && !isCurrent && "bg-accent border-accent",
                      isActive && isCurrent && "bg-accent border-accent scale-110 shadow-lg",
                      !isActive && !isCurrent && "bg-card border-border hover:border-accent/50",
                      !isActive && isCurrent && "bg-accent/10 border-accent",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isGhost && isCurrent && (
                      <div className="absolute inset-1 rounded bg-accent/20" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}