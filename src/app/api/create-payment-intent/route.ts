'use server';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import api from '@/utils/api';  // tua camada customizada

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

    // Busca Stripe Account ID via api (não supabase direto)
    const sellerStripeAccountId = await api.profiles.getStripeAccountId(seller_id);

    if (!sellerStripeAccountId) {
      return NextResponse.json(
        { error: 'Conta Stripe do vendedor não encontrada' },
        { status: 404 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      application_fee_amount: Math.round(amount * 0.07),
      transfer_data: { destination: sellerStripeAccountId },
    });

    // Registra compra via camada api
    await api.purchasing.insertPurchase({
      buyer_id,
      seller_id,
      amount,
      status: paymentIntent.status,
      stripe_payment_intent: paymentIntent.id,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro ao criar PaymentIntent' },
      { status: 500 }
    );
  }
}