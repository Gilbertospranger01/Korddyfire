"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/sidebarcontext";
import Sidebar from "./sidebar";
import InputSearch from "./input-search";
import { IoChatboxEllipses } from "react-icons/io5";
import ButtonTheme from "../app/buttonTheme";
import api from "@/utils/api";

// Definição do tipo focada no que você precisa
type User = { id: string; username: string; picture?: string; name?: string };

const getCookie = (name: string) =>
  typeof document !== "undefined"
    ? document.cookie
        .split("; ")
        .find((c) => c.startsWith(name + "="))
        ?.split("=")[1]
    : null;

const Header = () => {
  const router = useRouter();
  const { showSidebar, setShowSidebar } = useSidebar();

  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Lógica idêntica à Home: busca do cookie e localStorage
  useEffect(() => {
    const token = getCookie("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Erro ao processar auth_user", error);
      }
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/products/${searchTerm}`);
      setResults(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar produtos", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delay = setTimeout(() => handleSearch(), 500);
    return () => clearTimeout(delay);
  }, [searchTerm, handleSearch]);

  return (
    <>
      <Sidebar />
      <header className="w-full fixed top-0 left-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/home">
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Korddyfire
              </h1>
            </Link>
          </div>

          {/* Barra de Busca - Desktop */}
          <div className="hidden sm:block flex-1 max-w-md relative">
            <InputSearch
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
              onClear={() => {
                setSearchTerm("");
                setResults([]);
              }}
            />
          </div>

          {/* Ações e Usuário */}
          <div className="flex items-center gap-2 md:gap-5">
            <button 
              onClick={() => router.push("/chat")} 
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            >
              <IoChatboxEllipses size={26} />
            </button>

            <div className="hidden xs:block">
              <ButtonTheme />
            </div>

            {/* Exibição do USERNAME (Igual ao que você pediu) */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Online</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                @{user?.username || "usuário"}
              </span>
            </div>

            {/* Avatar / Toggle Sidebar */}
            <button
              className="relative flex items-center justify-center p-0.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:ring-2 ring-green-500 transition-all"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-900">
                {user?.picture ? (
                  <Image
                    src={user.picture}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Busca Mobile (Aparece apenas em telas pequenas) */}
        <div className="sm:hidden px-4 pb-3">
          <InputSearch
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
            className="w-full"
          />
        </div>
      </header>
      
      {/* Spacer para evitar que o conteúdo suma atrás do header fixo */}
      <div className="h-[120px] sm:h-16 md:h-20" />
    </>
  );
};

export default Header;