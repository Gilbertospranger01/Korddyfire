"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import Image from "next/image";
import Side_Seller_Dashboard from "@/components/sideSellerdashboard";
import { FiArrowLeft } from "react-icons/fi";
import Loadingpage from "@/loadingpages/loadingpage";

interface UserMetadata {
  name?: string;
  avatar_url?: string;
  user_id?: string;
}

interface AuthUser {
  id: string;
  user_metadata?: UserMetadata;
}

const Create_Products = () => {
  const router = useRouter();
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
  const [preview, setPreview] = useState<string | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Recupera usuário salvo no localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  const memoUser = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: user.user_metadata?.name || "User",
      picture: user.user_metadata?.avatar_url || null,
      user_metadata: user.user_metadata,
    };
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.name === "seller_name") return;
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDigitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDigitalFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!memoUser) {
      console.error("Usuário não autenticado!");
      setLoading(false);
      return;
    }

    try {
      // Upload imagem
      let imageUrl = product.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadImageResp = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadImageResp.data.url;
      }

      // Upload digital
      let digitalUrl = "";
      if (digitalFile) {
        const formData = new FormData();
        formData.append("file", digitalFile);
        const uploadDigitalResp = await api.post("/upload/digital", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        digitalUrl = uploadDigitalResp.data.url;
      }

      // Payload final
      const payload = {
        ...product,
        image: imageUrl,
        digital_product: digitalUrl,
        user_id: memoUser.id,
        seller_id: memoUser.user_metadata?.user_id || "not have",
        seller_name: memoUser.name,
      };

      const createResp = await api.post("/products", payload);

      if (createResp.status === 201) {
        router.push("/home");
      } else {
        console.error("Erro ao criar produto:", createResp);
      }
    } catch (error) {
      console.error("Erro ao criar produto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memoUser) {
      setProduct((prev) => ({ ...prev, seller_name: memoUser.name }));
    }
  }, [memoUser]);

  if (!memoUser) return <Loadingpage />;

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex fixed w-full justify-between items-center p-4 bg-gray-800 shadow-md border-b border-gray-400">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/home")}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            <FiArrowLeft size={24} />
          </button>
          <div className="text-2xl font-bold pl-8">Korddyfire</div>
        </div>
        {memoUser && (
          <div className="flex items-center gap-3">
            <span className="text-sm">{memoUser.name}</span>
            {memoUser.picture && (
              <Image
                src={memoUser.picture}
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
          </div>
        )}
      </header>

      <div className="flex w-full">
        <Side_Seller_Dashboard />
        <main className="flex-1 mt-20 ml-60 px-8 py-6">
          <h1 className="text-4xl text-center font-bold mb-10 text-green-500">
            Create New Product
          </h1>

          <form
            onSubmit={handleSubmit}
            className="p-8 rounded-2xl max-w-5xl mx-auto space-y-8 bg-gray-800"
          >
            {/* Seller Name */}
            <div>
              <label className="block text-gray-300 mb-2">Seller Name</label>
              <input
                type="text"
                name="seller_name"
                value={product.seller_name}
                readOnly
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-gray-300 mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-300 mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-gray-300 mb-2">Stock</label>
              <input
                type="text"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-300 mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
              />
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-gray-300 mb-2">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-gray-200"
              />
              {preview && (
                <div className="mt-4">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Upload Digital File */}
            <div>
              <label className="block text-gray-300 mb-2">Digital File</label>
              <input
                type="file"
                accept=".pdf,.zip,.rar"
                onChange={handleDigitalChange}
                className="w-full text-gray-200"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-white transition disabled:opacity-50"
              >
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