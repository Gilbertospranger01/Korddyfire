"use client";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-6 py-10">
            <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
            <p className="text-gray-300 mb-4">
                Sua privacidade é importante para nós. Esta política explica como coletamos, usamos e protegemos suas informações...
            </p>
            <p className="text-gray-300 mb-4">
                1. Coletamos informações como nome, email e dados de navegação.
            </p>
            <p className="text-gray-300 mb-4">
                2. Não compartilhamos suas informações sem seu consentimento...
            </p>
            <button
                onClick={() => window.history.back()}
                className="text-green-400 hover:underline cursor-pointer"
            >
                Voltar
            </button>
        </div>
    );
}
