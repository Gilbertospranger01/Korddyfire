import { useState, useEffect } from "react";
import type { User } from "@/types/types";

const getCookie = (name: string) => {
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const found = cookies.find((c) => c.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split("=")[1]) : null;
};

export function useAuth() {
  const [session, setSession] = useState<{ user: User } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const token = getCookie("auth_token");

    if (token && storedUser) {
      setSession({ user: JSON.parse(storedUser) });
    } else {
      setSession(null);
    }
  }, []);

  const logout = () => {
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=None";
    localStorage.removeItem("auth_user");
    setSession(null);
  };

  return { session, logout };
}