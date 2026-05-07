import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "כניסת ויציאת שבת וחג",
  description:
    "זמני כניסה ויציאת שבתות וחגים לערים ירושלים, תל אביב, באר שבע וחיפה",
  manifest: "/manifest.webmanifest",
  themeColor: "#1976d2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "כניסה יציאה שבת",
  },
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
          opacity: 0.9,
          rowGap: "8px",
          textAlign: "right",
          backgroundColor: "black",
          color: "white",
        }}
      >
        {children}
      </body>
    </html>
  );
}
