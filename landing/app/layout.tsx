import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conduit — Secure Communication for Tuition Centers",
  description:
    "Conduit proxies all teacher-parent communication through your Telegram bot — so parents never get your teachers' personal contact, and your operations run from a single dashboard.",
  openGraph: {
    title: "Conduit — Secure Communication for Tuition Centers",
    description:
      "Protect your teachers. Streamline every conversation. Built for Singapore tuition centers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
