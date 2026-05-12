import { cacheLife } from "next/cache";
import type { ShabatEnteExit } from "./types";

const API_URL =
  "https://data.gov.il/api/3/action/datastore_search?resource_id=cfe1dd76-a7f8-453a-aa42-88e5db30d567&limit=9999";

export async function fetchShabatData(): Promise<ShabatEnteExit[]> {
  "use cache";
  cacheLife("weeks");

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch from data.gov.il");

  const json = (await res.json()) as {
    success: boolean;
    result: { records: ShabatEnteExit[] };
  };

  if (!json.success) throw new Error("data.gov.il returned success=false");

  return json.result.records.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}
