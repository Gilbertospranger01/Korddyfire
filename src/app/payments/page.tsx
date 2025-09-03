'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/CheckoutForm';

const stripePromise = loadStripe("pk_test_51QAcWD2KBWOx0p4bx0EAy5NCCupePjyEgnPneYy5M7sgcYhInEDF7Rm19aqe5pPGzaLWEhtgOFrOHFMyHj1Gz9h800ThXvzjm4");

export default function CheckoutPage() {
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();

  const amount = Number(searchParams.get("amount") || 0);
  const buyer_id = searchParams.get("buyer_id") || "";
  const seller_id = searchParams.get("seller_id") || "";

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // se precisar checar sessão, declare "session" de verdade antes:
  // const session = useSession() ou algo do seu auth
  // if (!session) return <Loadingpage />;

  return (
    <div className="min-h-screen flex items-center bg-gray-900 justify-center">
      <Elements stripe={stripePromise}>
        <CheckoutForm amount={amount} buyerId={buyer_id} sellerId={seller_id} />
      </Elements>
    </div>
  );
}