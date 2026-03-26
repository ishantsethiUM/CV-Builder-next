import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Templates — FitRezume",
  description: "Browse professional CV templates designed to pass ATS systems and impress recruiters.",
};
export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
