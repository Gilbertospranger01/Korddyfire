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

  const handleOAuthLogin = async (provider: "google" | "facebook" | "github") => {
    try {
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
      {/* Background só aparece em desktop */}
      <div className="hidden md:flex md:w-1/2 h-full">
        <BackgroundImage />
      </div>

      {/* Form Section - ocupa toda largura em mobile */}
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

          <div className="flex flex-col items-center mt-4 mb-10">
            <p className="text-gray-600 text-sm mb-2">Ou entre com</p>
            <div className="flex space-x-6">
              <button onClick={() => handleOAuthLogin("google")} className="text-white" aria-label="Entrar com Google">
                <FcGoogle size={30} />
              </button>
              <button onClick={() => handleOAuthLogin("facebook")} className="text-blue-600" aria-label="Entrar com Facebook">
                <FaFacebook size={30} />
              </button>
              <button onClick={() => handleOAuthLogin("github")} className="text-white" aria-label="Entrar com GitHub">
                <FaGithub size={30} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}