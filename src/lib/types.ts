import { WaveformType } from './audioEngine';

export type Role = 'instructor' | 'student' | null;

export interface SequenceStep {
  note: string;
  timestamp: number;
  duration: number;
}

export interface Sequence {
  id: string;
  steps: SequenceStep[];
  rootNote: string;
  minNote: string;
  maxNote: string;
  waveform: WaveformType;
  bpm: number;
  totalDuration: number;
}

export interface AppState {
  role: Role;
  currentSequence: Sequence | null;
  isPlaying: boolean;
  isRecording: boolean;
  currentStep: number;
}