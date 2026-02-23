"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import Header from "@/components/header";
import Image from "next/image";
import { Heart } from "lucide-react";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Loadingpage from "@/loadingpages/loadingpage";

// Tipagem alinhada ao seu Sequelize Model
interface ProductData {
  product_id: string;      // Alterado de 'id'
  seller_id: string;       // Alterado de 'user_id'
  product_name: string;    // Alterado de 'name'
  product_price: number;   // Alterado de 'price'
  product_description: string;
  product_image?: string;
  product_stock: number;
}

function Details() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const { session } = useAuth();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      // Validação simples: se não for um UUID (com hifens ou 32-36 caracteres), 
      // evita chamar o banco para não causar o erro 22P02 do Postgres
      if (productId.length < 30) return; 

      try {
        const response = await api.get(`products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleBuyNow = async () => {
    if (!product || !session?.user?.id) return;

    const amount = product.product_price;
    const seller_id = product.seller_id;
    const buyer_id = session.user.id;

    setIsBuying(true);

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, buyer_id, seller_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao criar pagamento");

      router.push(`/payments?client_secret=${data.clientSecret}`);
    } catch (err) {
      console.error("Erro no pagamento:", err);
    } finally {
      setIsBuying(false);
    }
  };

  if (!product || !session) return <Loadingpage />;

  return (
    <div className="bg-gray-900 min-h-screen container mx-auto px-4 py-8 mt-16 max-w-full w-full">
      <Header />
      <div className="flex flex-col md:flex-row bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
        
        {/* Lado Esquerdo: Imagem */}
        <div className="relative w-full md:w-1/2 h-[400px] md:h-[500px]">
          <Image
            src={product.product_image || "/placeholder.jpg"}
            alt={product.product_name}
            fill
            className="object-cover"
            priority
          />
          <button
            onClick={() => setFavorites(prev => ({ ...prev, [product.product_id]: !prev[product.product_id] }))}
            className="absolute top-4 right-4 bg-black/40 p-2 rounded-full hover:bg-black/60 transition"
          >
            <Heart
              size={28}
              className={favorites[product.product_id] ? "fill-red-500 text-red-500" : "text-white"}
            />
          </button>
          <span className={`absolute top-4 left-4 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
            product.product_stock > 0 ? "bg-green-600 text-white" : "bg-red-500 text-white"
          }`}>
            {product.product_stock > 0 ? "Disponível" : "Esgotado"}
          </span>
        </div>

        {/* Lado Direito: Informações */}
        <div className="p-8 md:p-12 flex flex-col justify-center w-full md:w-1/2">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
            {product.product_name}
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-400 text-lg leading-relaxed italic">
              "{product.product_description}"
            </p>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl font-bold text-green-500">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(product.product_price)}
            </span>
          </div>

          <button
            className="w-full md:max-w-xs h-14 bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
            onClick={handleBuyNow}
            disabled={isBuying || product.product_stock <= 0}
          >
            {isBuying ? (
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            ) : (
              "Comprar Agora"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loadingpage />}>
      <Details />
    </Suspense>
  );
}