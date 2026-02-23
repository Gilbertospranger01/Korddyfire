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

type User = { id: string; name: string; picture?: string; username?: string };

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

  // PEGAR USUÁRIO IGUAL NA HOME (Cookie + LocalStorage)
  useEffect(() => {
    const token = getCookie("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
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
      <header className="w-full fixed top-0 left-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
          
          {/* Lado Esquerdo: Logo */}
          <div className="flex-shrink-0">
            <Link href="/home" className="flex items-center">
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition">
                Korddyfire
              </h1>
            </Link>
          </div>

          {/* Centro: Search Bar (Escondida em mobile muito pequeno ou ajustada) */}
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
            
            {/* Dropdown de Resultados (Opcional/Simplificado) */}
            {searchTerm.trim() && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                  <p className="p-4 text-center text-sm text-gray-500">Buscando...</p>
                ) : results.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">Nada encontrado.</p>
                ) : null}
              </div>
            )}
          </div>

          {/* Lado Direito: Ações */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => router.push("/chat")} 
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition relative"
              aria-label="Chat"
            >
              <IoChatboxEllipses size={24} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>

            <div className="hidden xs:block">
              <ButtonTheme />
            </div>

            {/* Nome do Usuário (Desktop) */}
            <div className="hidden lg:flex flex-col items-end mr-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-none">Bem-vindo,</span>
              <span className="text-sm font-bold text-gray-800 dark:text-white truncate max-w-[100px]">
                {user?.name || "Usuário"}
              </span>
            </div>

            {/* Avatar / Toggle Sidebar */}
            <button
              className="group relative flex items-center justify-center p-0.5 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 hover:shadow-lg transition-all"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-700">
                {user?.picture ? (
                  <Image
                    src={user.picture}
                    alt="Profile"
                    width={44}
                    height={44}
                    className="object-cover w-full h-full group-hover:scale-110 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold uppercase">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Barra de Busca Mobile (Apenas Visível em Telas Pequenas) */}
        <div className="sm:hidden px-4 pb-3">
          <InputSearch
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
            className="w-full"
            onClear={() => {
              setSearchTerm("");
              setResults([]);
            }}
          />
        </div>
      </header>
      
      {/* Spacer para não cobrir o conteúdo (Importante!) */}
      <div className="h-[116px] sm:h-16 md:h-20" />
    </>
  );
};

export default Header;