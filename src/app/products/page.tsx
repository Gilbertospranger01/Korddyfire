"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/utils/api"; // substitui supabase por api
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import Side_Seller_Dashboard from "@/components/sideSellerdashboard";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Loadingpage from "@/loadingpages/loadingpage";

type Product = {
  id: string;
  image: string;
  name: string;
  description: string;
  price: number;
};

type UserMetadata = {
  name?: string;
  avatar_url?: string;
};

function Products() {
  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { session } = useAuth();
  const router = useRouter();

  const user = useMemo(() => {
    if (!session?.user) return null;

    const metadata = session.user.user_metadata as UserMetadata;

    return {
      id: session.user.id,
      name: metadata?.name || "User",
      picture: metadata?.avatar_url || null,
    };
  }, [session]);

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    if (!userId) return;

    async function fetchProduct() {
      setLoading(true);
      try {
        const response = await api.get(`products?user_id=${userId}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setProduct([]);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [userId]);

  if (!session) {
    return <Loadingpage />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header fixo no topo */}
      <header className="flex fixed w-full justify-between z-50 items-center p-4 bg-gray-800 shadow-md border-b border-gray-400">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/home")}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
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
        <main className="flex-1 p-4 mt-20 ml-60">
          <h1 className="text-2xl font-bold text-center mb-6">
            Meus Produtos
          </h1>

          {loading ? (
            <p className="text-center text-gray-400">Carregando...</p>
          ) : product.length === 0 ? (
            <p className="text-center text-red-500">
              Nenhum produto encontrado.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {product.map((product) => (
                <li
                  key={product.id}
                  className="bg-gray-700 p-4 rounded-lg shadow-lg"
                >
                  <Image
                    src={product.image || "/placeholder.jpg"}
                    width={200}
                    height={200}
                    priority
                    alt={product.name}
                    className="rounded-lg object-cover w-full h-40"
                  />
                  <h2 className="text-xl mt-2">{product.name}</h2>
                  <p className="text-gray-400">{product.description}</p>
                  <p className="text-yellow-400">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(product.price)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

export default Products;