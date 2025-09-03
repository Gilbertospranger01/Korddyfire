'use server';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import api from '@/utils/api';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

interface RequestBody {
  amount: number;
  buyer_id: string;
  seller_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const { amount, buyer_id, seller_id }: RequestBody = await req.json();

    if (
      !amount ||
      !Number.isInteger(amount) ||
      amount <= 0 ||
      !buyer_id ||
      !seller_id
    ) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // 🔹 Busca Stripe Account ID na API (ajusta endpoint conforme teu backend expõe)
    const { data } = await api.get<{ stripeAccountId: string }>(
      `/profiles/${seller_id}/stripe-account`
    );
    const sellerStripeAccountId = data?.stripeAccountId;

    if (!sellerStripeAccountId) {
      return NextResponse.json(
        { error: 'Conta Stripe do vendedor não encontrada' },
        { status: 404 }
      );
    }

    // 🔹 Cria PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      application_fee_amount: Math.round(amount * 0.07),
      transfer_data: { destination: sellerStripeAccountId },
    });

    // 🔹 Registra a compra na API
    await api.post(`/purchasing`, {
      buyer_id,
      seller_id,
      amount,
      status: paymentIntent.status,
      stripe_payment_intent: paymentIntent.id,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Erro ao criar PaymentIntent:', error);
    return NextResponse.json(
      { error: 'Erro ao criar PaymentIntent' },
      { status: 500 }
    );
  }
}