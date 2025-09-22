"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import Header from "@/components/header";
import Loadingpage from "@/loadingpages/loadingpage";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

type Product = {
  id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  stock: number;
};

const Home = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadin, setLoadin] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await api.get("/products/products");
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error("Erro ao buscar dados", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBuyNow = (productId: string) => {
    setLoadin((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      router.push(`/details?id=${productId}`);
      setLoadin((prev) => ({ ...prev, [productId]: false }));
    }, 1500);
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  if (loading) return <Loadingpage />;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold mb-6 text-center md:text-left">Featured Products</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-64 sm:h-72 md:h-64">
                <Image
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-2 right-2 bg-opacity-70 p-1 rounded-full hover:bg-opacity-100 transition cursor-pointer"
                >
                  <Heart
                    size={24}
                    className={`transition ${
                      favorites[product.id] ? "fill-red-500 text-red-500" : "text-white"
                    }`}
                    fill={favorites[product.id] ? "red" : "none"}
                  />
                </button>
                <span
                  className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium ${
                    product.stock > 0 ? "bg-green-600 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <div className="p-4 flex flex-col gap-2 flex-1">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                  {product.description}
                </h4>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                  {product.name}
                </h4>
                <p className="text-green-600 text-xl font-bold">{formatPrice(product.price)}</p>
                <button
                  className="mt-auto h-12 flex gap-2 items-center justify-center bg-green-600 text-white py-2 rounded-xl w-full hover:bg-green-700 transition duration-300 shadow-md cursor-pointer relative disabled:bg-green-700"
                  onClick={() => handleBuyNow(product.id)}
                  disabled={loadin[product.id]}
                >
                  {loadin[product.id] ? (
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-white rounded-full animate-[fadeInOut_1s_infinite]"></div>
                      <div className="h-2 w-2 bg-white rounded-full animate-[fadeInOut_1s_infinite] [animation-delay:0.3s]"></div>
                      <div className="h-2 w-2 bg-white rounded-full animate-[fadeInOut_1s_infinite] [animation-delay:0.5s]"></div>
                    </div>
                  ) : (
                    "Buy"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-3 bg-gray-950">
        <div className="container mx-auto text-center">
          <p className="text-gray-900 dark:text-white">&copy; 2025 Korddyfire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;