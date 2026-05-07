import { NextResponse } from "next/server";
import { fetchShabatData } from "@/lib/fetchShabatData";

export async function GET() {
  try {
    const records = await fetchShabatData();
    return NextResponse.json(records);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 502 },
    );
  }
}
