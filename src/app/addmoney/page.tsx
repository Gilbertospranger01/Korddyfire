'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import supabase from '../../utils/supabase';
import Loadingpage from '../../loadingpages/loadingpage';

export default function AddMoney() {
    const [amount, setAmount] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserId() {
            const { data, error } = await supabase.auth.getSession();
            if (error || !data.session) {
                alert('Erro ao obter informações do usuário.');
                return;
            }
            setUserId(data.session.user.id);
        }

        fetchUserId();
    }, []);

    async function handleAddMoney() {
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            alert('Insira um valor válido.');
            return;
        }
        if (!userId) {
            alert('Usuário não autenticado.');
            return;
        }

        setLoading(true);

        // Verificar se o usuário já tem uma carteira
        const { data: wallet, error: fetchError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Ignorar erro de "not found"
            alert(`Erro ao buscar carteira: ${fetchError.message}`);
            setLoading(false);
            return;
        }

        let updateError;
        let newWalletId = wallet?.id || null;

        if (wallet) {
            // Atualizar saldo existente
            const { error } = await supabase
                .from('wallets')
                .update({ balance: wallet.balance + Number(amount) })
                .eq('user_id', userId);

            updateError = error;
            newWalletId = wallet.id;
        } else {
            // Criar uma nova carteira
            const { data, error } = await supabase
                .from('wallets')
                .insert([{ user_id: userId, balance: Number(amount), created_at: new Date() }])
                .select()
                .single();

            updateError = error;
            newWalletId = data?.id || null;
        }

        if (updateError) {
            alert(`Erro ao adicionar dinheiro: ${updateError.message}`);
            setLoading(false);
            return;
        }

        if (newWalletId) {
            // Inserir transação na tabela wallet_transactions
            const { error: transactionError } = await supabase
                .from('wallet_transactions')
                .insert([{
                    user_id: userId,
                    wallet_id: newWalletId,
                    amount: Number(amount),
                    type: 'deposit',
                    status: 'completed',
                    created_at: new Date()
                }]);

            if (transactionError) {
                alert(`Erro ao registrar transação: ${transactionError.message}`);
                setLoading(false);
                return;
            }
        }

        alert('Dinheiro adicionado com sucesso!');
        router.push('/wallet');
        setLoading(false);
    }

    if (!session) {
        return (
            <Loadingpage />
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
            <motion.div className="w-full max-w-2xl flex items-center gap-4"
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <button className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
                    onClick={() => router.back()}>
                    <FiArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-semibold">Adicionar Dinheiro</h1>
            </motion.div>

            <motion.div className="mt-10 w-full max-w-lg p-6 bg-gray-800 rounded-xl shadow-lg text-center"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="text-gray-400">Valor a adicionar</p>
                <p className="text-3xl font-bold text-green-400">${amount || '0.00'}</p>

                <input type="number" placeholder="Insira um valor"
                    className="mt-4 w-full p-3 rounded-lg bg-gray-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || '')} />

                <button className="mt-6 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold transition disabled:opacity-50 w-full"
                    onClick={handleAddMoney} disabled={loading}>
                    {loading ? 'Processando...' : <>
                        <FiCheckCircle size={20} /> Confirmar
                    </>}
                </button>
            </motion.div>
        </div>
    );
}
