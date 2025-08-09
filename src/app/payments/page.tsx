'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import Loadingpage from '@/loadingpages/loadingpage';

const stripePromise = loadStripe("pk_test_51QAcWD2KBWOx0p4bx0EAy5NCCupePjyEgnPneYy5M7sgcYhInEDF7Rm19aqe5pPGzaLWEhtgOFrOHFMyHj1Gz9h800ThXvzjm4");

interface CheckoutPageProps {
  amount: number;
  buyer_id: string;
  seller_id: string;
}

export default function CheckoutPage({ amount, buyer_id, seller_id }: CheckoutPageProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures this component only renders on the client
  }, []);

  if (!isClient) return null; // Prevent SSR rendering

  if (!session) {
    return (
      <Loadingpage />
    );
  }

  return (
    <div className="min-h-screen flex items-center bg-gray-900 justify-center">
      <Elements stripe={stripePromise}>
        <CheckoutForm
          amount={amount}
          buyerId={buyer_id}
          sellerId={seller_id}
        />
      </Elements>
    </div>
  );
}
