// useAuth hook
import { useState, useEffect } from "react";
import type { User } from "@/types/types";

// helper para ler cookie
const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1] ?? null;

export function useAuth() {
  const [session, setSession] = useState<{ user: User } | null>(null);

  useEffect(() => {
    // aqui pegamos o token e, se existir, assumimos que há sessão
    const token = getCookie("auth_token");
    if (token) {
      // se precisares de dados do user, podes decodificar JWT ou armazenar user no cookie
      // para simplicidade, deixamos session como presente se houver token
      setSession({ user: {} as User }); // placeholder vazio, token existe
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