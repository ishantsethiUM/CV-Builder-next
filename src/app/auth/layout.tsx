import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign In — FitRezume",
  description: "Sign in or create your free FitRezume account to start building ATS-optimised CVs.",
};
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
