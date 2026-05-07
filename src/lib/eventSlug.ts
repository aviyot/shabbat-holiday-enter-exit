import type { ShabatEnteExit } from "./types";

export function toEventSlug(record: ShabatEnteExit): string {
  const year = new Date(record.date).getFullYear();
  return `${record.type}-${record.parasha}-${year}`;
}

export function findBySlug(records: ShabatEnteExit[], slug: string): number {
  return records.findIndex((r) => toEventSlug(r) === slug);
}
