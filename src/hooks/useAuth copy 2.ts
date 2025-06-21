import api from "@/utils/api";
import { useEffect, useState } from "react";

export function useAuth() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/getSession", {
          withCredentials: true,
        });
        setSession(data.user);
        console.log("Session", data.user)
      } catch (error) {
        console.error("Erro ao buscar sessão:", error);
        console.log("Error", session)
        setSession(null);
      }
    };

    fetchSession();
  }, []);

  const logout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
      setSession(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return { session, logout };

}
