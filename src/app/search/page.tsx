"use client";

import { useState } from "react";
import InputSearch from "../../components/input-search";
import supabase from "../../utils/supabase";

type Product = {
  name: string;
  description: string;
  price: number;
};

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${searchTerm}%`);

    if (error) {
      console.error("Erro ao buscar dados:", error);
    } else {
      setResults(data);
    }

    setLoading(false);
  };

  return (
    <div className="p-4">
      <InputSearch
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
        onClear={() => {
          setSearchTerm("");
          setResults([]);
        }}
      />

      {loading && <p className="text-gray-400 mt-2">Carregando...</p>}

      {results.length > 0 ? (
        <ul className="mt-2 bg-gray-800 text-white rounded-lg">
          {results.map((item, index) => (
            <li key={index} className="p-2 border-b border-gray-700">
              <strong>{item.name}</strong> - {item.description} - ${item.price}
            </li>
          ))}
        </ul>
      ) : (
        searchTerm.trim() && !loading && (
          <p className="text-gray-400 mt-2">Nenhum resultado encontrado.</p>
        )
      )}
    </div>
  );
};

export default Home;
