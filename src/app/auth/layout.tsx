import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign In — Folio",
  description: "Sign in or create your free Folio account to start building ATS-optimised CVs.",
};
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
