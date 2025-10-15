import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { PianoKeyboard } from './PianoKeyboard';
import { StepSequencer } from './StepSequencer';
import { Play, Stop, Record, ArrowsClockwise, GraduationCap, MusicNote } from '@phosphor-icons/react';
import { Sequence, SequenceStep } from '@/lib/types';
import { getNotesBetween, playNoteByName, resumeAudioContext, WaveformType } from '@/lib/audioEngine';
import { toast } from 'sonner';

interface InstructorViewProps {
  onRoleChange: () => void;
  onSequenceCreate: (sequence: Sequence) => void;
}

const WAVEFORMS: WaveformType[] = ['sine', 'square', 'triangle', 'sawtooth'];
const ROOT_NOTES = ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4'];
const DEFAULT_STEPS = 16;

export function InstructorView({ onRoleChange, onSequenceCreate }: InstructorViewProps) {
  const [mode, setMode] = useState<'step' | 'realtime'>('step');
  const [rootNote, setRootNote] = useState('C3');
  const [minNote, setMinNote] = useState('E3');
  const [maxNote, setMaxNote] = useState('E5');
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  const [bpm, setBpm] = useState(120);
  
  const [steps, setSteps] = useState<Array<string | null>>(Array(DEFAULT_STEPS).fill(null));
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<SequenceStep[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const availableNotes = getNotesBetween(minNote, maxNote);

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  const handleStepClick = (stepIndex: number, note: string) => {
    const newSteps = [...steps];
    newSteps[stepIndex] = note;
    setSteps(newSteps);
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
      toast.error('Add some notes first!');
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
      toast.success(`Recorded ${recordedSteps.length} notes`);
      return;
    }

    setRecordedSteps([]);
    setIsRecording(true);
    recordStartTimeRef.current = Date.now();
    toast.info('Recording started - play notes on keyboard');
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
    let sequenceSteps: SequenceStep[];
    let totalDuration: number;

    if (mode === 'step') {
      const stepDuration = (60 / bpm) * 1000 / 4;
      sequenceSteps = steps
        .map((note, index) => 
          note ? { note, timestamp: index * stepDuration, duration: 0.3 } : null
        )
        .filter((s): s is SequenceStep => s !== null);
      totalDuration = steps.length * stepDuration;
    } else {
      sequenceSteps = recordedSteps;
      totalDuration = recordedSteps[recordedSteps.length - 1]?.timestamp || 0;
    }

    if (sequenceSteps.length === 0) {
      toast.error('Create a sequence first!');
      return;
    }

    const sequence: Sequence = {
      id: Date.now().toString(),
      steps: sequenceSteps,
      rootNote,
      minNote,
      maxNote,
      waveform,
      bpm,
      totalDuration
    };

    onSequenceCreate(sequence);
    toast.success('Sequence transmitted to student!');
  };

  const handleClear = () => {
    setSteps(Array(DEFAULT_STEPS).fill(null));
    setRecordedSteps([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap size={24} weight="duotone" className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Instructor Mode</h1>
              <p className="text-sm text-muted-foreground">Create and transmit vocal exercises</p>
            </div>
          </div>
          <Button variant="outline" onClick={onRoleChange}>
            <ArrowsClockwise className="mr-2" size={16} />
            Switch Role
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MusicNote size={20} weight="duotone" />
            <h2 className="text-lg font-semibold">Sequence Configuration</h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Root Note</Label>
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
              <Label>Min Note</Label>
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
              <Label>Max Note</Label>
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
              <Label>Waveform</Label>
              <Select value={waveform} onValueChange={(v) => setWaveform(v as WaveformType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WAVEFORMS.map(w => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="mb-6" />

          <Tabs value={mode} onValueChange={(v) => setMode(v as 'step' | 'realtime')}>
            <TabsList className="mb-4">
              <TabsTrigger value="step">Step Sequencer</TabsTrigger>
              <TabsTrigger value="realtime">Real-time Recording</TabsTrigger>
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
                  <p className="font-medium">Recorded Notes</p>
                  <p className="text-sm text-muted-foreground">
                    {recordedSteps.length} notes captured
                  </p>
                </div>
                {isRecording && (
                  <Badge variant="destructive" className="animate-pulse">
                    Recording...
                  </Badge>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div>
            <Label className="mb-2 block">Piano Keyboard</Label>
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
                  Stop Preview
                </>
              ) : (
                <>
                  <Play className="mr-2" size={16} weight="fill" />
                  Preview
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
                {isRecording ? 'Stop Recording' : 'Record'}
              </Button>
            )}

            <Button variant="outline" onClick={handleClear} disabled={isPlaying || isRecording}>
              Clear
            </Button>

            <div className="flex-1" />

            <Button onClick={handleTransmit} disabled={isPlaying || isRecording} className="bg-primary">
              Transmit to Student
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}