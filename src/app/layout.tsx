import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";  
import { CreditsProvider } from "@/contexts/CreditsContext";
import BuyCreditsModal from "@/components/BuyCreditsModal";

export const metadata: Metadata = {
  title: { default: "FitRezume — AI CV Builder", template: "%s" },
  description: "Build stunning, ATS-optimised CVs in minutes with AI-powered suggestions and professional templates.",
  keywords: ["CV builder", "resume builder", "ATS", "AI resume", "job application", "India", "campus placement", "fresher CV"],
  authors: [{ name: "FitRezume" }],
  openGraph: {
    type: "website",
    siteName: "FitRezume",
    title: "FitRezume — AI CV Builder",
    description: "Build stunning, ATS-optimised CVs in minutes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitRezume — AI CV Builder",
    description: "Build stunning, ATS-optimised CVs in minutes.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CreditsProvider>
          {children}
          <BuyCreditsModal />
        </CreditsProvider>
        <Analytics />
      </body>
    </html>
  );
}
