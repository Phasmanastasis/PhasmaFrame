// Local-ID generation and reading validation (mirrors ReadingInputValidator, #39).

export function localId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}${rand}`;
}

export interface ReadingInput {
  systolic: string;
  diastolic: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  systolic?: number;
  diastolic?: number;
}

export function validateReading(input: ReadingInput): ValidationResult {
  const errors: string[] = [];
  const systolic = Number(input.systolic);
  const diastolic = Number(input.diastolic);

  if (!Number.isInteger(systolic) || systolic < 60 || systolic > 260) {
    errors.push("Systolic must be a whole number between 60 and 260.");
  }
  if (!Number.isInteger(diastolic) || diastolic < 40 || diastolic > 160) {
    errors.push("Diastolic must be a whole number between 40 and 160.");
  }
  if (errors.length === 0 && diastolic >= systolic) {
    errors.push("Diastolic should be lower than systolic.");
  }

  return errors.length === 0
    ? { ok: true, errors, systolic, diastolic }
    : { ok: false, errors };
}
