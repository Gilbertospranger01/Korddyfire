import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import type { User } from "@/types/types";

const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1] ?? null;

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
  user?: User;
}

export function useAuth() {
  const [session, setSession] = useState<{ user: User } | null>(null);

  useEffect(() => {
    const token = getCookie("auth_token");
    if (token) {
      try {
        const decoded = jwt_decode<JwtPayload>(token);
        // se você enviou user dentro do token
        if (decoded.user) {
          setSession({ user: decoded.user });
        } else {
          // ou buscar do localStorage / cookie
          setSession({ user: {} as User }); // fallback
        }
      } catch (err) {
        console.error("Erro ao decodificar token", err);
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