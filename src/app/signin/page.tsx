"use client";

import React, { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaLock } from "react-icons/fa";
import BackgroundImage from "@/components/backgroundimage";
import Loadingconnection from "@/loadingpages/loadingconnection";
import api from "@/utils/api";
import Input from "@/components/ui/input";
import Image from "next/image";

export default function Signin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isOnline, setIsOnline] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/signin", formData);
      router.push("/home");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Erro ao fazer login.");
      } else {
        setError("Erro ao fazer login.");
      }
    }
  };

  const handleOAuthLogin = async (provider: "google" | "facebook" | "github" | "imlinkedy") => {
    try {
      if (provider === "imlinkedy") {
        window.location.href = "https://imlinked.vercel.app/oauth/authorize?client_id=IMLINKEDY_CLIENT_ID&redirect_uri=https://korddyfirebase.vercel.app/home&response_type=code";
        return;
      }
      await signIn(provider, { callbackUrl: "/home" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao fazer login.");
    }
  };

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!isOnline) return <Loadingconnection />;

  return (
    <div className="flex w-full h-screen bg-gray-100">
      <div className="hidden md:flex md:w-1/2 h-full">
        <BackgroundImage />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-950 p-6">
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md flex flex-col justify-center items-center bg-gray-950 p-6 md:p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign In</h2>

          <form className="w-full" onSubmit={handleSignIn}>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu email"
              className="w-full mb-3"
              required
            />
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              eye
              icon={<FaLock />}
              className="w-full mb-3"
              required
            />

            <div className="flex flex-col space-y-4 mt-4">
              <p className="text-white text-xs text-right">
                Esqueceu a senha?{" "}
                <Link href="/user/recover_password" className="text-blue-400 hover:text-blue-600 ml-2">
                  Recuperar
                </Link>
              </p>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded focus:outline-none focus:ring-2 transition-all"
              >
                Entrar
              </button>
            </div>
          </form>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <p className="text-center text-gray-400 text-sm mt-6">
            Não tem uma conta?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-600">
              Criar conta
            </Link>
          </p>

          <div className="flex flex-col items-center mt-4 mb-10 w-full">
            <div className="relative w-full my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-950 text-gray-400">Ou entre com</span>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 w-full">
              <button 
                onClick={() => handleOAuthLogin("google")} 
                className="flex items-center justify-center w-12 h-12 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-md"
                aria-label="Entrar com Google"
              >
                <FcGoogle size={24} />
              </button>
              <button 
                onClick={() => handleOAuthLogin("facebook")} 
                className="flex items-center justify-center w-12 h-12 bg-[#3b5998] rounded-full hover:bg-[#334d84] transition-colors shadow-md"
                aria-label="Entrar com Facebook"
              >
                <FaFacebook size={24} className="text-white" />
              </button>
              <button 
                onClick={() => handleOAuthLogin("github")} 
                className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors shadow-md"
                aria-label="Entrar com GitHub"
              >
                <FaGithub size={24} className="text-white" />
              </button>
              {/* Botão Imlinkedy corrigido */}
              <button
                onClick={() => handleOAuthLogin("imlinkedy")}
                className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors shadow-md"
                aria-label="Entrar com Imlinkedy"
              >
                <div className="relative w-6 h-6">
                  <Image
                    src="https://imlinked.vercel.app/favicon.png"
                    alt="Imlinkedy"
                    fill
                    className="object-contain"
                  />
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}