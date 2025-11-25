export enum FrequencyType {
  DAILY = 'DAILY',
  AS_NEEDED = 'AS_NEEDED',
  INTERVAL = 'INTERVAL'
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  frequency: FrequencyType;
  times: string[]; // Array of "HH:mm" strings
  color: string;
  icon: string;
}

export interface IntakeRecord {
  id: string;
  medicationId: string;
  takenAt: string; // ISO timestamp
  status: 'taken' | 'skipped';
  scheduledTime?: string; // "HH:mm"
}

export interface AIParseResult {
  name: string;
  dosage: string;
  times: string[];
  instructions: string;
}
