import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "כניסת ויציאת שבת וחג",
  description:
    "זמני כניסה ויציאת שבתות וחגים לערים ירושלים, תל אביב, באר שבע וחיפה",
  keywords: [
    "שבת",
    "חג",
    "זמני כניסה",
    "זמני יציאה",
    "ירושלים",
    "תל אביב",
    "פרשת שבוע",
    "זמני שבת",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  openGraph: {
    title: "כניסת ויציאת שבת וחג",
    description:
      "זמני כניסה ויציאת שבתות וחגים לערים ירושלים, תל אביב, באר שבע וחיפה",
    locale: "he_IL",
    type: "website",
    url: "https://shabbat-holiday-enter-exit.vercel.app/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "כניסה יציאה שבת",
  },
};

export const viewport: Viewport = {
  themeColor: "#1976d2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        style={{
          display: "grid",
          gridTemplateRows: "auto auto 1fr auto auto",
          minHeight: "100dvh",
          rowGap: "8px",
          textAlign: "right",
          color: "white",
        }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
