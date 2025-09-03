'use client';
import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

type CheckoutProps = {
  amount: number;
  buyerId: string;
  sellerId: string;
};

export default function CheckoutForm({ amount, buyerId, sellerId }: CheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!stripe || !elements) {
        setMessage('Stripe ainda não carregou.');
        setLoading(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setMessage('Cartão inválido.');
        setLoading(false);
        return;
      }

      // 🔹 Envia os dados para o backend
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          buyer_id: buyerId,
          seller_id: sellerId,
        }),
      });

      if (!amount || !buyerId || !sellerId) {
        setMessage('Dados incompletos. Verifique sellerId e buyerId.');
        setLoading(false);
        return;
      }

      const { clientSecret, error } = await res.json();

      // Adicione logs para depuração
      console.log('Seller ID recebido:', sellerId);
      console.log('Resultado da consulta no Supabase:', clientSecret, error);

      if (error || !clientSecret) {
        setMessage('Erro ao obter clientSecret.');
        setLoading(false);
        return;
      }

      // 🔹 Confirma o pagamento
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        setMessage(result.error.message || 'Pagamento falhou.');
      } else if (result.paymentIntent?.status === 'succeeded') {
        setMessage('✅ Pagamento realizado com sucesso!');
      } else {
        setMessage('Algo inesperado aconteceu.');
      }
    } catch (err: unknown) {
      console.error(err);
      setMessage('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
      <CardElement className="p-2 border border-gray-300 w-100" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 cursor-pointer"
      >
        {loading ? 'Processando...' : 'Pagar'}
      </button>
      {message && <p className="mt-2 text-center text-sm text-green-600">{message}</p>}
    </form>
  );
}
