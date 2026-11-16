"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { toEventSlug, findBySlug } from "@/lib/eventSlug";
import type { ShabatEnteExit } from "@/lib/types";
import { formatHM } from "@/lib/hm";
import { toHebWeek } from "@/lib/hebWeek";

const LS_KEY = "shabatHolidyTime";
const LS_KEY_DATE = "shabatHolidyTime_lastUpdate";

function isShabatRecord(value: unknown): value is ShabatEnteExit {
  if (typeof value !== "object" || value === null) return false;
  return (
    "heb_date" in value && typeof value.heb_date === "string" &&
    "date" in value && typeof value.date === "string" &&
    Number.isFinite(new Date(value.date).getTime()) &&
    "parasha" in value && typeof value.parasha === "string" &&
    "type" in value && typeof value.type === "string" &&
    "Jerusalem_in" in value && typeof value.Jerusalem_in === "string" &&
    "Jerusalem_out" in value && typeof value.Jerusalem_out === "string" &&
    "TelAviv_in" in value && typeof value.TelAviv_in === "string" &&
    "TelAviv_out" in value && typeof value.TelAviv_out === "string" &&
    "BeerSheva_in" in value && typeof value.BeerSheva_in === "string" &&
    "BeerSheva_out" in value && typeof value.BeerSheva_out === "string" &&
    "Hayfa_in" in value && typeof value.Hayfa_in === "string" &&
    "Hayfa_out" in value && typeof value.Hayfa_out === "string"
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

interface Props {
  records: ShabatEnteExit[];
}

export default function EventViewer({ records: serverRecords }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<ShabatEnteExit[]>(serverRecords);
  const [futureEventIndex, setFutureEventIndex] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [fromLocal, setFromLocal] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [storageNotice, setStorageNotice] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [manualShareText, setManualShareText] = useState("");

  useEffect(() => {
    const computeFutureIndex = (recs: ShabatEnteExit[]) =>
      Math.max(
        0,
        recs.findIndex(
          (r) => new Date(r.date).getTime() > Date.now() - 86400000,
        ),
      );

    if (serverRecords.length > 0) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(serverRecords));
        localStorage.setItem(LS_KEY_DATE, new Date().toISOString());
      } catch (error) {
        console.error("Failed to save Shabbat data locally", error);
        setStorageNotice("המידע מוצג, אך לא ניתן לשמור עותק במכשיר לשימוש ללא רשת.");
      }

      const fi = computeFutureIndex(serverRecords);
      const event = searchParams.get("event");
      const slugIndex = event ? findBySlug(serverRecords, event) : -1;
      const initial = slugIndex >= 0 ? slugIndex : fi;

      setFutureEventIndex(fi);
      setEventIndex(initial);
    } else {
      try {
        const stored = localStorage.getItem(LS_KEY);
        if (!stored) throw new Error("No locally saved Shabbat data");
        const parsed: unknown = JSON.parse(stored);
        if (
          !Array.isArray(parsed) ||
          parsed.length === 0 ||
          !parsed.every(isShabatRecord)
        ) {
          throw new Error("Invalid locally saved Shabbat data");
        }
        const fi = computeFutureIndex(parsed);
        const event = searchParams.get("event");
        const slugIndex = event ? findBySlug(parsed, event) : -1;
        const initial = slugIndex >= 0 ? slugIndex : fi;
        setRecords(parsed);
        setFutureEventIndex(fi);
        setEventIndex(initial);
        router.replace(`/?event=${toEventSlug(parsed[initial])}`, { scroll: false });
        setFromLocal(true);
      } catch (error) {
        console.error("Failed to load locally saved Shabbat data", error);
        setLoadError("לא ניתן לטעון את זמני השבת והחג. בדקו את החיבור לאינטרנט ונסו שוב.");
      }
    }
    setDataLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventPosition = eventIndex - futureEventIndex;
  const currentEvent = records[eventIndex];

  function navigate(newIndex: number) {
    if (!dataLoaded || !records[newIndex]) return;
    setShareMessage("");
    setManualShareText("");
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

  async function share() {
    if (!dataLoaded || !currentEvent) return;
    setShareMessage("");
    setManualShareText("");
    const eventName = currentEvent.type === "שבת"
      ? `שבת — פרשת ${currentEvent.parasha}`
      : `${currentEvent.type} — ${currentEvent.parasha}`;
    const message = `🕯️ זמני ${eventName}
${currentEvent.heb_date} · ${formatDate(currentEvent.date)}

📍 ירושלים
כניסה: ${formatHM(currentEvent.Jerusalem_in)} · יציאה: ${formatHM(currentEvent.Jerusalem_out)}

📍 תל אביב
כניסה: ${formatHM(currentEvent.TelAviv_in)} · יציאה: ${formatHM(currentEvent.TelAviv_out)}

📍 באר שבע
כניסה: ${formatHM(currentEvent.BeerSheva_in)} · יציאה: ${formatHM(currentEvent.BeerSheva_out)}

📍 חיפה
כניסה: ${formatHM(currentEvent.Hayfa_in)} · יציאה: ${formatHM(currentEvent.Hayfa_out)}`;

    const url = new URL(window.location.href);
    url.searchParams.set("event", toEventSlug(currentEvent));
    const shareData: ShareData = {
      title: "זמני כניסה ויציאת שבתות וחגים",
      text: message,
      url: url.href,
    };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Failed to share Shabbat times", error);
      }
    }

    const text = `${message}\n\n${url.href}`;
    if (typeof navigator.clipboard?.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        setShareMessage("הזמנים והקישור הועתקו ללוח.");
        return;
      } catch (error) {
        console.error("Failed to copy Shabbat times", error);
      }
    }
    setManualShareText(text);
    setShareMessage("השיתוף או ההעתקה האוטומטית אינם זמינים. ניתן להעתיק את הטקסט הבא ידנית.");
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
        <button onClick={goBack} disabled={!dataLoaded || !currentEvent}>
          <span>הקודם</span>
          {eventPosition < 0 && (
            <span className={styles.badge}>{eventPosition}</span>
          )}
        </button>
        <button onClick={goNear} disabled={!dataLoaded || !currentEvent}>
          <span>מועד הקרוב</span>
        </button>
        <button onClick={goNext} disabled={!dataLoaded || !currentEvent}>
          <span>הבא</span>
          {eventPosition > 0 && (
            <span className={styles.badge}>{eventPosition}</span>
          )}
        </button>
      </nav>

      <main className={styles.main}>
        {storageNotice && <p className={styles.notice} role="status">{storageNotice}</p>}
        {loadError ? (
          <div className={styles.notice}>
            <p role="alert">{loadError}</p>
            <button onClick={() => window.location.reload()}>נסה שוב</button>
          </div>
        ) : dataLoaded && currentEvent ? (
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

      <div className={styles.shareArea}>
        <button className={styles.shareBtn} onClick={share} disabled={!dataLoaded || !currentEvent}>
          שתף
        </button>
        <p className={styles.shareMessage} role="status">{shareMessage}</p>
        {manualShareText && (
          <textarea
            className={styles.shareText}
            aria-label="טקסט לשיתוף בהעתקה ידנית"
            readOnly
            value={manualShareText}
            rows={10}
            onFocus={(event) => event.currentTarget.select()}
          />
        )}
      </div>

      {dataLoaded && currentEvent && (
        <footer className={styles.footer}>
          <span className={fromLocal ? styles.sourceLocal : styles.sourceFresh}>
            המידע נלקח מ{" "}
          </span>
          <a
            className={styles.hLink}
            href="https://data.gov.il/he/datasets?orgs=religion-office"
            target="_blank"
            rel="noopener noreferrer"
          >
            המשרד לשירותי הדת
          </a>
          {fromLocal && <span> (עותק שמור במכשיר; לא ניתן לטעון מידע מהשרת)</span>}
        </footer>
      )}
    </>
  );
}
