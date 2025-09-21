import { useState, useEffect } from "react";
import api from "@/utils/api";
import type { User } from "@/types/types"; 

export function useAuth() {
  const [session, setSession] = useState<{ user: User } | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/auth/getSession");
        setSession({ user: data.user });
      } catch (error) {
        console.error("Erro ao buscar sessão:", error);
        setSession(null);
      }
    };

    fetchSession();
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      setSession(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return { session, logout };
}
