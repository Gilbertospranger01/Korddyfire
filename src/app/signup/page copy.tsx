"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import InputPassword from "../../components/ui/input-password";
import Link from "next/link";
import supabase from "../../utils/supabase";
import { useRouter } from "next/navigation";
import BackgroundVideo from "../../components/backgroundvideo";

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
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.name,
            username: formData.username,
            terms_and_policies: !!formData.terms_and_policies, 
          },
        },
      });

      if (error) throw error;

      alert("Cadastro realizado! Verifique seu email para ativar sua conta.");
      router.push("/signin");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao cadastrar:", errorMessage);
      alert(`Erro ao cadastrar: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [formData, router]);

  return (
    <div className="flex w-full h-screen bg-gray-100 overflow-hidden">
      <div className="w-1/2 h-full">
        <BackgroundVideo />
      </div>

      <div className="w-1/2 h-full flex items-center justify-center bg-gray-950">
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full flex flex-col justify-center items-center bg-gray-950 p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Create an Account
          </h2>

          <form className="w-full max-w-md" onSubmit={handleSignup}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your email"
                required
              />
            </div>

            <InputPassword
              name="password"
              value={formData.password}
              onChange={handleChange}
              label="Password"
              placeholder="Create your Password"
              required
            />

            <div className="flex items-start justify-center mt-4 space-x-2">
              <input
                type="checkbox"
                className="mt-1"
                required
                id="terms_and_policies"
                name="terms_and_policies"
                checked={formData.terms_and_policies}
                onChange={handleChange}
              />

              <label htmlFor="terms_and_policies" className="text-gray-400 text-sm">
                By signing up, I agree to the{" "}
                <Link href="/terms" className="text-blue-500 hover:text-blue-800">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href="/policies" className="text-blue-500 hover:text-blue-800">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            <p>{formData.terms_and_policies ? 'true' : 'false'}</p>

            <div className="flex items-center justify-between mt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Signup"}
              </button>
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
