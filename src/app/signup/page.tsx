"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackgroundImage from "@/components/backgroundimage";
import api from "@/utils/api";
import axios, { AxiosError, isAxiosError } from "axios";
import { FaLock, FaUser } from "react-icons/fa";
import Input from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, UserCircleIcon } from "lucide-react";

function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
    terms_and_policies: false,
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, type, checked, value } = e.target;
      const newValue =
        name === "username" ? value.slice(0, 12) : value;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : newValue,
      }));
    },
    []
  );

  const handleSignup = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  if (!formData.terms_and_policies) {
    alert("Você deve aceitar os Termos de Uso e Política de Privacidade.");
    setLoading(false);
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    alert("Por favor, insira um e-mail válido.");
    setLoading(false);
    return;
  }

  if (formData.password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    setLoading(false);
    return;
  }

  try {
    const response = await api.post("/signup", {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      username: formData.username,
      terms_and_policies: !!formData.terms_and_policies,
    });

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    alert("Cadastro realizado com sucesso!");
    router.push("/signin");

  } catch (error) {
    const errorMessage = isAxiosError(error) && error.response?.data?.message
      ? error.response.data.message
      : "Erro desconhecido";

    console.error("Erro de signup:", errorMessage);
    alert(`Erro de Signup: ${errorMessage}`);
  } finally {
    setLoading(false);
  }
}, [formData, router]);

  return (
    <div className="flex w-full h-screen bg-gray-100 overflow-hidden">
      <div className="w-1/2 h-full">
        <BackgroundImage />
      </div>

      <div className="w-1/2 h-full flex items-center justify-center bg-gray-950">
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full flex flex-col justify-center items-center bg-gray-950 p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Create an account
          </h2>

          <form className="w-full max-w-md" onSubmit={handleSignup}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
                Name
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                icon={<FaUser />}
                className="w-80 mb-3"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
                Username
              </label>
              <Input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                icon={<UserCircleIcon />}
                className="w-80 mb-3"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                Email
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                icon={<Mail />}
                className="w-80 mb-3"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
                Password
              </label>
              <Input
                name="password"
                icon={<FaLock />}
                value={formData.password}
                onChange={handleChange}
                className="w-73 mb-3"
                eye={true}
                placeholder="Create your Password"
                required
              />
            </div>

            <div className="flex items-start justify-center mt-4 space-x-2">
              <input
                type="checkbox"
                className="mt-1 cursor-pointer"
                required
                id="terms_and_policies"
                name="terms_and_policies"
                checked={formData.terms_and_policies}
                onChange={handleChange}
              />

              <label htmlFor="terms_and_policies" className="text-gray-400 text-sm">
                By signing up, I agree to the{" "}
                <Link href="/terms_policies/terms" className="text-blue-500 hover:text-blue-800">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href="/terms_policies/policies" className="text-blue-500 hover:text-blue-800">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <div className="flex items-center justify-between mt-4">
              <Button type="submit"
                className=" px-40 mb-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Signup"}
              </Button>
            </div>
          </form>

          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-500 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;
