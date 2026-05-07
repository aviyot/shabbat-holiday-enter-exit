/** Returns only HH:MM from a time string like "18:30:00" */
export function formatHM(value: string): string {
  return value.slice(0, 5);
}
