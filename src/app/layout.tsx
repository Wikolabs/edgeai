import type { Metadata } from "next";
import { Share_Tech_Mono, Rajdhani } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-display", display: "swap" });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "EdgeAI — L'IA qui tourne là où il n'y a pas d'internet",
  description: "Inférence IA embarquée sur Raspberry Pi, Jetson, STM32 et microcontrôleurs. Latence < 10ms, zéro cloud.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${shareTechMono.variable} ${rajdhani.variable}`}>
      <body style={{ fontFamily: "var(--font-body)", background: "#f8fafc" }}>{children}</body>
    </html>
  );
}
