import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Placement Preparation Platform | Master Campus Technical Placements",
  description:
    "End-to-end full-stack technical placement preparation platform featuring exact workbook-mapped DSA patterns, interactive algorithm visualizers, daily 10-question aptitude assessments, interview prep, and verified company hiring drives.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#121316] text-zinc-100 m-0 p-0">{children}</body>
    </html>
  );
}

