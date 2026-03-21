"use client";
import { useEffect, useState } from "react";
import { getMe, token } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan?: string;
  image?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tk = token.get();
    if (!tk) { setLoading(false); return; }
    getMe()
      .then(setUser)
      .catch(() => { token.del(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, isLoggedIn: !!user };
}
