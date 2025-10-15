import { useState, useEffect, useRef, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RangeIndicator } from './RangeIndicator';
import { RoomPresence } from './RoomPresence';
import { FullPianoKeyboard } from './FullPianoKeyboard';
import { Play, Stop, Pause, SkipForward, X, Repeat, ArrowsClockwise, User, MusicNote, PlayCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import { Sequence, StudentPlaybackState, RoomSettings } from '@/lib/types';
import { playNoteByName, resumeAudioContext, WaveformType } from '@/lib/audioEngine';
import { Translations, Language } from '@/lib/i18n';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StudentViewProps {
  roomId: string;
  sequence: Sequence | null;
  onRoleChange: () => void;
  t: Translations;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function StudentView({ roomId, sequence, onRoleChange, t, language, onLanguageChange }: StudentViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loop, setLoop] = useState(false);
  const [cycleMode, setCycleMode] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const pauseTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(0);
  const currentIterationRef = useRef<number>(0);
  const cycleStepsRef = useRef<number[][]>([]);

  const [roomSettings, setRoomSettings] = useKV<RoomSettings>(`room-${roomId}-settings`, {
    bpm: 120,
    waveform: 'sine',
    timestamp: Date.now(),
  });

  const waveform = roomSettings?.waveform || sequence?.waveform || 'sine';
  const bpm = roomSettings?.bpm || sequence?.bpm || 120;

  const updateRoomSettings = (updates: Partial<Omit<RoomSettings, 'timestamp'>>) => {
    setRoomSettings((current) => ({
      bpm: current?.bpm || 120,
      waveform: current?.waveform || 'sine',
      ...updates,
      timestamp: Date.now(),
    }));
  };

  const upcomingNotes = useMemo(() => {
    if (!sequence || !isPlaying || currentNoteIndex < 0) return [];
    
    const lookAheadCount = 10;
    const upcoming: string[] = [];
    
    for (let i = currentNoteIndex + 1; i < Math.min(currentNoteIndex + lookAheadCount, sequence.steps.length); i++) {
      const note = sequence.steps[i]?.note;
      if (note && !upcoming.includes(note)) {
        upcoming.push(note);
      }
    }
    
    return upcoming;
  }, [sequence, isPlaying, currentNoteIndex]);

  const [, setStudentState] = useKV<StudentPlaybackState>(`room-${roomId}-student-state`, {
    isPlaying: false,
    isPaused: false,
    currentStep: -1,
    currentNote: null,
    progress: 0,
    timestamp: Date.now(),
  });

  useEffect(() => {
    setStudentState((current) => ({
      ...current,
      isPlaying,
      isPaused,
      currentStep: currentNoteIndex,
      currentNote,
      progress,
      timestamp: Date.now(),
    }));
  }, [isPlaying, isPaused, currentNoteIndex, currentNote, progress, setStudentState]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (sequence) {
      toast.success(t.toasts.sequenceReceived);
      
      const baseDuration = sequence.steps.length > 0 
        ? sequence.steps[sequence.steps.length - 1].timestamp + (sequence.steps[sequence.steps.length - 1].duration * 1000)
        : 0;
      
      const cycles: number[][] = [];
      let currentCycleSteps: number[] = [];
      let lastTimestamp = 0;
      
      sequence.steps.forEach((step, idx) => {
        if (step.timestamp < lastTimestamp) {
          cycles.push([...currentCycleSteps]);
          currentCycleSteps = [];
        }
        currentCycleSteps.push(idx);
        lastTimestamp = step.timestamp;
      });
      
      if (currentCycleSteps.length > 0) {
        cycles.push(currentCycleSteps);
      }
      
      cycleStepsRef.current = cycles;
      setTotalCycles(cycles.length);
    }
  }, [sequence?.id, t.toasts.sequenceReceived]);

  const stopPlayback = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentNoteIndex(-1);
    setCurrentNote(null);
    setProgress(0);
    setCurrentCycle(0);
    setWaitingForNext(false);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    pauseTimeRef.current = 0;
    remainingTimeRef.current = 0;
    currentIterationRef.current = 0;
  };

  const playSequence = async (fromPause = false) => {
    if (!sequence) {
      toast.error(t.toasts.noSequence);
      return;
    }

    await resumeAudioContext();

    setIsPlaying(true);
    setIsPaused(false);
    setCurrentNoteIndex(0);
    if (!fromPause) {
      setProgress(0);
      setCurrentCycle(0);
      currentIterationRef.current = 0;
    }

    if (cycleMode) {
      playCycleByDycle(fromPause ? currentCycle : 0);
    } else {
      playContinuous(fromPause ? remainingTimeRef.current : 0);
    }
  };

  const playCycleByDycle = (startCycle = 0) => {
    if (!sequence || cycleStepsRef.current.length === 0) return;
    
    const cycles = cycleStepsRef.current;
    setCurrentCycle(startCycle);
    setWaitingForNext(false);
    
    const cycleSteps = cycles[startCycle];
    if (!cycleSteps) {
      stopPlayback();
      return;
    }
    
    const stepsInCycle = cycleSteps.map(idx => sequence.steps[idx]);
    
    timeoutsRef.current = [];
    
    stepsInCycle.forEach((step, relativeIndex) => {
      const absoluteIndex = cycleSteps[relativeIndex];
      const timeout = setTimeout(() => {
        playNoteByName(step.note, step.duration, waveform);
        setCurrentNoteIndex(absoluteIndex);
        setCurrentNote(step.note);
        
        const cycleProgress = ((startCycle + 1) / cycles.length) * 100;
        setProgress(cycleProgress);
        
        setTimeout(() => {
          setCurrentNote(null);
        }, step.duration * 1000);
        
        if (relativeIndex === stepsInCycle.length - 1) {
          setTimeout(() => {
            setCurrentNoteIndex(-1);
            
            if (startCycle + 1 >= cycles.length) {
              if (loop) {
                setWaitingForNext(true);
              } else {
                stopPlayback();
              }
            } else {
              setWaitingForNext(true);
            }
          }, step.duration * 1000);
        }
      }, step.timestamp);
      
      timeoutsRef.current.push(timeout);
    });
  };

  const playContinuous = (offset = 0) => {
    if (!sequence) return;
    
    const playOnce = (offset = 0) => {
      timeoutsRef.current = [];
      const startTime = Date.now() - offset;

      sequence.steps.forEach((step, index) => {
        const adjustedTimestamp = step.timestamp - offset;
        if (adjustedTimestamp < 0) return;

        const timeout = setTimeout(() => {
          playNoteByName(step.note, step.duration, waveform);
          setCurrentNoteIndex(index);
          setCurrentNote(step.note);
          
          const elapsed = Date.now() - startTime;
          setProgress((elapsed / sequence.totalDuration) * 100);

          setTimeout(() => {
            setCurrentNote(null);
          }, step.duration * 1000);

          if (index === sequence.steps.length - 1) {
            setTimeout(() => {
              currentIterationRef.current++;
              if (loop) {
                if (sequence.restDuration > 0) {
                  setCurrentNoteIndex(-1);
                  setCurrentNote(null);
                  setTimeout(() => {
                    if (isPlaying && !isPaused) {
                      playOnce();
                    }
                  }, sequence.restDuration * 1000);
                } else {
                  playOnce();
                }
              } else {
                stopPlayback();
              }
            }, step.duration * 1000);
          }
        }, adjustedTimestamp);

        timeoutsRef.current.push(timeout);
      });
    };

    playOnce(offset);
  };

  const handlePlayPause = async () => {
    if (!sequence) {
      toast.error(t.toasts.noSequence);
      return;
    }

    if (!isPlaying) {
      await playSequence();
    } else if (isPaused) {
      await playSequence(true);
    } else {
      setIsPaused(true);
      pauseTimeRef.current = Date.now();
      remainingTimeRef.current = (progress / 100) * sequence.totalDuration;
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    }
  };

  const handleStop = () => {
    stopPlayback();
  };

  const handleSkip = () => {
    if (!sequence) return;
    
    if (cycleMode && waitingForNext) {
      const nextCycle = currentCycle + 1;
      if (nextCycle >= totalCycles) {
        if (loop) {
          setWaitingForNext(false);
          playCycleByDycle(0);
        } else {
          stopPlayback();
        }
      } else {
        setWaitingForNext(false);
        playCycleByDycle(nextCycle);
      }
    } else {
      stopPlayback();
      setTimeout(() => {
        playSequence();
      }, 100);
    }
  };

  const handleRepeatCycle = () => {
    if (!cycleMode || !waitingForNext) return;
    setWaitingForNext(false);
    playCycleByDycle(currentCycle);
  };

  const handlePreviousCycle = () => {
    if (!cycleMode || !waitingForNext || currentCycle === 0) return;
    setWaitingForNext(false);
    playCycleByDycle(currentCycle - 1);
  };

  const studentState: StudentPlaybackState = {
    isPlaying,
    isPaused,
    currentStep: currentNoteIndex,
    currentNote,
    progress,
    timestamp: Date.now(),
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
          <div className="flex gap-2">
            <Select value={language} onValueChange={(v) => onLanguageChange(v as Language)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇬🇧 EN</SelectItem>
                <SelectItem value="de">🇩🇪 DE</SelectItem>
                <SelectItem value="tr">🇹🇷 TR</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={onRoleChange}>
              <ArrowsClockwise className="mr-2" size={16} />
              {t.roles.switchRole}
            </Button>
          </div>
        </div>

        <RoomPresence roomId={roomId} currentRole="student" t={t} studentState={studentState} />

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

              <div className="mb-6">
                <Label className="mb-2 block">{t.student.progress}</Label>
                <FullPianoKeyboard 
                  currentNote={currentNote}
                  upcomingNotes={upcomingNotes}
                  className="mb-4"
                />
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-student transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">
                    {cycleMode && totalCycles > 0 
                      ? `Cycle ${currentCycle + 1}/${totalCycles}`
                      : `${Math.round(progress)}%`
                    }
                  </span>
                  {currentNote && (
                    <Badge variant="secondary" className="font-mono">
                      {currentNote}
                    </Badge>
                  )}
                  {isPlaying && !isPaused && !waitingForNext && (
                    <Badge variant="secondary" className="animate-pulse">
                      {t.student.playing}
                    </Badge>
                  )}
                  {waitingForNext && (
                    <Badge variant="outline" className="animate-pulse">
                      {currentCycle + 1 >= totalCycles && !loop ? t.student.lastCycleComplete : t.student.cycleComplete}
                    </Badge>
                  )}
                  {isPaused && (
                    <Badge variant="outline">
                      {t.student.paused}
                    </Badge>
                  )}
                </div>
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

              <div className="space-y-3 mb-6">
                <div className="p-4 bg-card border rounded-lg space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">{t.student.roomSettings}</h3>
                    <p className="text-xs text-muted-foreground">{t.student.roomSettingsDesc}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.instructor.instrument}</Label>
                      <Select value={waveform} onValueChange={(v) => updateRoomSettings({ waveform: v as WaveformType })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sine">Pure Tone</SelectItem>
                          <SelectItem value="triangle">Soft</SelectItem>
                          <SelectItem value="square">Bright</SelectItem>
                          <SelectItem value="sawtooth">Rich</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.instructor.bpm}: {bpm}</Label>
                      <Slider
                        value={[bpm]}
                        onValueChange={([value]) => updateRoomSettings({ bpm: value })}
                        min={40}
                        max={200}
                        step={5}
                        className="pt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
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
                      {sequence.restDuration > 0 && ` (${sequence.restDuration}s rest)`}
                    </p>
                  </div>
                  <Repeat size={24} weight={loop ? 'fill' : 'regular'} className="text-muted-foreground" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="lg"
                    onClick={() => {
                      if (!isPlaying || cycleMode) {
                        setCycleMode(true);
                        if (!isPlaying) {
                          handlePlayPause();
                        }
                      } else {
                        stopPlayback();
                        setCycleMode(true);
                        setTimeout(() => handlePlayPause(), 50);
                      }
                    }}
                    disabled={isPlaying && cycleMode}
                    className={cn(
                      "flex-1",
                      isPlaying && cycleMode
                        ? "bg-student hover:bg-student/90 text-student-foreground"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                  >
                    <PlayCircle className="mr-2" size={20} weight="fill" />
                    {t.student.cycleByCycle}
                  </Button>

                  <Button
                    size="lg"
                    onClick={() => {
                      if (!isPlaying || !cycleMode) {
                        setCycleMode(false);
                        if (!isPlaying) {
                          handlePlayPause();
                        }
                      } else {
                        stopPlayback();
                        setCycleMode(false);
                        setTimeout(() => handlePlayPause(), 50);
                      }
                    }}
                    disabled={isPlaying && !cycleMode}
                    className={cn(
                      "flex-1",
                      isPlaying && !cycleMode
                        ? "bg-student hover:bg-student/90 text-student-foreground"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                  >
                    <Play className="mr-2" size={20} weight="fill" />
                    {t.student.continuous}
                  </Button>
                </div>

                {isPlaying && (
                  <div className="flex gap-2">
                    {cycleMode && waitingForNext ? (
                      <>
                        <Button
                          size="lg"
                          onClick={handlePreviousCycle}
                          disabled={currentCycle === 0}
                          variant="outline"
                          className="flex-1"
                        >
                          <ArrowCounterClockwise className="mr-2" size={20} weight="fill" />
                          {t.student.previous}
                        </Button>
                        <Button
                          size="lg"
                          onClick={handleRepeatCycle}
                          variant="outline"
                          className="flex-1"
                        >
                          <Repeat className="mr-2" size={20} weight="fill" />
                          {t.student.repeat}
                        </Button>
                        <Button
                          size="lg"
                          onClick={handleSkip}
                          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground animate-pulse"
                        >
                          <SkipForward className="mr-2" size={20} weight="fill" />
                          {t.student.next}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handlePlayPause}
                        className="flex-1"
                      >
                        {isPaused ? (
                          <>
                            <Play className="mr-2" size={20} weight="fill" />
                            {t.student.resume}
                          </>
                        ) : (
                          <>
                            <Pause className="mr-2" size={20} weight="fill" />
                            {t.student.pause}
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleStop}
                    >
                      <Stop size={20} weight="fill" />
                    </Button>
                  </div>
                )}
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