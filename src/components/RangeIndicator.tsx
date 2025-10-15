import { ArrowDown, ArrowUp } from '@phosphor-icons/react';

interface RangeIndicatorProps {
  minNote: string;
  maxNote: string;
  compact?: boolean;
}

export function RangeIndicator({ minNote, maxNote, compact = false }: RangeIndicatorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded border border-destructive/20">
          <ArrowDown size={14} weight="bold" />
          <span className="font-semibold">{minNote}</span>
        </div>
        <span className="text-muted-foreground">→</span>
        <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent-foreground rounded border border-accent/20">
          <ArrowUp size={14} weight="bold" />
          <span className="font-semibold">{maxNote}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-destructive/5 rounded-lg border-2 border-destructive/20">
        <div className="flex items-center gap-2 mb-1">
          <ArrowDown size={18} weight="bold" className="text-destructive" />
          <p className="text-xs font-medium text-destructive uppercase tracking-wide">Min Note</p>
        </div>
        <p className="text-xl font-bold text-destructive">{minNote}</p>
      </div>
      <div className="p-3 bg-accent/5 rounded-lg border-2 border-accent/20">
        <div className="flex items-center gap-2 mb-1">
          <ArrowUp size={18} weight="bold" className="text-accent-foreground" />
          <p className="text-xs font-medium text-accent-foreground uppercase tracking-wide">Max Note</p>
        </div>
        <p className="text-xl font-bold text-accent-foreground">{maxNote}</p>
      </div>
    </div>
  );
}
