// /api/stripe/request-card/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, email, phone, birthdate, nationality, address, currency } = body;

    if (!userId || !name || !email || !phone || !birthdate || !nationality || !address || !currency) {
      return NextResponse.json({
        error: {
          message: 'Campos obrigatórios faltando.',
          type: 'validation_error',
          statusCode: 400,
          fields: { userId, name, email, phone, birthdate, nationality, address, currency }
        }
      }, { status: 400 });
    }

    const [day, month, year] = birthdate.split('/').map(Number);

    const cardholder = await stripe.issuing.cardholders.create({
      name,
      email,
      phone_number: phone,
      status: 'active',
      type: 'individual',
      individual: {
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || '',
        dob: { day, month, year },
      },
      billing: {
        address: {
          line1: address.line1,
          city: address.city,
          country: address.country,
          postal_code: address.postal_code,
          state: address.state,
        },
      },
    });

    const card = await stripe.issuing.cards.create({
      cardholder: cardholder.id,
      currency,
      type: 'virtual',
    });

    return NextResponse.json({ message: 'Card created successfully', card }, { status: 200 });

  } catch (error: any) {
    console.error("[ERROR]", error);
    return NextResponse.json({
      error: {
        message: error.message || 'Erro interno ao criar cartão.',
        type: error.type || 'server_error',
        statusCode: 500,
        details: error
      }
    }, { status: 500 });
  }
}
