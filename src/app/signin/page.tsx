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

function Signin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isOnline, setIsOnline] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.post("/signin", {
        email: formData.email,
        password: formData.password,
      });


      // Redireciona após login bem-sucedido
      router.push("/home");
    } catch (err: unknown) {
  if (err instanceof AxiosError) {
    setError(err.response?.data?.error || "Erro ao fazer login.");
  } else {
    setError("Erro ao fazer login.");
  }
};

  const handleOAuthLogin = async (provider: "google" | "facebook" | "github") => {
    try {
      await signIn(provider, { callbackUrl: "/home" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("OAuth login failed:", error.message);
        setError(error.message);
      } else {
        setError("Erro desconhecido ao fazer login.");
      }
    }
  };

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!isOnline) return <Loadingconnection />;

  return (
    <div className="flex w-full h-screen bg-gray-100 overflow-hidden">
      <div className="w-1/2 h-full flex relative">
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute left-0 w-full h-full flex flex-col justify-center items-center bg-gray-950 p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign In</h2>
          <form className="w-full max-w-md" onSubmit={handleSignIn}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-white text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                aria-label="Email"
                className="bg-gray-800 shadow appearance-none border rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Digite seu email"
                required
              />
            </div>

            <Input
              name="password"
              icon={<FaLock />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-73 mb-3"
              eye={true}
              placeholder="Digite sua senha"
              required
            />

            <div className="flex flex-col space-y-4 mt-4">
              <p className="text-white text-xs text-right">
                Esqueceu a senha?
                <Link href="/user/recover_password" className="text-blue-400 hover:text-blue-600 ml-2">
                  Recuperar
                </Link>
              </p>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded focus:outline-none focus:shadow-outline cursor-pointer"
              >
                Entrar
              </button>
            </div>
          </form>

          {error && (
            <p className="text-red-500 text-sm mt-2" role="alert">
              {error}
            </p>
          )}

          <p className="text-center text-gray-400 text-sm mt-4">
            Não tem uma conta?{" "}
            <Link href="/signup">
              <span className="text-blue-400 hover:text-blue-600">Criar conta</span>
            </Link>
          </p>

          <div className="flex flex-col items-center mt-4 mb-10">
            <p className="text-gray-600 text-sm mb-2">Ou entre com</p>
            <div className="flex space-x-6">
              <button
                onClick={() => handleOAuthLogin("google")}
                aria-label="Entrar com Google"
                className="text-white"
              >
                <FcGoogle size={30} />
              </button>
              <button
                onClick={() => handleOAuthLogin("facebook")}
                aria-label="Entrar com Facebook"
                className="text-blue-600"
              >
                <FaFacebook size={30} />
              </button>
              <button
                onClick={() => handleOAuthLogin("github")}
                aria-label="Entrar com GitHub"
                className="text-white"
              >
                <FaGithub size={30} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-1/2 h-full flex flex-col justify-center items-center text-white bg-cover bg-center overflow-hidden">
        <BackgroundImage />
      </div>
    </div>
  );
}

export default Signin;
