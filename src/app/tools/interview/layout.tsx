import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Interview Simulator — Folio",
  description: "Practice interviews with AI-generated questions tailored to your target role.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
