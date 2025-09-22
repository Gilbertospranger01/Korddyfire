import { useState, useEffect } from "react";
import type { User } from "@/types/types";

const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1] ?? null;

const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export function useAuth() {
  const [session, setSession] = useState<{ user: User } | null>(null);

  useEffect(() => {
    const token = getCookie("auth_token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        setSession({ user: decoded.user || ({} as User) });
      } else {
        setSession(null);
      }
    } else {
      setSession(null);
    }
  }, []);

  const logout = () => {
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=None";
    setSession(null);
  };

  return { session, logout };
}