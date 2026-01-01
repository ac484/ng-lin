// TODO: Normalize Firestore Timestamp/Date values; prefer using @angular/fire Timestamp helpers.
import { Timestamp } from '@angular/fire/firestore';

export const toDateOrNull = (value: unknown): Date | null => {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (!value) return null;
  try {
    // Accept numeric epoch or ISO string
    return new Date(value as any);
  } catch {
    return null;
  }
};
