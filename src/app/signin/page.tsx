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

  // Atualiza formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Login com email/senha
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

  // Login OAuth
  const handleOAuthLogin = async (provider: "google" | "facebook" | "github") => {
    try {
      await signIn(provider, { callbackUrl: "/home" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao fazer login.");
    }
  };

  // Detecta status online/offline
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
    <div className="flex flex-col md:flex-row w-full h-screen bg-gray-100 overflow-auto">
      
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-950 p-6">
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md flex flex-col justify-center items-center bg-gray-950 p-6 md:p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Sign In
          </h2>

          <form className="w-full" onSubmit={handleSignIn}>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-white text-sm font-bold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                aria-label="Email"
                className="bg-gray-800 shadow border rounded w-full py-3 px-4 text-white focus:outline-none focus:shadow-outline"
                placeholder="Digite seu email"
                required
              />
            </div>

            {/* Password */}
            <Input
              name="password"
              icon={<FaLock />}
              value={formData.password}
              onChange={handleChange}
              className="w-full mb-3"
              eye
              placeholder="Digite sua senha"
              required
            />

            {/* Forgot password & submit */}
            <div className="flex flex-col space-y-4 mt-4">
              <p className="text-white text-xs text-right">
                Esqueceu a senha?{" "}
                <Link
                  href="/user/recover_password"
                  className="text-blue-400 hover:text-blue-600 ml-2"
                >
                  Recuperar
                </Link>
              </p>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded focus:outline-none focus:shadow-outline"
              >
                Entrar
              </button>
            </div>
          </form>

          {/* Error */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Signup link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Não tem uma conta?{" "}
            <Link
              href="/signup"
              className="text-blue-400 hover:text-blue-600"
            >
              Criar conta
            </Link>
          </p>

          {/* OAuth */}
          <div className="flex flex-col items-center mt-4 mb-10">
            <p className="text-gray-600 text-sm mb-2">Ou entre com</p>
            <div className="flex space-x-6">
              <button
                onClick={() => handleOAuthLogin("google")}
                className="text-white"
                aria-label="Entrar com Google"
              >
                <FcGoogle size={30} />
              </button>
              <button
                onClick={() => handleOAuthLogin("facebook")}
                className="text-blue-600"
                aria-label="Entrar com Facebook"
              >
                <FaFacebook size={30} />
              </button>
              <button
                onClick={() => handleOAuthLogin("github")}
                className="text-white"
                aria-label="Entrar com GitHub"
              >
                <FaGithub size={30} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Section */}
      <div className="w-full md:w-1/2 h-64 md:h-full flex justify-center items-center bg-cover bg-center overflow-hidden">
        <BackgroundImage />
      </div>
    </div>
  );
}