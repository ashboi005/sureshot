import { atom } from 'jotai';

// Doctor ID atom to store the doctor's unique identifier
export const doctorIdAtom = atom<string | null>(null);

// Doctor details atom for storing additional information if needed
export const doctorDetailsAtom = atom<{
  doctorId: string;
  specialization?: string;
  hospitalAffiliation?: string;
} | null>(null);
