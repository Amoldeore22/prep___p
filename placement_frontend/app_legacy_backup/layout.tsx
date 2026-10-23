import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepPilot — Placement Preparation",
  description: "Your personal workspace for DSA, aptitude, interviews and placement progress.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
