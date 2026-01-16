"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaLock } from "react-icons/fa";
import api from "@/utils/api";
import Input from "@/components/ui/input";
import BackgroundImage from "@/components/backgroundimage";
import Loadingconnection from "@/loadingpages/loadingconnection";
import type { AxiosError } from "axios";
import type { User } from "@/types/types";

interface AuthSuccessResponse {
  token: string;
  message: string;
  user: User;
}

interface BackendErrorResponse {
  error?: string;
  detail?: string;
  message?: string;
}

const setCookie = (name: string, value: string, hours = 24) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(
    value
  )};expires=${expires.toUTCString()};path=/;Secure;SameSite=None`;
};

// ------------------
// Types
// ------------------
type FormData = {
  email: string;
  password: string;
};

type Provider = "google" | "facebook" | "github" | "imlinkey";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ---- Email / senha ----
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingEmail(true);

    try {
      const { data } = await api.post<AuthSuccessResponse>(
        "/auth/signin",
        formData
      );

      setCookie("auth_token", data.token, 2);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      router.replace("/home");
    } catch (err) {
      const axiosErr = err as AxiosError<BackendErrorResponse>;
      const msg =
        axiosErr.response?.data?.error ||
        axiosErr.response?.data?.detail ||
        axiosErr.response?.data?.message ||
        "Erro ao fazer login.";
      setError(msg);
    } finally {
      setLoadingEmail(false);
    }
  };

  // ---- OAuth ----
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
      <div className="hidden md:flex md:w-1/2 h-full">
        <BackgroundImage />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-950 p-6">
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md bg-gray-950 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Sign In
          </h2>

          <form className="w-full" onSubmit={handleSignIn} noValidate>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu email"
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
              required
            />

            <button
              type="submit"
              disabled={loadingEmail || !!loadingProvider}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 w-full rounded disabled:opacity-50"
            >
              {loadingEmail ? "Carregando..." : "Entrar"}
            </button>
          </form>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="flex justify-center gap-6 mt-6">
            <button onClick={() => handleOAuthLogin("google")}>
              <FcGoogle size={30} />
            </button>
            <button onClick={() => handleOAuthLogin("facebook")}>
              <FaFacebook size={30} className="text-blue-600" />
            </button>
            <button onClick={() => handleOAuthLogin("github")}>
              <FaGithub size={30} className="text-white" />
            </button>
            <button
              onClick={() => handleOAuthLogin("imlinkey")}
              aria-busy={loadingProvider === "imlinkey"}
              className="relative w-7 h-7"
            >
              <Image
                src="https://imlinkey.store/favicon.png"
                alt="Imlinkey"
                fill
              />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}