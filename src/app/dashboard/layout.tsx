import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dashboard — Folio",
  description: "Manage your CVs, track ATS scores, and access AI career tools.",
};
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
