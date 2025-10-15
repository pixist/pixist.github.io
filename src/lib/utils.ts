import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SequenceStep, TranspositionDirection, Sequence } from './types'
import { transposeNote, getSemitonesBetween } from './audioEngine'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTransposedSequences(
  baseSteps: SequenceStep[],
  rootNote: string,
  startNote: string,
  endNote: string,
  direction: TranspositionDirection,
  bpm: number
): SequenceStep[] {
  const transpositions: number[] = [];
  const startSemitones = getSemitonesBetween(rootNote, startNote);
  const endSemitones = getSemitonesBetween(rootNote, endNote);
  
  if (direction === 'one-way') {
    for (let i = startSemitones; i <= endSemitones; i++) {
      transpositions.push(i);
    }
  } else {
    for (let i = startSemitones; i <= endSemitones; i++) {
      transpositions.push(i);
    }
    for (let i = endSemitones - 1; i > startSemitones; i--) {
      transpositions.push(i);
    }
  }
  
  const allSteps: SequenceStep[] = [];
  const lastBaseTimestamp = baseSteps[baseSteps.length - 1]?.timestamp || 0;
  const lastBaseDuration = baseSteps[baseSteps.length - 1]?.duration || 0.3;
  const baseSequenceDuration = lastBaseTimestamp + (lastBaseDuration * 1000);
  
  transpositions.forEach((semitones, iteration) => {
    baseSteps.forEach((step) => {
      const transposedNote = transposeNote(step.note, semitones);
      const newTimestamp = iteration * baseSequenceDuration + step.timestamp;
      allSteps.push({
        note: transposedNote,
        timestamp: newTimestamp,
        duration: step.duration
      });
    });
  });
  
  return allSteps;
}
