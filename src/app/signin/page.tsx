"use client";

import React, { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub } from "react-icons/fa";
import Image from "next/image";

import BackgroundImage from "@/components/backgroundimage";
import Loadingconnection from "@/loadingpages/loadingconnection";
import Input from "@/components/ui/input";
import api from "@/utils/api";

export default function Signin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isOnline, setIsOnline] = useState(true);

  // Atualiza o estado de online/offline
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

  // Input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Login tradicional
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

  // Login via OAuth
  const handleOAuthLogin = async (provider: "google" | "facebook" | "github" | "imlinkedy") => {
    try {
      if (provider === "imlinkedy") {
        window.location.href =
          "https://imlinked.vercel.app/oauth/authorize?client_id=IMLINKEDY_CLIENT_ID&redirect_uri=https://korddyfirebase.vercel.app/home&response_type=code";
        return;
      }
      await signIn(provider, { callbackUrl: "/home" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao fazer login.");
    }
  };

  if (!isOnline) return <Loadingconnection />;

  return (
    <div className="flex w-full h-screen bg-gray-100">
      {/* Lado esquerdo com imagem de fundo */}
      <div className="hidden md:flex md:w-1/2 h-full">
        <BackgroundImage />
      </div>

      {/* Lado direito com formulário */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6 md:px-16 gap-6">
        <h1 className="text-3xl font-bold">Entrar no ImLinkedy</h1>

        {/* Avatar de exemplo do ImLinkedy */}
        <Image
          src="https://imlinked.vercel.app/path/to/avatar.jpg" // substitua pela URL real
          alt="Avatar ImLinkedy"
          width={120}
          height={120}
          className="rounded-full"
        />

        {/* Formulário de login */}
        <form onSubmit={handleSignIn} className="flex flex-col w-full gap-4">
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>

        {/* Botões OAuth */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => handleOAuthLogin("google")}
            className="btn-oauth"
            title="Login com Google"
          >
            <FcGoogle size={24} />
          </button>
          <button
            onClick={() => handleOAuthLogin("facebook")}
            className="btn-oauth"
            title="Login com Facebook"
          >
            <FaFacebook size={24} color="#3b5998" />
          </button>
          <button
            onClick={() => handleOAuthLogin("github")}
            className="btn-oauth"
            title="Login com GitHub"
          >
            <FaGithub size={24} />
          </button>
          <button
            onClick={() => handleOAuthLogin("imlinkedy")}
            className="btn-oauth"
            title="Login com ImLinkedy"
          >
            <Image
              src="/icons/imlinkedy.png" // ícone local do ImLinkedy
              alt="ImLinkedy"
              width={24}
              height={24}
            />
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Não tem conta?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}