"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../../utils/supabase";
import InputPassword from "../../../components/ui/input-password";
import { FiArrowLeft } from "react-icons/fi";
import Sideprofile from "@/components/sideprofile";
import Loadingpage from "../../../loadingpages/loadingpage";

const Change_Password = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSocialLogin, setIsSocialLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoginMethod = async () => {
      setLoading(true);
      setError("");

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setError("Erro ao obter os dados do usuário.");
        setLoading(false);
        return;
      }

      // Verifica se o usuário está logado com um provedor social
      const socialProviders = ["google", "facebook", "github"];
      const hasSocialLogin: boolean = Array.isArray(user.app_metadata.providers)
        ? user.app_metadata.providers.some((provider: string) => socialProviders.includes(provider))
        : false;
      console.log("Usuário fez login com provedor social?", hasSocialLogin);

      setIsSocialLogin(hasSocialLogin);
      setLoading(false);
    };

    checkUserLoginMethod();
  }, []);

  const handleChange_Password = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não correspondem.");
      return;
    }

    try {
      if (!isSocialLogin) {
        // Verifica se a senha atual está correta
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: (await supabase.auth.getUser()).data.user?.email || "",
          password: currentPassword,
        });

        if (signInError) {
          setError("Senha atual incorreta.");
          return;
        }
      }

      // Atualiza ou define a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(isSocialLogin ? "Senha definida com sucesso! Faça login novamente." : "Senha atualizada com sucesso! Faça login novamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      await supabase.auth.signOut();
      router.push("/signin");
    } catch {
      setError("Ocorreu um erro inesperado.");
    }
  };

  if (!session) {
    return (
      <Loadingpage />
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>

      {/* Header */}
      <div className='fixed top-0 left-0 w-full bg-gray-950 shadow-md py-3 px-6 flex items-center z-10'>
        <button onClick={() => router.push('/home')} className='text-gray-400 hover:text-white transition cursor-pointer'>
          <FiArrowLeft size={24} />
        </button>
        <h1 className='ml-4 text-lg font-semibold'>Change Password</h1>
      </div>

      <Sideprofile />

      {/* Conteúdo */}
      <div className="ml-140 pt-20 px-8 pb-16 items-center justify-center">
        <div className="w-full max-w-md p-8 rounded shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-center">{isSocialLogin ? "Setting Password" : "Alterar Senha"}</h1>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
          {success && <p className="mb-4 text-sm text-green-500">{success}</p>}
          {loading ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : (
            <form onSubmit={handleChange_Password}>
              {!isSocialLogin && (
                <div className="mb-4">
                  <InputPassword
                    name="currentPassword"
                    label="Current Password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              )}
              <div className="mb-4">

                <InputPassword
                  name="newPassword"
                  label="New Password"
                  placeholder="Create a password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <InputPassword
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
              >
                {isSocialLogin ? "Set Password" : "Change Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Change_Password;
