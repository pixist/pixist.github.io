import { cn } from '@/lib/utils';

interface StepSequencerProps {
  steps: Array<string | null>;
  currentStep: number;
  onStepClick: (stepIndex: number, note: string) => void;
  onStepClear: (stepIndex: number) => void;
  availableNotes: string[];
  disabled?: boolean;
}

export function StepSequencer({
  steps,
  currentStep,
  onStepClick,
  onStepClear,
  availableNotes,
  disabled = false
}: StepSequencerProps) {
  const displayNotes = availableNotes.slice(0, 8);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max">
        <div className="flex gap-1 mb-2">
          <div className="w-12" />
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-10 h-6 flex items-center justify-center text-xs font-medium rounded",
                currentStep === index && "bg-accent text-accent-foreground",
                currentStep !== index && "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {displayNotes.map((note) => (
          <div key={note} className="flex gap-1 mb-1">
            <div className="w-12 flex items-center justify-end pr-2 text-xs font-medium text-muted-foreground">
              {note}
            </div>
            {steps.map((stepNote, stepIndex) => {
              const isActive = stepNote === note;
              const isCurrent = currentStep === stepIndex;
              
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
                    "w-10 h-10 rounded border-2 transition-all",
                    isActive && !isCurrent && "bg-accent border-accent",
                    isActive && isCurrent && "bg-accent border-accent scale-110 shadow-lg",
                    !isActive && !isCurrent && "bg-card border-border hover:border-accent/50",
                    !isActive && isCurrent && "bg-card border-accent",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}