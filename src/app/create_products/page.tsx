"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import Image from "next/image";
import Side_Seller_Dashboard from '@/components/sideSellerdashboard';
import { FiArrowLeft } from "react-icons/fi";
import Loadingpage from "@/loadingpages/loadingpage";

type User = { id: string; name: string; avatar_url?: string; user_id?: string };

const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];

const Create_Products = () => {
  const router = useRouter();

  // Pegar user direto do cookie/localStorage
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const token = getCookie("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    if (token && storedUser) setUser(JSON.parse(storedUser));
    else setUser(null);
  }, []);

  const [product, setProduct] = useState({
    seller_id: "",
    seller_name: "",
    name: "",
    price: 0,
    stock: "",
    category: "",
    description: "",
    image: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setProduct((prev) => ({ ...prev, seller_name: user.name, seller_id: user.user_id || "" }));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name === "seller_name") return; // prevenir edição manual
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return alert("Usuário não autenticado!");
    setLoading(true);

    try {
      let imageUrl = product.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadImageResp = await api.post("/upload/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
        imageUrl = uploadImageResp.data.url;
      }

      let digitalUrl = "";
      if (digitalFile) {
        const formData = new FormData();
        formData.append("file", digitalFile);
        const uploadDigitalResp = await api.post("/upload/digital", formData, { headers: { "Content-Type": "multipart/form-data" } });
        digitalUrl = uploadDigitalResp.data.url;
      }

      const payload = {
        ...product,
        image: imageUrl,
        digital_product: digitalUrl,
        user_id: user.id,
      };

      const createResp = await api.post("/products", payload);
      if (createResp.status === 201) router.push("/home");
      else console.error("Erro ao criar produto:", createResp);
    } catch (err) {
      console.error("Erro ao criar produto:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loadingpage />;

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <header className="flex fixed w-full justify-between z-50 items-center p-4 bg-gray-800 shadow-md border-b border-gray-400">
        <div className="flex items-center">
          <button onClick={() => router.push('/home')} className='text-gray-400 hover:text-white transition'>
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

          <form onSubmit={handleSubmit} className="p-8 rounded-2xl max-w-5xl mx-auto space-y-8">
            <div>
              <label className="block text-gray-300 mb-2">Seller Name</label>
              <input type="text" name="seller_name" value={product.seller_name} readOnly className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input type="text" name="name" value={product.name} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500" required />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Price</label>
                <input type="number" name="price" value={product.price} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500" required />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Stock</label>
                <input type="number" name="stock" value={product.stock} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500" required />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Category</label>
                <input type="text" name="category" value={product.category} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500" required />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea name="description" value={product.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="relative w-full h-[250px] border-2 border-dashed border-gray-600 rounded-lg bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden"
                   onDragOver={e => e.preventDefault()}
                   onDrop={e => {
                     e.preventDefault();
                     const file = e.dataTransfer.files?.[0];
                     if (file?.type.startsWith("image/")) { setImageFile(file); setPreview(URL.createObjectURL(file)); }
                   }}
              >
                {preview ? <Image src={preview} alt="Preview" width={500} height={250} className="object-cover w-full h-full rounded-lg"/> : <span className="text-gray-400">Click or drag a 500x250 image here</span>}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange}/>
              </div>

              {/* Digital File Upload */}
              <div className="relative w-full h-[250px] border-2 border-dashed border-gray-600 rounded-lg bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden">
                <label className="block text-gray-300">Upload Product (eBook, Course, etc)</label>
                <input type="file" name="digital_product" accept=".pdf,.mp4,.zip,.rar,.docx,.pptx" className="absolute inset-0 opacity-0 cursor-pointer"
                       onChange={(e) => { const file = e.target.files?.[0]; if(file) setDigitalFile(file); }} />
              </div>
            </div>

            <div className="text-right">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md" disabled={loading}>
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