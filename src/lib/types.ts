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
  restDuration: number;
}

export interface AppState {
  role: Role;
  currentSequence: Sequence | null;
  isPlaying: boolean;
  isRecording: boolean;
  currentStep: number;
}

export interface RoomPresence {
  userId: string;
  role: Role;
  timestamp: number;
}

export interface StudentPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  progress: number;
  timestamp: number;
}

export interface InstructorState {
  isRecording: boolean;
  isPlaying: boolean;
  currentStep: number;
  timestamp: number;
}