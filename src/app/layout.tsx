import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "כניסת ויציאת שבת וחג",
  description:
    "זמני כניסה ויציאת שבתות וחגים לערים ירושלים, תל אביב, באר שבע וחיפה",
  manifest: "/manifest.webmanifest",
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
      </body>
    </html>
  );
}
