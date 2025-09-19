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
import { createClient } from "@/utils/supabase/client";

// Componentes
import Input from "@/components/ui/input";
import BackgroundImage from "@/components/backgroundimage";
import Loadingconnection from "@/loadingpages/loadingconnection";

// ----------------------
// Tipagens
// ----------------------
type FormData = {
  email: string;
  password: string;
};

interface SupabaseUser {
  id: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  updated_at: string | null;
  confirmed_at: string | null;
  confirmation_sent_at: string | null;
  invited_at: string | null;
  last_sign_in_at: string | null;
  is_anonymous: boolean | null;
  raw_app_meta_data: {
    provider: string | null;
    providers: string[];
  };
  raw_user_meta_data: {
    iss: string | null;
    sub: string | null;
    name: string | null;
    full_name: string | null;
    nickname: string | null;
    slug: string | null;
    email: string | null;
    avatar: string | null;
    provider_id: string | null;
    email_verified: string | null;
    phone_verified: boolean | null;
    user_name: string | null;
    preferred_username: string | null;
  };
}

interface MappedUser {
  id: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  updated_at: string | null;
  email_confirmed_at: string | null;
  confirmation_sent_at: string | null;
  invited_at: string | null;
  last_sign_in_at: string | null;
  aud: boolean | null;
  provider: string | null;
  "metadata.providers": string[];
  "metadata.iss": string | null;
  "metadata.sub": string | null;
  name: string | null;
  username: string | null;
  slug: string | null;
  picture_url: string | null;
  provider_id: string | null;
  phone_verified: boolean | null;
}

// ----------------------
// Helpers
// ----------------------
function mapSupabaseUser(user: SupabaseUser): MappedUser {
  const rawMeta = user.raw_user_meta_data;
  const appMeta = user.raw_app_meta_data;

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at,
    updated_at: user.updated_at,
    email_confirmed_at: rawMeta.email_verified ?? user.confirmed_at,
    confirmation_sent_at: user.confirmation_sent_at,
    invited_at: user.invited_at,
    last_sign_in_at: user.last_sign_in_at,
    aud: user.is_anonymous,
    provider: appMeta.provider,
    "metadata.providers": appMeta.providers ?? [],
    "metadata.iss": rawMeta.iss,
    "metadata.sub": rawMeta.sub,
    name: rawMeta.full_name ?? rawMeta.name,
    username: rawMeta.user_name ?? rawMeta.nickname ?? rawMeta.preferred_username,
    slug: rawMeta.slug,
    picture_url: rawMeta.avatar,
    provider_id: rawMeta.provider_id,
    phone_verified: rawMeta.phone_verified ?? null,
  };
}

// ----------------------
// Componente principal
// ----------------------
const supabase = createClient();

export default function Signin() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Verificar conexão online/offline
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

  // Handler de input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Login email/senha
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/signin", formData);
      alert("Login realizado com sucesso. Redirecionando...");
      router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  // Login OAuth
  const handleOAuthLogin = async (provider: "google" | "facebook" | "github" | "imlinkedy") => {
    setLoading(true);
    setError(null);

    try {
      if (provider === "imlinkedy") {
        window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/${provider}`;
        return;
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: "/home" },
      });
      if (oauthError) throw oauthError;

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const session = sessionData.session;
      if (!session?.user?.id) throw new Error("Usuário não autenticado");

      const { data: userData, error: userError } = await supabase
        .from<SupabaseUser, SupabaseUser>("auth.users") // 👈 corrigido aqui
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (userError || !userData) throw userError || new Error("Usuário não encontrado");

      const mappedUser = mapSupabaseUser(userData);

      await api.post("/signin-providers", { provider, user: mappedUser, session });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
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
          transition={{ duration: 0.5 }}
          className="w-full max-w-md flex flex-col justify-center items-center bg-gray-950 p-6 md:p-8 rounded-lg shadow-lg"
        >
          {/* Título */}
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign In</h2>

          {/* Formulário */}
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
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
              >
                {loading ? "Carregando..." : "Entrar"}
              </button>
            </div>
          </form>

          {/* Erro */}
          {error && <p role="alert" className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Criar conta */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Não tem uma conta?
            <Link href="/signup" className="text-blue-400 hover:text-blue-600 ml-2">
              Criar conta
            </Link>
          </p>

          {/* OAuth */}
          <div className="flex flex-col items-center mt-4 mb-10">
            <p className="text-gray-600 text-sm mb-2">Ou entre com</p>
            <div className="flex space-x-6">
              <button onClick={() => handleOAuthLogin("google")} title="Entrar com Google">
                <FcGoogle size={30} />
              </button>
              <button onClick={() => handleOAuthLogin("facebook")} title="Entrar com Facebook">
                <FaFacebook size={30} className="text-blue-600" />
              </button>
              <button onClick={() => handleOAuthLogin("github")} title="Entrar com GitHub">
                <FaGithub size={30} className="text-white" />
              </button>
              <button
                onClick={() => handleOAuthLogin("imlinkedy")}
                className="relative w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 hover:bg-gray-700"
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