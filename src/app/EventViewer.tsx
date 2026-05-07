"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { toEventSlug } from "@/lib/eventSlug";
import type { ShabatEnteExit } from "@/lib/types";
import { formatHM } from "@/lib/hm";
import { toHebWeek } from "@/lib/hebWeek";

const LS_KEY = "shabatHolidyTime";
const LS_KEY_DATE = "shabatHolidyTime_lastUpdate";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function getDayName(dateStr: string): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date(dateStr).getDay()];
}

interface Props {
  records: ShabatEnteExit[];
  initialIndex: number;
  futureIndex: number;
}

export default function EventViewer({
  records: serverRecords,
  initialIndex,
  futureIndex,
}: Props) {
  const router = useRouter();
  const [records, setRecords] = useState<ShabatEnteExit[]>(serverRecords);
  const [futureEventIndex, setFutureEventIndex] = useState(futureIndex);
  const [eventIndex, setEventIndex] = useState(initialIndex);
  const [dataLoaded, setDataLoaded] = useState(serverRecords.length > 0);
  const [fromLocal, setFromLocal] = useState(false);

  useEffect(() => {
    if (serverRecords.length > 0) {
      // Always persist fresh server data to localStorage (for offline/PWA)
      localStorage.setItem(LS_KEY, JSON.stringify(serverRecords));
      localStorage.setItem(LS_KEY_DATE, new Date().toISOString());
    } else {
      // Offline fallback: load from localStorage
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed: ShabatEnteExit[] = JSON.parse(stored);
        const fi = Math.max(
          0,
          parsed.findIndex(
            (r) => new Date(r.date).getTime() > Date.now() - 86400000,
          ),
        );
        setRecords(parsed);
        setFutureEventIndex(fi);
        setEventIndex(fi);
        router.replace(`/?event=${toEventSlug(parsed[fi])}`, { scroll: false });
        setFromLocal(true);
        setDataLoaded(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventPosition = eventIndex - futureEventIndex;
  const currentEvent = records[eventIndex];

  function navigate(newIndex: number) {
    setEventIndex(newIndex);
    router.replace(`/?event=${toEventSlug(records[newIndex])}`, {
      scroll: false,
    });
  }

  function goNext() {
    navigate(Math.min(eventIndex + 1, records.length - 1));
  }
  function goBack() {
    navigate(Math.max(eventIndex - 1, 0));
  }
  function goNear() {
    navigate(futureEventIndex);
  }

  function share() {
    if (!currentEvent) return;
    const type = currentEvent.type === "חג" ? "" : currentEvent.type;
    const message = `${type} ${currentEvent.parasha}
${currentEvent.heb_date} - ${currentEvent.date.slice(0, 10)}

עיר     | כניסה | יציאה
ירושלים | ${formatHM(currentEvent.Jerusalem_in)} | ${formatHM(currentEvent.Jerusalem_out)}
תל אביב | ${formatHM(currentEvent.TelAviv_in)} | ${formatHM(currentEvent.TelAviv_out)}
באר שבע | ${formatHM(currentEvent.BeerSheva_in)} | ${formatHM(currentEvent.BeerSheva_out)}
חיפה    | ${formatHM(currentEvent.Hayfa_in)} | ${formatHM(currentEvent.Hayfa_out)}`;

    const shareData: ShareData = {
      title: "זמני כניסה ויציאת שבתות וחגים",
      text: message,
      url: window.location.href,
    };
    navigator.share(shareData).catch(console.error);
  }

  const isHoliday =
    currentEvent &&
    currentEvent.type !== "שבת" &&
    currentEvent.type !== "שבת חג";

  return (
    <>
      <header className={styles.header}>
        <h1>כניסת ויציאת שבת וחג</h1>
      </header>

      <nav className={styles.nav}>
        <button onClick={goBack}>
          <span>הקודם</span>
          {eventPosition < 0 && (
            <span className={styles.badge}>{eventPosition}</span>
          )}
        </button>
        <button onClick={goNear}>
          <span>מועד הקרוב</span>
        </button>
        <button onClick={goNext}>
          <span>הבא</span>
          {eventPosition > 0 && (
            <span className={styles.badge}>{eventPosition}</span>
          )}
        </button>
      </nav>

      <main className={styles.main}>
        {dataLoaded && currentEvent ? (
          <section>
            <header
              className={
                eventIndex === futureEventIndex
                  ? styles.dataCaptionActive
                  : styles.dataCaption
              }
            >
              <div className={styles.dataCaptionItem}>
                <span>{currentEvent.heb_date}</span>
                <span style={{ padding: "0 0.5rem" }}> </span>
                <span>{formatDate(currentEvent.date)}</span>
              </div>
              <div className={styles.dataCaptionItem}>
                {currentEvent.type === "שבת" && (
                  <span>{currentEvent.type + "  פרשת "}</span>
                )}
                <span>{currentEvent.parasha} </span>
                {isHoliday && (
                  <span style={{ fontWeight: "bold" }}>
                    ({toHebWeek(getDayName(currentEvent.date))})
                  </span>
                )}
              </div>
            </header>

            <div className={styles.data}>
              <div className={`${styles.dataItem} ${styles.city}`}>
                <span>עיר</span>
                <span>ירושלים</span>
                <span>תל אביב</span>
                <span>באר שבע</span>
                <span>חיפה</span>
              </div>
              <div className={`${styles.dataItem} ${styles.enter}`}>
                <span>כניסה</span>
                <span>{formatHM(currentEvent.Jerusalem_in)}</span>
                <span>{formatHM(currentEvent.TelAviv_in)}</span>
                <span>{formatHM(currentEvent.BeerSheva_in)}</span>
                <span>{formatHM(currentEvent.Hayfa_in)}</span>
              </div>
              <div className={`${styles.dataItem} ${styles.exit}`}>
                <span>יציאה</span>
                <span>{formatHM(currentEvent.Jerusalem_out)}</span>
                <span>{formatHM(currentEvent.TelAviv_out)}</span>
                <span>{formatHM(currentEvent.BeerSheva_out)}</span>
                <span>{formatHM(currentEvent.Hayfa_out)}</span>
              </div>
            </div>
          </section>
        ) : (
          <div className={styles.loading}>
            <span>טוען נתונים...</span>
          </div>
        )}
      </main>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button className={styles.shareBtn} onClick={share}>
          שתף
        </button>
      </div>

      {dataLoaded && (
        <footer className={styles.footer}>
          <span style={{ color: fromLocal ? "orange" : "green" }}>
            המידע נלקח מ{" "}
          </span>
          <a
            className={styles.hLink}
            href="https://data.gov.il/organization/religion-office"
            target="_blank"
            rel="noopener noreferrer"
          >
            המשרד לשירותי הדת
          </a>
        </footer>
      )}
    </>
  );
}
