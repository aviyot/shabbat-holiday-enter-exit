import { NextResponse } from "next/server";
import { unstable_cacheLife as cacheLife } from "next/cache";
import type { ShabatEnteExit } from "@/lib/types";

const API_URL =
  "https://data.gov.il/api/3/action/datastore_search?resource_id=cfe1dd76-a7f8-453a-aa42-88e5db30d567&limit=400";

export async function GET() {
  "use cache";
  cacheLife({ revalidate: 604800, expire: 604800 });

  const res = await fetch(API_URL);

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
