import { useState, useEffect } from "react";
import type { User } from "@/types/types";

const getCookie = (name: string) => {
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const found = cookies.find((c) => c.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split("=")[1]) : null;
};

// tipagem para o payload do JWT
interface JwtPayload {
  user?: User;
  id?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as JwtPayload;
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
      if (decoded && decoded.user) setSession({ user: decoded.user });
      else setSession(null);
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