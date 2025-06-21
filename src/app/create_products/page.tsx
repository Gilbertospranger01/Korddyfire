"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../utils/supabase";
import Image from "next/image";
import { useAuth } from '../../hooks/useAuth';
import Side_Seller_Dashboard from '@/components/sideSellerdashboard';
import { FiArrowLeft } from "react-icons/fi";
import Loadingpage from "../../loadingpages/loadingpage";

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
        image: ""
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [digitalFile, setDigitalFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const { session } = useAuth();

    const user = useMemo(() => {
        if (!session?.user) return null;
        return {
            id: session.user.id,
            name: session.user.user_metadata?.name || 'User',
            picture: session.user.user_metadata?.avatar_url || null,
        };
    }, [session]);

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
        setLoading(true);

        // Obter usuário autenticado
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("Usuário não autenticado!");
            setLoading(false);
            return;
        }

        let imageUrl = product.image;

        if (imageFile) {
            const fileName = `${Date.now()}-${imageFile.name}`;
            const { error } = await supabase.storage
                .from("greekxs/backgroundimages")
                .upload(fileName, imageFile);

            if (error) {
                console.error("Erro ao enviar imagem:", error.message);
                setLoading(false);
                return;
            }

            imageUrl = supabase.storage.from("greekxs/backgroundimages").getPublicUrl(fileName).data.publicUrl;
        }

        let digitalUrl = "";

        if (digitalFile) {
            const digitalFileName = `${Date.now()}-${digitalFile.name}`;
            const { error: digitalError } = await supabase.storage
                .from("greekxs/products")
                .upload(digitalFileName, digitalFile);

            if (digitalError) {
                console.error("Erro ao enviar produto digital:", digitalError.message);
                setLoading(false);
                return;
            }

            digitalUrl = supabase.storage.from("greekxs/products").getPublicUrl(digitalFileName).data.publicUrl;
        }

        const { error } = await supabase.from("products").insert([
            {
                ...product,
                image: imageUrl,
                digital_product: digitalUrl,
                user_id: user.id,
                seller_id: user.user_metadata.user_id || 'not have',
                seller_name: user.user_metadata?.name || 'Unknown'
            }
        ]);

        if (error) {
            console.error("Erro ao criar produto:", (error as any)?.message || error);
        } else {
            router.push("/home");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) {
            setProduct((prev) => ({ ...prev, seller_name: user.name }));
        }
    }, [user]);

    if (!session) {
        return (
            <Loadingpage />
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
            {/* Header fixo no topo */}
            <header className="flex fixed w-full justify-between z-99 items-center p-4 bg-gray-800 shadow-md border-b border-gray-400">
                <div className="flex items-center">
                    <button onClick={() => router.push('/home')} className='text-gray-400 hover:text-white transition cursor-pointer'>
                        <FiArrowLeft size={24} />
                    </button>
                    <div className="text-2xl font-bold pl-8">Korddyfire</div>
                </div>
                {user && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm">{user.name}</span>
                        {user.picture && (
                            <Image
                                src={user.picture}
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
                {/* Main content */}
                <main className="flex-1 mt-20 ml-60 px-8 py-6">
                    <h1 className="text-4xl text-center font-bold mb-10 text-green-500">Create New Product</h1>

                    <form onSubmit={handleSubmit} className="p-8 rounded-2xl max-w-5xl mx-auto space-y-8">
                        <div>
                            <label className="block text-gray-300 mb-2">Seller Name</label>
                            <input
                                type="text"
                                name="seller_name"
                                value={product.seller_name}
                                readOnly
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none text-gray-400 cursor-not-allowed"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-300 mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={product.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={product.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={product.stock}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={product.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={product.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Upload da imagem */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file && file.type.startsWith("image/")) {
                                        setImageFile(file);
                                        setPreview(URL.createObjectURL(file));
                                    }
                                }}
                                className="relative w-full h-[250px] border-2 border-dashed border-gray-600 rounded-lg bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden"
                            >
                                {preview ? (
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        width={500}
                                        height={250}
                                        className="object-cover rounded-lg w-full h-full"
                                    />
                                ) : (
                                    <span className="text-gray-400">Click or drag a 500x250 image here</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                            </div>

                            {/* Upload do produto digital */}
                            <div className="relative w-full h-[250px] border-2 border-dashed border-gray-600 rounded-lg bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden">
                                <label className="block text-gray-300">Upload Product (eBook, Course, etc)</label>
                                <input
                                    type="file"
                                    name="digital_product"
                                    accept=".pdf,.mp4,.zip,.rar,.docx,.pptx"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setDigitalFile(file);
                                            console.log("Arquivo digital selecionado:", file);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="text-right">
                            <button
                                type="submit"
                                className="inline-block bg-green-600 hover:bg-green-700 transition-colors duration-300 text-white font-semibold px-6 py-2 rounded-md cursor-pointer"
                                disabled={loading}
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



