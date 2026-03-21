import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Resume Roast — Folio",
  description: "Get brutally honest AI feedback on your CV. Find out exactly what recruiters think.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
