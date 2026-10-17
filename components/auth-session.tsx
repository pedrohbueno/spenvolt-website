"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "token";
const EXPIRATION_KEY = "token_expiration";
// setTimeout estoura acima de 2^31-1 ms (~24,8 dias)
const MAX_TIMEOUT = 2_147_483_647;

function getRemainingTime(): number {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expirationValue = sessionStorage.getItem(EXPIRATION_KEY);
    if (!token || !expirationValue) return 0;

    const expiration = Number(expirationValue);
    if (!Number.isFinite(expiration)) return 0;

    return Math.max(expiration - Date.now(), 0);
  } catch {
    return 0;
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRATION_KEY);
  } catch {}
}

export default function AuthSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    function logout() {
      clearSession();
      setAuthenticated(false);
      router.replace("/login");
    }

    function check() {
      const remaining = getRemainingTime();
      if (remaining <= 0) {
        logout();
        return;
      }
      setAuthenticated(true);
      timer = setTimeout(check, Math.min(remaining, MAX_TIMEOUT));
    }

    check();
    return () => clearTimeout(timer);
  }, [router]);

  return <div hidden={!authenticated}>{children}</div>;
}