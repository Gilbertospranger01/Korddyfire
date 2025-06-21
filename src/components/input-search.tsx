"use client";

import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

interface InputSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  placeholder?: string;
  className?: string;
}

const InputSearch: React.FC<InputSearchProps> = ({
  value,
  onChange,
  onSearch,
  onClear,
  onFocus,
  name,
  placeholder = "Pesquisar...",
  className = "",
}) => {
  const router = useRouter();

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD") // remove acentos
      .replace(/[\u0300-\u036f]/g, "") // remove caracteres especiais
      .replace(/\s+/g, "-") // espaço vira hífen
      .replace(/[^\w\-]+/g, "") // remove símbolos
      .replace(/\-\-+/g, "-") // remove hífens duplicados
      .replace(/^-+|-+$/g, ""); // remove hífens no começo/fim
  };

  const handleSearch = () => {
    onSearch();
    if (value) {
      const slug = slugify(value);
      router.push(`/list?value=${slug}`);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="shadow appearance-none border w-90 py-3 px-4 pr-12 text-white leading-tight focus:outline-none focus:shadow-outline"
          placeholder={placeholder}
        />

        {value ? (
          <button
            onClick={onClear}
            className="absolute right-14 text-gray-400 hover:text-white cursor-pointer"
            aria-label="Clear search"
          >
            ✖
          </button>
        ) : (
          <button
            onClick={handleSearch}
            className="absolute right-14 text-gray-400 hover:text-white cursor-pointer"
            aria-label="Search"
          >
            <FaSearch />
          </button>
        )}
      </div>
    </div>
  );
};

export default InputSearch;

