"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaLock } from "react-icons/fa";
import Image from "next/image";

import Input from "@/components/ui/input";
import BackgroundImage from "@/components/backgroundimage";
import Loadingconnection from "@/loadingpages/loadingconnection";
import { createClient } from "@/utils/supabase/client";
import api from "@/utils/api";

type FormData = { email: string; password: string };

const supabase = createClient();

export default function Signin() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Login tradicional (backend)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/users/signin", formData); // endpoint do backend
      console.log("Login success:", res.data);
      router.push("/home");
    } catch (err: any) {
      setError(err.error || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  // OAuth login
  const handleOAuthLogin = async (provider: "google" | "facebook" | "github" | "imlinkedy") => {
    setLoading(true);
    setError(null);

    try {
      if (provider === "imlinkedy") {
        // Custom OAuth backend
        window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/${provider}`;
        return;
      }

      // Supabase OAuth (Google, FB, GitHub)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (!isOnline) return <Loadingconnection />;

  return (
    <div className="flex w-full h-screen bg-gray-100">
      <div className="hidden md:flex md:w-1/2 h-full">
        <BackgroundImage />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-950 p-6">
        <div className="w-full max-w-md flex flex-col justify-center items-center bg-gray-950 p-6 md:p-8 rounded-lg shadow-lg">
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
                <a href="/user/recover_password" className="text-blue-400 hover:text-blue-600 ml-2">
                  Recuperar
                </a>
              </p>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
              >
                {loading ? "Carregando..." : "Entrar"}
              </button>
            </div>
          </form>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <p className="text-center text-gray-400 text-sm mt-6">
            Não tem uma conta?{" "}
            <a href="/signup" className="text-blue-400 hover:text-blue-600">
              Criar conta
            </a>
          </p>

          <div className="flex flex-col items-center mt-4 mb-10">
            <p className="text-gray-600 text-sm mb-2">Ou entre com</p>
            <div className="flex space-x-6">
              <button onClick={() => handleOAuthLogin("google")} className="text-white" type="button">
                <FcGoogle size={30} />
              </button>
              <button onClick={() => handleOAuthLogin("facebook")} className="text-blue-600" type="button">
                <FaFacebook size={30} />
              </button>
              <button onClick={() => handleOAuthLogin("github")} className="text-white" type="button">
                <FaGithub size={30} />
              </button>
              <button
                onClick={() => handleOAuthLogin("imlinkedy")}
                className="relative w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 hover:bg-gray-700"
                type="button"
              >
                <Image src="https://imlinked.vercel.app/favicon.png" alt="Imlinkedy" fill className="object-cover" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}