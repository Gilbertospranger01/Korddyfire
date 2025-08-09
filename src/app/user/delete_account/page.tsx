"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import Sideprofile from "@/components/sideprofile";
import { useAuth } from "@/hooks/useAuth";
import Loadingpage from "@/loadingpages/loadingpage";
import api from "@/utils/api";

const Delete_Account = () => {
  const router = useRouter();
  const { session, logout } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!session?.user.id) {
      setError("Usuário não encontrado.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.delete("/delete_account", {
        data: { userId: session.user.id },
      });

      setSuccess("Conta excluída com sucesso.");
      await logout();
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err: any) {
      setError("Erro ao excluir a conta: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <Loadingpage />;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Cabeçalho */}
      <div className="fixed top-0 left-0 w-full bg-gray-950 shadow-md py-3 px-6 flex items-center z-10">
        <button
          onClick={() => router.push("/home")}
          className="text-gray-400 hover:text-white transition cursor-pointer"
          aria-label="Voltar para página inicial"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">Delete your account</h1>
      </div>

      <Sideprofile />

      <div className="ml-140 pt-20 px-8 pb-16 items-center justify-center">
        <div className="w-full max-w-md p-8 rounded shadow-md">
          <h2 className="text-2xl font-semibold text-center mb-4">Confirm Account Deletion</h2>

          {error && (
            <div className="bg-red-500 text-white p-3 mb-4 rounded-md text-center">{error}</div>
          )}

          {success && (
            <div className="bg-green-500 text-white p-3 mb-4 rounded-md text-center">{success}</div>
          )}

          <p className="text-center mb-6 text-gray-300">
            Are you sure you want to permanently delete your account? This action cannot be undone.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </button>
            <button
              onClick={() => router.push("/home")}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delete_Account;
