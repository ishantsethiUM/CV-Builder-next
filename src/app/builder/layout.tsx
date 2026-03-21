import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "CV Builder — Folio",
  description: "Build a professional, ATS-optimised CV with AI-powered suggestions and live preview.",
};
export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
