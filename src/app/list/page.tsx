"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/utils/api";  // <-- aqui, troca supabase por api
import Header from "@/components/header";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Loadingpage from "@/loadingpages/loadingpage";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  stock: number;
}

function List() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productName = searchParams.get("value");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loadin, setLoadin] = useState<Record<string, boolean>>({});

  const handleBuyNow = (productId: string) => {
    setLoadin((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      router.push(`/details?id=${productId}`);
      setLoadin((prev) => ({ ...prev, [productId]: false }));
    }, 2000);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const unslugify = (slug: string) => {
    return slug.replace(/-/g, " ");
  };
  const searchQuery = productName ? unslugify(productName) : "";

  useEffect(() => {
    async function fetchProducts() {
      if (!productName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // API REST, filtro com query param 'name_like' ou 'name_contains' conforme backend
        const response = await api.get(`products?name_like=${encodeURIComponent(searchQuery)}`);
        setProducts(response.data);
      } catch (err) {
        setError("Erro ao buscar produtos.");
        setProducts([]);
        console.error("Erro ao buscar produtos:", err);
      }

      setLoading(false);
    }

    fetchProducts();
  }, [productName]);

  if (loading) {
    return <Loadingpage />;
  }

  if (error) return <p className="text-red-500">{error}</p>;

  if (products.length === 0) return <p>Produto(s) não encontrado(s).</p>;

  return (
    <div className="bg-gray-900 min-h-screen container mx-auto px-4 py-8 mt-16 max-w-full w-full transition-all">
      <Header />
      <div className="flex space-x-4 overflow-x-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white max-w-[300px] w-full rounded-2xl shadow-lg overflow-hidden mb-5"
          >
            <div className="relative w-full h-[300px]">
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
                  className={`transition ${favorites[product.id] ? "fill-red-500 text-red-500" : "text-white"}`}
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
            <div className="p-4 flex flex-col gap-2 pt-5">
              <h4 className="text-lg font-semibold text-gray-800 truncate">{product.description}</h4>
              <h4 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h4>
              <p className="text-green-600 text-xl font-bold">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price)}
              </p>
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
                  "Buy Now"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ListPage() {
  return (
    <Suspense fallback={<p>Carregando produtos...</p>}>
      <List />
    </Suspense>
  );
}