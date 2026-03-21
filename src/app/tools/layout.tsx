import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Career Tools — Folio",
  description: "AI-powered career tools: roast your CV, simulate interviews, and match against job descriptions.",
};
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
