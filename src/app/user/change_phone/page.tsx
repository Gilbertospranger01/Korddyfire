"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../../utils/supabase";
import { FiArrowLeft } from "react-icons/fi";
import Sideprofile from "@/components/sideprofile";
import Image from "next/image";
import Loadingpage from "../../../loadingpages/loadingpage";

interface PhoneInputProps {
  onChange: (value: string) => void;
  value?: string;
  name?: string;
  placeholder?: string;
  className?: string;
}

const Change_Phone = () => {
  const router = useRouter();

  const [currentPhone, setCurrentPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [otpSent, setOtpSent] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserPhone = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (error || !user) {
        setError("Erro ao obter o número de telefone do usuário.");
        setLoading(false);
        return;
      }

      setCurrentPhone(user.phone || "");
      setLoading(false);
    };

    fetchUserPhone();
  }, []);

  const sendOtp = async () => {
    setError("");
    setSuccess("");

    // Enviar código OTP para o número de telefone atual
    const { error } = await supabase.auth.resend({
      type: 'phone_change',
      phone: currentPhone,
    })

    if (error) {
      setError("Erro ao enviar código OTP. Tente novamente.");
      return;
    }

    setOtpSent(true);
    setSuccess("Código OTP enviado para o número de telefone.");
  };

  const verifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Atualizar o número de telefone após a verificação do OTP
    const { error: updateError } = await supabase.auth.updateUser({
      phone: currentPhone,
    });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("Número de telefone atualizado com sucesso! Faça login novamente.");
    setOtp("");

    await supabase.auth.signOut();
    router.push("/signin");
  };

  if (!session) {
    return (
      <Loadingpage />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Cabeçalho */}
      <div className="fixed top-0 left-0 w-full bg-gray-950 shadow-md py-3 px-6 flex items-center z-10">
        <button
          onClick={() => router.push("/home")}
          className="text-gray-400 hover:text-white transition cursor-pointer"
          aria-label="Voltar para página inicial"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="ml-4 text-lg font-semibold">Alterar Telefone</h1>
      </div>

      <Sideprofile />

      {/* Conteúdo */}
      <div className="ml-140 pt-20 px-8 pb-16 items-center justify-center">
        <div className="w-full max-w-md p-8 rounded shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-center">Alterar Número de Telefone</h1>

          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
          {success && <p className="mb-4 text-sm text-green-500">{success}</p>}

          {loading ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : (
            <form onSubmit={otpSent ? verifyOtp : sendOtp}>
              <div className="mb-4">
                <label htmlFor="currentPhone" className="block mb-1 text-sm">
                  Telefone Atual
                </label>
                <PhoneInput
                  name="currentPhone"
                  value={currentPhone}
                  onChange={(value: string) => setCurrentPhone(value)} // Passa o valor direto
                />
              </div>

              {otpSent ? (
                <div className="mb-4">
                  <label htmlFor="otp" className="block mb-1 text-sm">
                    Código OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Digite o código OTP"
                    required
                    value={otp}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOtp(e.target.value)
                    }
                    className="shadow appearance-none border rounded w-full py-3 px-4 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                >
                  Enviar Código OTP
                </button>
              )}

              {otpSent && (
                <button
                  type="submit"
                  className="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                >
                  Verificar OTP e Alterar Telefone
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


const countryCodes = [
  { code: "+244", name: "Angola", flag: "https://flagcdn.com/w40/ao.png" },
  { code: "+1", name: "United States", flag: "https://flagcdn.com/w40/us.png" },
  { code: "+44", name: "United Kingdom", flag: "https://flagcdn.com/w40/gb.png" },
  { code: "+55", name: "Brazil", flag: "https://flagcdn.com/w40/br.png" },
  { code: "+33", name: "France", flag: "https://flagcdn.com/w40/fr.png" },
  { code: "+49", name: "Germany", flag: "https://flagcdn.com/w40/de.png" },
  { code: "+351", name: "Portugal", flag: "https://flagcdn.com/w40/pt.png" },
];

const PhoneInput: React.FC<PhoneInputProps> = ({
  onChange,
  value,
  name,
  placeholder = "Phone number",
  className = "",
}) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value.replace(/\D/g, "");
    const formattedValue = `${selectedCountry.code} ${phoneNumber}`;
    onChange(formattedValue); // Passando o valor formatado
  };

  return (
    <div className={`relative mb-6 ${className}`}>
      <div className="flex rounded-lg items-center bg-gray-700 border border-gray-600 px-3 py-2">

        <Image
          src={selectedCountry.flag}
          alt={selectedCountry.name}
          width={40}
          height={30}
          unoptimized
          className="w-6 h-4 object-cover rounded-sm mr-2"
        />

        <select
          className="bg-transparent text-gray-100 text-sm outline-none"
          value={selectedCountry.code}
          onChange={(e) => {
            const country = countryCodes.find((c) => c.code === e.target.value);
            if (country) {
              setSelectedCountry(country);
              // Atualiza o valor de telefone com o código do país selecionado
              onChange(`${country.code} ${value?.replace(selectedCountry.code, "").trim() || ""}`);
            }
          }}
        >
          {countryCodes.map((country) => (
            <option key={country.code} value={country.code} className="bg-gray-800">
              {country.code}
            </option>
          ))}
        </select>

        <input
          type="text"
          name={name}
          value={value?.replace(selectedCountry.code, "").trim() || ""}
          onChange={handlePhoneChange} // Passando a função de mudança de telefone
          className="bg-transparent text-gray-100 flex-1 outline-none px-2"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default Change_Phone;
