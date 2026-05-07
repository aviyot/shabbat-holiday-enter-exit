import { Suspense } from "react";
import type { ShabatEnteExit } from "@/lib/types";
import { fetchShabatData } from "@/lib/fetchShabatData";
import { findBySlug } from "@/lib/eventSlug";
import EventViewer from "./EventViewer";

type Props = {
  searchParams: Promise<{ event?: string }>;
};

async function PageContent({ searchParams }: Props) {
  let records: ShabatEnteExit[];
  try {
    records = await fetchShabatData();
  } catch {
    records = [];
  }

  const { event } = await searchParams;

  const futureIndex = Math.max(
    0,
    records.findIndex(
      (r) => new Date(r.date).getTime() > Date.now() - 86400000,
    ),
  );

  const slugIndex = event ? findBySlug(records, event) : -1;
  const initialIndex = slugIndex >= 0 ? slugIndex : futureIndex;

  return (
    <EventViewer
      records={records}
      initialIndex={initialIndex}
      futureIndex={futureIndex}
    />
  );
}

export default function HomePage(props: Props) {
  return (
    <Suspense>
      <PageContent {...props} />
    </Suspense>
  );
}
