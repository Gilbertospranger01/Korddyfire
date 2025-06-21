"use client";

export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-6 py-10">
            <h1 className="text-3xl font-bold mb-6">Termos de Uso</h1>
            <p className="text-gray-300 mb-4">
                Ao acessar e utilizar nossa plataforma, você concorda com os seguintes termos e condições...
            </p>
            <p className="text-gray-300 mb-4">
                1. Você não pode usar nossos serviços para atividades ilegais.
            </p>
            <p className="text-gray-300 mb-4">
                2. A empresa não se responsabiliza por problemas técnicos...
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
