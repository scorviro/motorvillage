import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOTOVILLAGE | Premium Car Workshop & Tuning",
  description: "Concourse detailing, engine blueprinting, performance tuning, and bespoke restoration for elite supercars.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
