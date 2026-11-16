import { Suspense } from "react";
import type { ShabatEnteExit } from "@/lib/types";
import { fetchShabatData } from "@/lib/fetchShabatData";
import EventViewer from "./EventViewer";

async function PageContent() {
  let records: ShabatEnteExit[];
  try {
    records = await fetchShabatData();
  } catch (error) {
    console.error("Failed to load Shabbat data", error);
    records = [];
  }

  return <EventViewer records={records} />;
}

export default function HomePage() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}
