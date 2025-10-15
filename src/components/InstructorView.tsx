import { useState, useEffect, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { PianoKeyboard } from './PianoKeyboard';
import { StepSequencer } from './StepSequencer';
import { RangeIndicator } from './RangeIndicator';
import { RoomPresence } from './RoomPresence';
import { Play, Stop, Record, ArrowsClockwise, GraduationCap, MusicNote } from '@phosphor-icons/react';
import { Sequence, SequenceStep, InstructorState, TranspositionDirection } from '@/lib/types';
import { getNotesBetween, playNoteByName, resumeAudioContext, WaveformType } from '@/lib/audioEngine';
import { Translations } from '@/lib/i18n';
import { generateTransposedSequences } from '@/lib/utils';
import { toast } from 'sonner';

interface InstructorViewProps {
  roomId: string;
  onRoleChange: () => void;
  onSequenceCreate: (sequence: Sequence) => void;
  t: Translations;
}

const WAVEFORMS: WaveformType[] = ['sine', 'square', 'triangle', 'sawtooth'];
const INSTRUMENTS = [
  { value: 'sine', label: 'Pure Tone' },
  { value: 'triangle', label: 'Soft' },
  { value: 'square', label: 'Bright' },
  { value: 'sawtooth', label: 'Rich' },
];
const ROOT_NOTES = ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4'];
const DEFAULT_STEPS = 16;

export function InstructorView({ roomId, onRoleChange, onSequenceCreate, t }: InstructorViewProps) {
  const [mode, setMode] = useState<'step' | 'realtime'>('step');
  const [rootNote, setRootNote] = useState('C3');
  const [minNote, setMinNote] = useState('E3');
  const [maxNote, setMaxNote] = useState('E5');
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  const [bpm, setBpm] = useState(120);
  const [restDuration, setRestDuration] = useState(2);
  const [stepCount, setStepCount] = useState(DEFAULT_STEPS);
  const [transpositionDirection, setTranspositionDirection] = useState<TranspositionDirection>('both-ways');
  
  const [steps, setSteps] = useState<Array<string | null>>(Array(DEFAULT_STEPS).fill(null));
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<SequenceStep[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [, setInstructorState] = useKV<InstructorState>(`room-${roomId}-instructor-state`, {
    isRecording: false,
    isPlaying: false,
    currentStep: -1,
    timestamp: Date.now(),
  });

  const availableNotes = getNotesBetween(minNote, maxNote);

  useEffect(() => {
    setInstructorState((current) => ({
      ...current,
      isRecording,
      isPlaying,
      currentStep,
      timestamp: Date.now(),
    }));
  }, [isRecording, isPlaying, currentStep, setInstructorState]);

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const currentLength = steps.length;
    if (stepCount !== currentLength) {
      const newSteps = Array(stepCount).fill(null);
      for (let i = 0; i < Math.min(stepCount, currentLength); i++) {
        newSteps[i] = steps[i];
      }
      setSteps(newSteps);
    }
  }, [stepCount]);

  const handleStepClick = (stepIndex: number, note: string) => {
    const newSteps = [...steps];
    newSteps[stepIndex] = note;
    setSteps(newSteps);
    playNoteByName(note, 0.2, waveform);
  };

  const handleStepClear = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex] = null;
    setSteps(newSteps);
  };

  const handlePreview = async () => {
    await resumeAudioContext();
    
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentStep(-1);
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      return;
    }

    const filledSteps = mode === 'step' 
      ? steps.map((note, i) => ({ note, index: i })).filter(s => s.note !== null)
      : recordedSteps.map((step, i) => ({ ...step, index: i }));

    if (filledSteps.length === 0) {
      toast.error(t.toasts.addNotes);
      return;
    }

    setIsPlaying(true);
    let stepIndex = 0;
    const stepDuration = (60 / bpm) * 1000;

    if (mode === 'step') {
      setCurrentStep(0);
      const playStep = () => {
        if (steps[stepIndex]) {
          playNoteByName(steps[stepIndex]!, 0.3, waveform);
        }
        stepIndex = (stepIndex + 1) % steps.length;
        setCurrentStep(stepIndex);
        
        if (stepIndex === 0 && playIntervalRef.current) {
          clearInterval(playIntervalRef.current);
          playIntervalRef.current = null;
          setIsPlaying(false);
          setCurrentStep(-1);
        }
      };

      playStep();
      playIntervalRef.current = setInterval(playStep, stepDuration / 4);
    } else {
      for (const step of recordedSteps) {
        setTimeout(() => {
          playNoteByName(step.note, step.duration, waveform);
        }, step.timestamp);
      }
      
      const totalDuration = recordedSteps[recordedSteps.length - 1]?.timestamp || 0;
      setTimeout(() => {
        setIsPlaying(false);
      }, totalDuration + 500);
    }
  };

  const handleRecord = async () => {
    await resumeAudioContext();
    
    if (isRecording) {
      setIsRecording(false);
      toast.success(`${t.toasts.notesRecorded}: ${recordedSteps.length}`);
      return;
    }

    setRecordedSteps([]);
    setIsRecording(true);
    recordStartTimeRef.current = Date.now();
    toast.info(t.toasts.recordingStarted);
  };

  const handleNotePress = (note: string) => {
    if (isRecording) {
      const timestamp = Date.now() - recordStartTimeRef.current;
      const newStep: SequenceStep = {
        note,
        timestamp,
        duration: 0.3
      };
      setRecordedSteps(prev => [...prev, newStep]);
    }
  };

  const handleTransmit = () => {
    let baseSequenceSteps: SequenceStep[];
    let baseStepDuration: number;

    if (mode === 'step') {
      baseStepDuration = (60 / bpm) * 1000 / 4;
      baseSequenceSteps = steps
        .map((note, index) => 
          note ? { note, timestamp: index * baseStepDuration, duration: 0.3 } : null
        )
        .filter((s): s is SequenceStep => s !== null);
    } else {
      baseSequenceSteps = recordedSteps;
    }

    if (baseSequenceSteps.length === 0) {
      toast.error(t.toasts.addNotes);
      return;
    }

    const transposedSteps = generateTransposedSequences(
      baseSequenceSteps,
      rootNote,
      minNote,
      maxNote,
      transpositionDirection,
      bpm
    );

    const totalDuration = transposedSteps[transposedSteps.length - 1]?.timestamp || 0;

    const sequence: Sequence = {
      id: Date.now().toString(),
      steps: transposedSteps,
      rootNote,
      minNote,
      maxNote,
      waveform,
      bpm,
      totalDuration,
      restDuration,
      transpositionDirection,
      stepCount,
    };

    onSequenceCreate(sequence);
    toast.success(t.toasts.sequenceTransmitted);
  };

  const handleClear = () => {
    setSteps(Array(stepCount).fill(null));
    setRecordedSteps([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    setIsRecording(false);
  };

  const instructorState: InstructorState = {
    isRecording,
    isPlaying,
    currentStep,
    timestamp: Date.now(),
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap size={24} weight="duotone" className="text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{t.instructor.title}</h1>
                <Badge variant="outline">{roomId}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t.instructor.subtitle}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onRoleChange}>
            <ArrowsClockwise className="mr-2" size={16} />
            {t.roles.switchRole}
          </Button>
        </div>

        <RoomPresence roomId={roomId} currentRole="instructor" t={t} instructorState={instructorState} />

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MusicNote size={20} weight="duotone" />
            <h2 className="text-lg font-semibold">{t.instructor.sequenceConfig}</h2>
          </div>

          <div className="mb-6">
            <RangeIndicator minNote={minNote} maxNote={maxNote} />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>{t.instructor.rootNote}</Label>
              <Select value={rootNote} onValueChange={setRootNote}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOT_NOTES.map(note => (
                    <SelectItem key={note} value={note}>{note}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.instructor.startNote}</Label>
              <Select value={minNote} onValueChange={setMinNote}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableNotes.slice(0, availableNotes.length - 1).map(note => (
                    <SelectItem key={note} value={note}>{note}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.instructor.endNote}</Label>
              <Select value={maxNote} onValueChange={setMaxNote}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableNotes.slice(1).map(note => (
                    <SelectItem key={note} value={note}>{note}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.instructor.transpositionDirection}</Label>
              <Select value={transpositionDirection} onValueChange={(v) => setTranspositionDirection(v as TranspositionDirection)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-way">{t.instructor.oneWay}</SelectItem>
                  <SelectItem value="both-ways">{t.instructor.bothWays}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.instructor.instrument}</Label>
              <Select value={waveform} onValueChange={(v) => setWaveform(v as WaveformType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSTRUMENTS.map(inst => (
                    <SelectItem key={inst.value} value={inst.value}>{inst.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.instructor.stepCount}</Label>
              <Input
                type="number"
                value={stepCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0 && val <= 64) {
                    setStepCount(val);
                  }
                }}
                min={1}
                max={64}
                disabled={isPlaying || isRecording}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.instructor.bpm}: {bpm}</Label>
              <Slider
                value={[bpm]}
                onValueChange={([value]) => setBpm(value)}
                min={40}
                max={200}
                step={5}
                className="pt-2"
              />
            </div>

            <div className="space-y-2">
              <Label>{t.instructor.restDuration}: {restDuration}s</Label>
              <Slider
                value={[restDuration]}
                onValueChange={([value]) => setRestDuration(value)}
                min={0}
                max={10}
                step={0.5}
                className="pt-2"
              />
              <p className="text-xs text-muted-foreground">{t.instructor.restDurationDesc}</p>
            </div>
          </div>

          <Separator className="mb-6" />

          <Tabs value={mode} onValueChange={(v) => setMode(v as 'step' | 'realtime')}>
            <TabsList className="mb-4">
              <TabsTrigger value="step">{t.instructor.stepSequencer}</TabsTrigger>
              <TabsTrigger value="realtime">{t.instructor.realtimeRecording}</TabsTrigger>
            </TabsList>

            <TabsContent value="step" className="space-y-4">
              <StepSequencer
                steps={steps}
                currentStep={currentStep}
                onStepClick={handleStepClick}
                onStepClear={handleStepClear}
                availableNotes={availableNotes}
                disabled={isPlaying}
              />
            </TabsContent>

            <TabsContent value="realtime" className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{t.instructor.recordedNotes}</p>
                  <p className="text-sm text-muted-foreground">
                    {recordedSteps.length} {t.instructor.notesCaptured}
                  </p>
                </div>
                {isRecording && (
                  <Badge variant="destructive" className="animate-pulse">
                    {t.instructor.recording}
                  </Badge>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div>
            <Label className="mb-2 block">{t.instructor.pianoKeyboard}</Label>
            <PianoKeyboard
              startOctave={3}
              octaveCount={2}
              waveform={waveform}
              onNotePress={handleNotePress}
              disabled={isPlaying}
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePreview} disabled={isRecording}>
              {isPlaying ? (
                <>
                  <Stop className="mr-2" size={16} weight="fill" />
                  {t.instructor.stopPreview}
                </>
              ) : (
                <>
                  <Play className="mr-2" size={16} weight="fill" />
                  {t.instructor.preview}
                </>
              )}
            </Button>

            {mode === 'realtime' && (
              <Button
                variant={isRecording ? 'destructive' : 'secondary'}
                onClick={handleRecord}
                disabled={isPlaying}
              >
                <Record className="mr-2" size={16} weight={isRecording ? 'fill' : 'regular'} />
                {isRecording ? t.instructor.stopRecording : t.instructor.record}
              </Button>
            )}

            <Button variant="outline" onClick={handleClear} disabled={isPlaying || isRecording}>
              {t.instructor.clear}
            </Button>

            <div className="flex-1" />

            <Button onClick={handleTransmit} disabled={isPlaying || isRecording} className="bg-primary">
              {t.instructor.transmit}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}