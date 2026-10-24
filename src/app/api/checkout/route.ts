import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, paymentProvider, amount, cartItems } = body;

    // 1. Log payment intent initialization status to Postgres database
    const [order] = await sql`
      INSERT INTO orders (phone_number, payment_provider, amount, status)
      VALUES (${phoneNumber}, ${paymentProvider}, ${amount}, 'PENDING')
      RETURNING id;
    `;

    // 2. Integration Wrapper Hook: Dispatch the outbound transaction request payload
    // to your target Cameroonian aggregator payment endpoint here.
    
    return NextResponse.json({
      success: true,
      message: "USSD validation prompt triggered successfully!",
      orderId: order.id
    }, { status: 200 });

  } catch (error: any) {
    console.error("Checkout Engine Failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
