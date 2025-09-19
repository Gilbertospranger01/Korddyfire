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

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
};

type User = {
  id: string;
  name: string;
};

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

  // --- Buscar saldo ---
  const fetchBalance = useCallback(async () => {
  try {
    const res = await api.get("/wallets");
    setBalance(res.data.balance ?? balance);
  } catch (err) {
    console.log(products);
    console.error("Erro ao buscar saldo", err);
  }
}, [balance, products]);

  // --- Buscar todos os produtos ---
  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Erro ao buscar produtos", err);
    }
  }, []);

  // --- Buscar perfil do usuário ---
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await api.get("/user");
      setUsername(res.data.username || "Usuário");
      setProfilePicture(res.data.picture || null);
    } catch (err) {
      console.error("Erro ao buscar perfil", err);
      router.push("/signin");
    }
  }, [router]);

  // --- Buscar produtos filtrados ---
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

  // --- Debounce na pesquisa ---
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, handleSearch]);

  // --- Fetch inicial ---
  useEffect(() => {
    setLoading(true);
    fetchBalance();
    fetchProducts();
    fetchUserProfile();
    setLoading(false);
  }, [fetchBalance, fetchProducts, fetchUserProfile]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white text-2xl animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <Sidebar />
      <header className="w-full fixed top-0 left-0 z-79 border-b pt-2 pb-2 border-gray-400 bg-white dark:bg-gray-900 text-black dark:text-white">
        <div className="container mx-auto flex justify-between items-center px-4 relative">
          {/* Logo */}
          <Link href="/home">
            <h1 className="text-2xl font-bold">Korddyfire</h1>
          </Link>

          {/* Barra de pesquisa */}
          <nav className="absolute block md:static top-full left-0 w-full md:w-auto bg-gray-900 md:flex md:space-x-10 md:items-center py-4 pl-4 pt-9 md:p-0 transition">
            <div className="w-full relative">
              <InputSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={handleSearch}
                onClear={() => {
                  setSearchTerm("");
                  setResults([]);
                }}
              />

              {loading && (
                <div className="absolute w-full text-white h-20 shadow-lg mt-2 z-50 flex items-center justify-center">
                  <p className="text-gray-400 text-center">Carregando...</p>
                </div>
              )}

              {!loading && searchTerm.trim() && (
                <div className="absolute w-full text-white shadow-lg mt-2 z-50">
                  {results.length > 0 ? (
                    <ul className="w-full">
                      {results.map((item) => (
                        <li
                          key={item.id}
                          className="p-2 border-b border-gray-700 hover:bg-gray-700"
                        >
                          <button
                            onClick={() =>
                              router.push(`/details?id=${item.id}`)
                            }
                            className="flex items-center gap-8 w-full text-left px-6 py-4 text-white transition cursor-pointer"
                          >
                            {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="absolute w-full text-white h-20 shadow-lg z-50 flex items-center justify-center">
                      <p className="text-gray-400 text-center">
                        Nenhum resultado encontrado.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Ações do usuário */}
          <div className="md:flex items-center">
            <button
              className="mr-20 cursor-pointer"
              onClick={() => router.push("/chat")}
            >
              <IoChatboxEllipses size={35} />
            </button>
            <ButtonTheme />
            <p className="hidden md:block mr-6">
              <span className="text-blue-600 ml-4 mr-8">
                {username || "No Username"}
              </span>
            </p>
            <div className="relative">
              <button
                className="w-14 h-14 flex justify-center items-center cursor-pointer rounded-full border-2 border-gray-500 focus:outline-none"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {profilePicture ? (
                  <div className="w-[46px] h-[46px] rounded-full overflow-hidden">
                    <Image
                      src={profilePicture}
                      alt="Profile Picture"
                      width={46}
                      height={46}
                      priority
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gray-700 rounded-full"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;