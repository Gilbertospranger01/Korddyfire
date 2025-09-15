"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession, type Session } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaLock } from "react-icons/fa";
import Input from "@/components/ui/input";
import Image from "next/image";
import BackgroundImage from "@/components/backgroundimage";
import Loadingconnection from "@/loadingpages/loadingconnection";
import api from "@/utils/api";

type FormData = { email: string; password: string };

export default function Signin() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const handleOAuthLogin = async (provider: "google" | "facebook" | "github" | "imlinkedy") => {
    setError(null);
    setLoading(true);

    try {
      const result = await signIn(provider, { redirect: false });
      if (!result?.ok) throw new Error("Falha no login via provedor.");

      const session: Session | null = await getSession();
      if (!session?.user) throw new Error("Dados do provedor não encontrados.");

      // Enviar dados do provider para o backend
      await api.post("/signin-providers", session.user);

      router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
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

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded mt-4 disabled:opacity-50"
            >
              {loading ? "Carregando..." : "Entrar"}
            </button>
          </form>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="flex flex-col items-center mt-6 mb-10">
            <p className="text-gray-600 text-sm mb-2">Ou entre com</p>
            <div className="flex space-x-6">
              <button onClick={() => handleOAuthLogin("google")} aria-label="Google">
                <FcGoogle size={30} />
              </button>
              <button onClick={() => handleOAuthLogin("facebook")} aria-label="Facebook" className="text-blue-600">
                <FaFacebook size={30} />
              </button>
              <button onClick={() => handleOAuthLogin("github")} aria-label="GitHub" className="text-white">
                <FaGithub size={30} />
              </button>
              <button onClick={() => handleOAuthLogin("imlinkedy")} className="w-7 h-7 relative rounded-full overflow-hidden bg-gray-800 hover:bg-gray-700">
                <Image src="https://imlinked.vercel.app/favicon.png" alt="Imlinkedy" fill className="object-cover" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}