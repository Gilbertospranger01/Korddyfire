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

type Product = { id: string; name: string; price: number; stock: number; image?: string; };
type User = { id: string; name: string; };

const Header = () => {
  const { session } = useAuth();
  const router = useRouter();
  const { showSidebar, setShowSidebar } = useSidebar();

  const [products, setProducts] = useState<Product[]>([]);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("Usuário");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await api.get("/wallets");
      setBalance(res.data.balance ?? 0);
    } catch (err) {
      console.error("Erro ao buscar saldo", err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar produtos", err);
    }
  }, []);

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
      setProducts(res.data || []);
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
    setLoading(true);
    fetchBalance();
    fetchProducts();
    fetchUserProfile();
    setLoading(false);
  }, [fetchBalance, fetchProducts, fetchUserProfile]);

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
        <div className="max-w-[1280px] mx-auto flex justify-between items-center px-4 py-3 md:py-2">
          <Link href="/home">
            <h1 className="text-xl sm:text-2xl font-bold">Korddyfire</h1>
          </Link>

          <div className="flex-1 px-4 md:px-6">
            <InputSearch
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
              onClear={() => { setSearchTerm(""); setResults([]); }}
            />
            {loading && (
              <div className="absolute w-full text-white h-20 shadow-lg mt-2 z-50 flex items-center justify-center">
                <p className="text-gray-400 text-center">Carregando...</p>
              </div>
            )}
            {!loading && searchTerm.trim() && results.length === 0 && (
              <div className="absolute w-full text-white shadow-lg mt-2 z-50 flex items-center justify-center">
                <p className="text-gray-400 text-center">Nenhum resultado encontrado.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => router.push("/chat")} className="text-xl md:text-2xl">
              <IoChatboxEllipses size={30} />
            </button>
            <ButtonTheme />
            <p className="hidden md:block text-blue-600">{username}</p>
            <button
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-500 overflow-hidden"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {profilePicture ? (
                <Image src={profilePicture} alt="Profile" width={56} height={56} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;