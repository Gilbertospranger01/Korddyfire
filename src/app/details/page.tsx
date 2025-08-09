"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/utils/api";  // substituindo supabase
import Header from "../../components/header";
import Image from "next/image";
import { Heart } from "lucide-react";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Loadingpage from "../../loadingpages/loadingpage";

function Details() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const { session } = useAuth();

  const [product, setProduct] = useState<{
    user_id: string;
    id: string;
    name: string;
    price: number;
    description: string;
    image?: string;
    stock: number;
  } | null>(null);

  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleBuyNow = async () => {
    const amount = product?.price;
    const seller_id = product?.user_id;
    const buyer_id = session?.user.id;

    if (!amount || !buyer_id || !seller_id) {
      console.error("Dados incompletos para o pagamento.", amount, buyer_id, seller_id);
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, [product?.id ?? ""]: true }));

      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, buyer_id, seller_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao criar pagamento");
      }

      router.push(`/payments?client_secret=${data.clientSecret}`);
    } catch (err) {
      console.error("Erro no pagamento:", err);
    } finally {
      setLoading((prev) => ({ ...prev, [product?.id ?? ""]: false }));
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;

      try {
        const response = await api.get(`products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
      }
    }

    fetchProduct();
  }, [productId]);

  if (!product) {
    return <Loadingpage />;
  }

  if (!session) {
    return <Loadingpage />;
  }

  return (
    <div className="bg-gray-900 min-h-screen container mx-auto px-4 py-8 mt-16 max-w-full w-full transition-all">
      <Header />
      <div className="flex space-x-4 overflow-x-auto">
        {product.image && (
          <div className="w-full shadow-lg overflow-hidden mb-5 flex">
            <div className="relative w-full h-[360px]">
              <Image
                src={product.image || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-fill"
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
                className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium ${product.stock > 0
                  ? "bg-green-600 text-white"
                  : "bg-red-500 text-white"
                  }`}
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
            <div className="p-10 flex flex-col gap-2 pt-5 w-full">
              <h4 className="text-lg font-semibold text-gray-400 leading-snug">
                {product.description
                  .match(/.{1,65}/g)
                  ?.map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
              </h4>
              <h4 className="text-lg font-extrabold text-white truncate">{product.name}</h4>
              <p className="text-green-600 text-xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(product.price)}
              </p>
              <button
                className="mt-auto h-12 flex gap-2 items-center justify-center bg-green-600 text-white py-2 rounded-xl max-w-80 hover:bg-green-700 transition duration-300 shadow-md cursor-pointer relative disabled:bg-green-700"
                onClick={handleBuyNow}
                disabled={loading[product.id]}
              >
                {loading[product.id] ? (
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
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Details />
    </Suspense>
  );
}