import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RangeIndicator } from './RangeIndicator';
import { Play, Stop, Repeat, ArrowsClockwise, User, MusicNote } from '@phosphor-icons/react';
import { Sequence } from '@/lib/types';
import { playNoteByName, resumeAudioContext } from '@/lib/audioEngine';
import { Translations } from '@/lib/i18n';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StudentViewProps {
  roomId: string;
  sequence: Sequence | null;
  onRoleChange: () => void;
  t: Translations;
}

export function StudentView({ roomId, sequence, onRoleChange, t }: StudentViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (sequence) {
      toast.success(t.toasts.sequenceReceived);
    }
  }, [sequence?.id, t.toasts.sequenceReceived]);

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentNoteIndex(-1);
    setProgress(0);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const playSequence = async () => {
    if (!sequence) {
      toast.error(t.toasts.noSequence);
      return;
    }

    await resumeAudioContext();

    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);
    setCurrentNoteIndex(0);
    setProgress(0);

    const playOnce = () => {
      timeoutsRef.current = [];
      const startTime = Date.now();

      sequence.steps.forEach((step, index) => {
        const timeout = setTimeout(() => {
          playNoteByName(step.note, step.duration, sequence.waveform);
          setCurrentNoteIndex(index);
          
          const elapsed = Date.now() - startTime;
          setProgress((elapsed / sequence.totalDuration) * 100);

          if (index === sequence.steps.length - 1) {
            setTimeout(() => {
              if (loop) {
                playOnce();
              } else {
                stopPlayback();
              }
            }, step.duration * 1000);
          }
        }, step.timestamp);

        timeoutsRef.current.push(timeout);
      });
    };

    playOnce();
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-student/5 to-background">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-student flex items-center justify-center">
              <User size={24} weight="duotone" className="text-student-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{t.student.title}</h1>
                <Badge variant="outline">{roomId}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t.student.subtitle}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onRoleChange}>
            <ArrowsClockwise className="mr-2" size={16} />
            {t.roles.switchRole}
          </Button>
        </div>

        {!sequence ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <MusicNote size={32} weight="duotone" className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">{t.student.waiting}</h2>
                <p className="text-muted-foreground">
                  {t.student.waitingDesc}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MusicNote size={20} weight="duotone" />
                <h2 className="text-lg font-semibold">{t.student.currentSequence}</h2>
              </div>

              <div className="mb-6">
                <RangeIndicator minNote={sequence.minNote} maxNote={sequence.maxNote} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.student.range}</p>
                  <p className="font-semibold">{sequence.minNote} - {sequence.maxNote}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.student.notes}</p>
                  <p className="font-semibold">{sequence.steps.length} {t.student.notes.toLowerCase()}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t.student.waveform}</p>
                  <p className="font-semibold capitalize">{sequence.waveform}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>{t.student.progress}</Label>
                    {isPlaying && (
                      <Badge variant="secondary" className="animate-pulse">
                        {t.student.playing}
                      </Badge>
                    )}
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-student transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg overflow-x-auto">
                  {sequence.steps.map((step, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-md border-2 flex items-center justify-center text-xs font-medium transition-all",
                        currentNoteIndex === index && "bg-student border-student text-student-foreground scale-110 shadow-lg",
                        currentNoteIndex !== index && "bg-card border-border text-muted-foreground"
                      )}
                    >
                      {step.note}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Switch
                    id="loop"
                    checked={loop}
                    onCheckedChange={setLoop}
                    disabled={isPlaying}
                  />
                  <div className="flex-1">
                    <Label htmlFor="loop" className="cursor-pointer">
                      {t.student.loop}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t.student.loopDesc}
                    </p>
                  </div>
                  <Repeat size={24} weight={loop ? 'fill' : 'regular'} className="text-muted-foreground" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex gap-2">
                <Button
                  size="lg"
                  onClick={playSequence}
                  className="flex-1 bg-student hover:bg-student/90 text-student-foreground"
                >
                  {isPlaying ? (
                    <>
                      <Stop className="mr-2" size={20} weight="fill" />
                      {t.student.stop}
                    </>
                  ) : (
                    <>
                      <Play className="mr-2" size={20} weight="fill" />
                      {t.student.play}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </>
        )}

        <Card className="p-4 bg-muted/50">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">{t.student.practiceTips}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t.student.tip1}</li>
              <li>{t.student.tip2}</li>
              <li>{t.student.tip3}</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}