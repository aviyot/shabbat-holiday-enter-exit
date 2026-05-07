"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";
import type { ShabatEnteExit } from "@/lib/types";
import { formatHM } from "@/lib/hm";
import { toHebWeek } from "@/lib/hebWeek";

const LS_KEY = "shabatHolidyTime";
const LS_KEY_DATE = "shabatHolidyTime_lastUpdate";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function findFutureIndex(records: ShabatEnteExit[]): number {
  return records.findIndex(
    (val) => new Date(val.date).getTime() > Date.now() - 86400000,
  );
}

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

export default function HomePage() {
  const [records, setRecords] = useState<ShabatEnteExit[]>([]);
  const [futureEventIndex, setFutureEventIndex] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [fromLocal, setFromLocal] = useState(false);

  const applyRecords = useCallback(
    (newRecords: ShabatEnteExit[], local: boolean) => {
      const fi = findFutureIndex(newRecords);
      setRecords(newRecords);
      setFutureEventIndex(fi);
      setEventIndex(fi);
      setDataLoaded(true);
      setFromLocal(local);
    },
    [],
  );

  const fetchFromServer = useCallback(async (): Promise<ShabatEnteExit[]> => {
    const res = await fetch("/api/shabat");
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    const lastUpdateStr = localStorage.getItem(LS_KEY_DATE);

    if (stored) {
      const parsed: ShabatEnteExit[] = JSON.parse(stored);
      applyRecords(parsed, true);

      const lastUpdate = lastUpdateStr ? new Date(lastUpdateStr).getTime() : 0;
      if (Date.now() - lastUpdate > ONE_WEEK_MS) {
        fetchFromServer()
          .then((fresh) => {
            localStorage.setItem(LS_KEY, JSON.stringify(fresh));
            localStorage.setItem(LS_KEY_DATE, new Date().toISOString());
            applyRecords(fresh, false);
          })
          .catch(console.error);
      }
    } else {
      fetchFromServer()
        .then((fresh) => {
          localStorage.setItem(LS_KEY, JSON.stringify(fresh));
          localStorage.setItem(LS_KEY_DATE, new Date().toISOString());
          applyRecords(fresh, false);
        })
        .catch(console.error);
    }
  }, [applyRecords, fetchFromServer]);

  const eventPosition = eventIndex - futureEventIndex;
  const currentEvent = records[eventIndex];

  function goNext() {
    setEventIndex((i) => Math.min(i + 1, records.length - 1));
  }
  function goBack() {
    setEventIndex((i) => Math.max(i - 1, 0));
  }
  function goNear() {
    setEventIndex(futureEventIndex);
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
      url: "https://shabbat-holiday-enter-exit.vercel.app/",
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
        <button onClick={goNext}>
          <span>הבא</span>
          {eventPosition > 0 && (
            <span className={styles.badge}>{eventPosition}</span>
          )}
        </button>
        <button onClick={goNear}>
          <span>מועד הקרוב</span>
        </button>
        <button onClick={goBack}>
          <span>הקודם</span>
          {eventPosition < 0 && (
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
                <span>{formatDate(currentEvent.date)}</span>
                <span style={{ padding: "0 0.5rem" }}> </span>
                <span>{currentEvent.heb_date}</span>
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
