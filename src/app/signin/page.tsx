"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import type { Session } from "next-auth";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaLock } from "react-icons/fa";
import BackgroundImage from "@/components/backgroundimage";
import Loadingconnection from "@/loadingpages/loadingconnection";
import Input from "@/components/ui/input";
import Image from "next/image";
import api from "@/utils/api";

type FormData = {
  email: string;
  password: string;
};

export default function Signin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/signin/", formData);
      router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (
    provider: "google" | "facebook" | "github" | "imlinkedy"
  ) => {
    setError(null);
    setLoading(true);
    try {
      const result = await signIn(provider, { redirect: false });
      if (!result?.ok) throw new Error("Falha no login via provedor.");

      const session: Session | null = await getSession();
      if (!session?.user) throw new Error("Dados do provedor não encontrados.");

      await api.post("/signin-providers", session.user);
      router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
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
                <Link
                  href="/user/recover_password"
                  className="text-blue-400 hover:text-blue-600 ml-2"
                >
                  Recuperar
                </Link>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
                aria-busy={loading}
              >
                {loading ? "Carregando..." : "Entrar"}
              </button>
            </div>
          </form>

          {error && (
            <p role="alert" className="text-red-500 text-sm mt-2">
              {error}
            </p>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            Não tem uma conta?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-600">
              Criar conta
            </Link>
          </p>

          <div className="flex flex-col items-center mt-4 mb-10">
            <p className="text-gray-600 text-sm mb-2">Ou entre com</p>
            <div className="flex space-x-6">
              {/* Apenas providers permitidos */}
              <button
                onClick={() => handleOAuthLogin("google")}
                className="text-white"
                aria-label="Entrar com Google"
                type="button"
                title="Entrar com Google"
              >
                <FcGoogle size={30} />
              </button>

              <button
                onClick={() => handleOAuthLogin("facebook")}
                className="text-blue-600"
                aria-label="Entrar com Facebook"
                type="button"
                title="Entrar com Facebook"
              >
                <FaFacebook size={30} />
              </button>

              <button
                onClick={() => handleOAuthLogin("github")}
                className="text-white"
                aria-label="Entrar com GitHub"
                type="button"
                title="Entrar com GitHub"
              >
                <FaGithub size={30} />
              </button>

              <button
                onClick={() => handleOAuthLogin("imlinkedy")}
                className="relative w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 hover:bg-gray-700"
                aria-label="Entrar com Imlinkedy"
                type="button"
                title="Entrar com Imlinkedy"
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
        </motion.div>
      </div>
    </div>
  );
}