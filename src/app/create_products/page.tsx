"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import Image from "next/image";
import Side_Seller_Dashboard from "@/components/sideSellerdashboard";
import Toast from "@/components/toast";
import { useToast } from "@/hooks/useToast"; // hook que criamos antes
import { FiArrowLeft } from "react-icons/fi";
import Loadingpage from "@/loadingpages/loadingpage";

interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatar_url?: string | null;
  user_id?: string;
}

const Create_Products = () => {
  const router = useRouter();
  const { toasts, addToast } = useToast();

  const [product, setProduct] = useState({
    seller_id: "",
    seller_name: "",
    name: "",
    price: 0,
    stock: "",
    category: "",
    description: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Recupera usuário logado
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser({
        id: parsed.id,
        name: parsed.name || parsed.user_metadata?.name || "User",
        username: parsed.username || "",
        email: parsed.email || "",
        avatar_url: parsed.avatar_url || parsed.user_metadata?.avatar_url || null,
        user_id: parsed.user_metadata?.user_id || parsed.user_id || "",
      });
    }
  }, []);

  // Preenche seller_name
  useEffect(() => {
    if (user) setProduct((prev) => ({ ...prev, seller_name: user.name }));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name === "seller_name") return;
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleDigitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDigitalFile(file);
  };

  const renderDigitalPreview = () => {
    if (!digitalFile) return null;
    const fileUrl = URL.createObjectURL(digitalFile);
    const type = digitalFile.type;

    if (type.startsWith("image/"))
      return <Image src={fileUrl} alt="Digital Preview" width={200} height={200} className="rounded-lg mt-4" />;

    if (type.startsWith("video/"))
      return <video controls width={300} className="rounded-lg mt-4"><source src={fileUrl} type={type} />Seu navegador não suporta vídeo.</video>;

    if (type.startsWith("audio/"))
      return <audio controls src={fileUrl} className="mt-4 w-full" />;

    if (type === "application/pdf")
      return <iframe src={fileUrl} width="100%" height={400} className="mt-4 rounded-lg border" />;

    return (
      <div className="mt-4 p-4 bg-gray-700 rounded-md text-gray-200 flex items-center gap-2">
        <span className="font-semibold">Arquivo:</span> {digitalFile.name}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      addToast("Você precisa estar logado para criar um produto 😢", "warning");
      return;
    }

    setLoading(true);

    try {
      // Upload imagem
      let imageUrl = product.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await api.post("/upload/uploads/", formData, { headers: { "Content-Type": "multipart/form-data" } });
        imageUrl = res.data.url;
      }

      // Upload digital
      let digitalUrl = "";
      if (digitalFile) {
        const formData = new FormData();
        formData.append("file", digitalFile);
        const res = await api.post("/upload/digital", formData, { headers: { "Content-Type": "multipart/form-data" } });
        digitalUrl = res.data.url;
      }

      const payload = {
        ...product,
        image: imageUrl,
        digital_product: digitalUrl,
        user_id: user.id,
        seller_id: user.user_id || "not have",
        seller_name: user.name,
      };

      const createResp = await api.post("/products", payload);

      if (createResp.status === 201) {
        addToast("Produto criado com sucesso! 🎉", "success");
        setTimeout(() => router.push("/home"), 1000);
      } else {
        addToast("Não foi possível criar o produto 😢", "error");
        console.error("Erro ao criar produto:", createResp);
      }
    } catch (err) {
      console.error("Erro ao criar produto:", err);
      addToast("Erro de conexão. Tenta outra vez!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loadingpage />;

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex fixed w-full justify-between items-center p-4 bg-gray-800 shadow-md border-b border-gray-400">
        <div className="flex items-center">
          <button onClick={() => router.push("/home")} className="text-gray-400 hover:text-white transition cursor-pointer">
            <FiArrowLeft size={24} />
          </button>
          <div className="text-2xl font-bold pl-8">Korddyfire</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">{user.name}</span>
          {user.avatar_url && <Image src={user.avatar_url} alt="User Avatar" width={40} height={40} className="rounded-full" />}
        </div>
      </header>

      <div className="flex w-full">
        <Side_Seller_Dashboard />
        <main className="flex-1 mt-20 ml-60 px-8 py-6">
          <h1 className="text-4xl text-center font-bold mb-10 text-green-500">Create New Product</h1>

          {/* Toasts */}
          <div className="fixed top-5 right-5 z-50 flex flex-col">{toasts.map((t) => <Toast key={t.id} type={t.type} message={t.message} />)}</div>

          <form onSubmit={handleSubmit} className="p-8 rounded-2xl max-w-5xl mx-auto space-y-8 bg-gray-800">
            {/* Seller Name */}
            <div>
              <label className="block text-gray-300 mb-2">Seller Name</label>
              <input type="text" name="seller_name" value={product.seller_name} readOnly className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed" />
            </div>

            {/* Campos básicos */}
            {["name", "price", "stock", "category"].map((field) => (
              <div key={field}>
                <label className="block text-gray-300 mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === "price" ? "number" : "text"}
                  name={field}
                  value={product[field as keyof typeof product]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
                  required={field === "name" || field === "price"}
                />
              </div>
            ))}

            {/* Description */}
            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea name="description" value={product.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md" />
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-gray-300 mb-2">Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-gray-200" />
              {previewImage && <Image src={previewImage} alt="Preview" width={200} height={200} className="rounded-lg mt-4" />}
            </div>

            {/* Upload Digital File */}
            <div>
              <label className="block text-gray-300 mb-2">Digital File</label>
              <input type="file" accept="*/*" onChange={handleDigitalChange} className="w-full text-gray-200" />
              {renderDigitalPreview()}
            </div>

            {/* Submit */}
            <div className="flex justify-center">
              <button type="submit" disabled={loading} className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-white transition disabled:opacity-50">
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Create_Products;