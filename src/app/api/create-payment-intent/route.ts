'use server';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import supabase from '@/utils/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); 
    const { amount, buyer_id, seller_id } = body;
    // Adicione logs para depuração
    console.log('ID recebido:', seller_id, amount, buyer_id);
    console.log("BODY RECEBIDO:", body);

    // 1. Buscar a conta Stripe do vendedor via seller_id
    const { data: sellerData, error } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', seller_id)
      .single();

    // Adicione logs para depuração
    console.log('Resultado da consulta no Supabase:', sellerData, error);

    if (error || !sellerData) {
      return NextResponse.json({ error: 'Conta Stripe do vendedor não encontrada' }, { status: 400 });
    }

    const sellerStripeAccountId = sellerData.stripe_account_id;

    // 2. Criar o PaymentIntent com divisão (plataforma + vendedor)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      application_fee_amount: Math.round(amount * 0.07), // 7% para a plataforma
      transfer_data: {
        destination: sellerStripeAccountId, // Stripe do vendedor
      },
    });

    // 3. Registrar a compra no banco
    await supabase.from('purchasing').insert({
      buyer_id: buyer_id,
      seller_id: seller_id,
      amount: amount,
      status: paymentIntent.status,
      stripe_payment_intent: paymentIntent.id,
    });

    return await NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao criar PaymentIntent' }, { status: 500 });
  }
}
