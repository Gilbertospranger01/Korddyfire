import { useState, useEffect } from "react";
import type { User } from "@/types/types";

const getCookie = (name: string) => {
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const found = cookies.find((c) => c.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split("=")[1]) : null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Pega o usuário do localStorage
    const storedUser = localStorage.getItem("auth_user");
    const token = getCookie("auth_token");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  const logout = () => {
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=None";
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return { user, logout };
}