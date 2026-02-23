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

const Header = () => {
  const router = useRouter();
  const { showSidebar, setShowSidebar } = useSidebar();

  // Inicializamos o estado. Se for possível ler o localStorage na hora (client-side), já pegamos.
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Efeito para carregar o usuário assim que o componente monta no navegador
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("Usuário carregado:", parsedUser); // Para debug
      } catch (e) {
        console.error("Erro ao dar parse no usuário", e);
      }
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/products/${searchTerm}`);
      setResults(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar", err);
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
      <header className="w-full fixed top-0 left-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/home" className="flex-shrink-0">
            <h1 className="text-xl md:text-2xl font-black text-green-600 tracking-tighter">
              Korddyfire
            </h1>
          </Link>

          {/* Busca (Desktop) */}
          <div className="hidden md:block flex-1 max-w-[400px]">
            <InputSearch
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
              onClear={() => setSearchTerm("")}
            />
          </div>

          {/* Ações e Profile */}
          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={() => router.push("/chat")} className="text-gray-600 dark:text-gray-300 hover:text-green-500 transition">
              <IoChatboxEllipses size={26} />
            </button>
            
            <ButtonTheme />

            {/* AQUI APARECE O NOME: Garantimos que só renderiza se o user existir */}
            <div className="hidden sm:flex flex-col text-right">
               <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">User</p>
               <p className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-none">
                 {user?.name || user?.username || "Visitante"}
               </p>
            </div>

            {/* Avatar / Toggle Sidebar */}
            <button
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-green-500 p-0.5 overflow-hidden active:scale-90 transition"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {user?.picture ? (
                <Image
                  src={user.picture}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Busca (Mobile) - Aparece abaixo do header em telas pequenas */}
        <div className="md:hidden px-4 pb-3 bg-white dark:bg-gray-900">
          <InputSearch
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearch}
          />
        </div>
      </header>
      
      {/* Ajuste do Padding Top para o conteúdo não subir */}
      <div className="h-28 md:h-20" />
    </>
  );
};

export default Header;