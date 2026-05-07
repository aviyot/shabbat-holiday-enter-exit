import { NextResponse } from "next/server";
import type { ShabatEnteExit } from "@/lib/types";

const API_URL =
  "https://data.gov.il/api/3/action/datastore_search?resource_id=cfe1dd76-a7f8-453a-aa42-88e5db30d567&limit=400";

export const revalidate = 60 * 60 * 24 * 7; // revalidate once a week

export async function GET() {
  const res = await fetch(API_URL, { next: { revalidate } });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch data from data.gov.il" },
      { status: 502 },
    );
  }

  const json = (await res.json()) as {
    success: boolean;
    result: { records: ShabatEnteExit[] };
  };

  if (!json.success) {
    return NextResponse.json(
      { error: "data.gov.il returned success=false" },
      { status: 502 },
    );
  }

  const records = json.result.records.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return NextResponse.json(records);
}
