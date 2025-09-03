"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/authContext";
import { Button } from "@nextui-org/react";
import Loadingpage from "@/components/loadingpage";

const DeleteAccount = () => {
  const router = useRouter();
  const { session, logout } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    if (!session?.user?.id) {
      setError("Usuário não encontrado.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.delete("/delete_account", { data: { userId: session.user.id } });
      setSuccess("Conta excluída com sucesso.");
      await logout();
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err: unknown) {
      let message = "Erro ao excluir a conta.";
      if (err instanceof Error) message = err.message;
      else if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        message = (err as { response: { data: { message: string } } }).response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [session, logout, router]);

  if (!session) return <Loadingpage />;

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Excluir Conta</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      <Button
        color="danger"
        onClick={handleDeleteAccount}
        isLoading={loading}
      >
        Excluir minha conta
      </Button>
    </div>
  );
};

export default DeleteAccount;