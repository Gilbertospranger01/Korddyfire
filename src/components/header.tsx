"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/sidebarcontext";
import Sidebar from "./sidebar";
import InputSearch from "./input-search";
import { IoChatboxEllipses } from "react-icons/io5";
import ButtonTheme from "../app/buttonTheme";
import api from "@/utils/api";

type User = { id: string; name: string };

const Header = () => {
  const { session } = useAuth();
  const router = useRouter();
  const { showSidebar, setShowSidebar } = useSidebar();

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("Usuário");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await api.get("/user");
      setUsername(res.data.username || "Usuário");
      setProfilePicture(res.data.picture || null);
    } catch (err) {
      console.error("Erro ao buscar perfil", err);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/products/${searchTerm}`);
      setResults(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar produtos filtrados", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delay = setTimeout(() => handleSearch(), 500);
    return () => clearTimeout(delay);
  }, [searchTerm, handleSearch]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (!session)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white text-2xl animate-pulse">Carregando...</p>
      </div>
    );

  return (
    <div>
      <Sidebar />
      <header className="w-full fixed top-0 left-0 z-50 border-b border-gray-300 bg-white dark:bg-gray-900 text-black dark:text-white">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between px-4 py-2 gap-2">

          {/* Linha superior: Logo + User Actions */}
          <div className="flex justify-between items-center w-full md:w-auto">
            <Link href="/home">
              <h1 className="text-lg sm:text-xl font-bold cursor-pointer">Korddyfire</h1>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => router.push("/chat")} className="text-xl sm:text-2xl">
                <IoChatboxEllipses size={28} />
              </button>
              <ButtonTheme />
              <p className="hidden md:block text-blue-600 text-sm">{username}</p>
              <button
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-500 overflow-hidden"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Linha inferior: Search */}
          <div className="w-full mt-2 md:mt-0 md:flex-1 md:max-w-[400px] relative">
            <InputSearch
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
              onClear={() => {
                setSearchTerm("");
                setResults([]);
              }}
              className="w-full"
            />

            {loading && (
              <div className="absolute w-full text-white h-20 shadow-lg mt-2 z-50 flex items-center justify-center rounded-lg bg-gray-800">
                <p className="text-gray-400 text-center">Carregando...</p>
              </div>
            )}
            {!loading && searchTerm.trim() && results.length === 0 && (
              <div className="absolute w-full text-white shadow-lg mt-2 z-50 flex items-center justify-center rounded-lg bg-gray-800">
                <p className="text-gray-400 text-center">Nenhum resultado encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;