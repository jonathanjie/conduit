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
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain">{children}</body>
    </html>
  );
}
