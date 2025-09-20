"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Ícones
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaLock } from "react-icons/fa";

// Utils e serviços
import api from "@/utils/api";

// Componentes
import Input from "@/components/ui/input";
import BackgroundImage from "@/components/backgroundimage";
import Loadingconnection from "@/loadingpages/loadingconnection";

// ------------------
// Types
// ------------------
type FormData = {
  email: string;
  password: string;
};

type Provider = "google" | "facebook" | "github" | "imlinkedy";

export default function Signin() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Verifica conexão online/offline
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

  // Atualiza inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ---- Email / senha ----
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingEmail(true);

    try {
      await api.post("/auth/signin/", formData);
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoadingEmail(false);
    }
  };

  // ---- OAuth usando api ----
  const handleOAuthLogin = async (provider: Provider) => {
    setError(null);
    setLoadingProvider(provider);

    try {
      const res = await api.get(`/auth/signin-${provider}/`);
      if (res.data?.redirect_url) {
        window.location.href = res.data.redirect_url;
      } else {
        throw new Error("Resposta inválida do servidor.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar OAuth.");
      setLoadingProvider(null);
    }
  };

  if (!isOnline) return <Loadingconnection />;

  return (
    <div className="flex w-full h-screen bg-gray-100">
      {/* Lado esquerdo */}
      <div className="hidden md:flex md:w-1/2 h-full">
        <BackgroundImage />
      </div>

      {/* Lado direito */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-950 p-6">
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md flex flex-col justify-center items-center bg-gray-950 p-6 md:p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Sign In
          </h2>

          {/* Form email/senha */}
          <form className="w-full" onSubmit={handleSignIn} noValidate>
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
                Esqueceu a senha?
                <Link
                  href="/user/recover_password"
                  className="text-blue-400 hover:text-blue-600 ml-2"
                >
                  Recuperar
                </Link>
              </p>

              <button
                type="submit"
                disabled={loadingEmail || !!loadingProvider}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
                aria-busy={loadingEmail}
              >
                {loadingEmail ? "Carregando..." : "Entrar"}
              </button>
            </div>
          </form>

          {error && (
            <p role="alert" className="text-red-500 text-sm mt-2">
              {error}
            </p>
          )}

          {/* Criar conta */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Não tem uma conta?
            <Link href="/signup" className="text-blue-400 hover:text-blue-600 ml-2">
              Criar conta
            </Link>
          </p>

          {/* OAuth existente */}
          <div className="flex flex-col items-center mt-4 mb-10">
            <p className="text-gray-600 text-sm mb-2">Ou entre com</p>
            <div className="flex space-x-6">
              <button
                onClick={() => handleOAuthLogin("google")}
                title="Entrar com Google"
                disabled={loadingEmail || loadingProvider !== null}
                aria-busy={loadingProvider === "google"}
                className="focus:outline-none"
              >
                <FcGoogle size={30} />
              </button>

              <button
                onClick={() => handleOAuthLogin("facebook")}
                title="Entrar com Facebook"
                disabled={loadingEmail || loadingProvider !== null}
                aria-busy={loadingProvider === "facebook"}
                className="focus:outline-none"
              >
                <FaFacebook size={30} className="text-blue-600" />
              </button>

              <button
                onClick={() => handleOAuthLogin("github")}
                title="Entrar com GitHub"
                disabled={loadingEmail || loadingProvider !== null}
                aria-busy={loadingProvider === "github"}
                className="focus:outline-none"
              >
                <FaGithub size={30} className="text-white" />
              </button>

              <button
                onClick={() => handleOAuthLogin("imlinkedy")}
                className="relative w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 hover:bg-gray-700 focus:outline-none"
                title="Entrar com Imlinkedy"
                disabled={loadingEmail || loadingProvider !== null}
                aria-busy={loadingProvider === "imlinkedy"}
              >
                <Image
                  src="https://imlinked.vercel.app/favicon.png"
                  alt="Imlinkedy"
                  fill
                  className="object-cover"
                />
              </button>
            </div>
          </div>

          {/* --- From Korddy Section --- */}
          <div className="mt-6 text-center space-y-3 w-full">
            <p className="text-gray-400 text-sm">From Korddy</p>

            <div className="flex justify-center gap-3 flex-wrap">
              {/* Korddy Fire (imagem local) */}
              <button
                type="button"
                onClick={() => window.open("https://korddyfire.vercel.app", "_blank")}
                className="flex items-center justify-center w-12 h-12 rounded-xl border border-gray-300 hover:bg-gray-100 transition shadow-sm bg-white"
              >
                <Image
                  src="/favicon.png"
                  alt="Korddy Fire"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </button>

              {/* Imlinkedy (imagem via link) */}
              <button
                type="button"
                onClick={() => window.open("https://imlinked.vercel.app", "_blank")}
                className="flex items-center justify-center w-12 h-12 rounded-xl border border-gray-300 hover:bg-gray-100 transition shadow-sm bg-white"
              >
                <Image
                  src="https://imlinked.vercel.app/favicon.png"
                  alt="Imlinkedy"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}