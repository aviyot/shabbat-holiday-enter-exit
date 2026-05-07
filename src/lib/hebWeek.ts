/** Converts English day name to Hebrew */
export function toHebWeek(weekName: string): string {
  const map: Record<string, string> = {
    Sunday: "ראשון",
    Monday: "שני",
    Tuesday: "שלישי",
    Wednesday: "רביעי",
    Thursday: "חמישי",
    Friday: "שישי",
    Saturday: "שבת",
  };
  return map[weekName] ?? weekName;
}
