import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Job Matcher — FitRezume",
  description: "Compare your CV against any job description and close keyword gaps instantly.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
