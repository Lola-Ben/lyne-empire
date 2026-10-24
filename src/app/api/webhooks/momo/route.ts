import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require', max: 1 });

export async function POST(request: Request) {
  try {
    // 1. Extract raw data payload sent from the local aggregator gateway
    const body = await request.json();
    
    // Note: Parameter names vary slightly depending on your chosen aggregator (e.g., Campay vs Monetbil)
    // We will parse standard industry variables: reference, status, and transaction amount
    const { reference, status, amount } = body;

    if (!reference || !status) {
      return NextResponse.json({ success: false, error: "Missing required tracking parameters." }, { status: 400 });
    }

    console.log(`🔔 Webhook received for Reference: ${reference} | Status: ${status}`);

    // 2. Fetch the corresponding order details from your Postgres database
    const [order] = await sql`
      SELECT id, status, total_amount FROM orders WHERE reference_id = ${reference}
    `;

    if (!order) {
      console.warn(`⚠️ Transaction reference "${reference}" does not match any store records.`);
      return NextResponse.json({ success: false, error: "Order reference tracker not found." }, { status: 442 });
    }

    // If the order has already been finalized by a previous hook retry loop, terminate execution early
    if (order.status === 'SUCCESSFUL' || order.status === 'FAILED') {
      return NextResponse.json({ success: true, message: "Order state has already been processed." }, { status: 200 });
    }

    // 3. Map network provider statuses to your store states
    let finalStatus = 'PENDING';
    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus === 'SUCCESS' || normalizedStatus === 'SUCCESSFUL' || normalizedStatus === 'APPROVED') {
      finalStatus = 'SUCCESSFUL';
    } else if (normalizedStatus === 'FAILED' || normalizedStatus === 'DECLINED' || normalizedStatus === 'CANCELLED') {
      finalStatus = 'FAILED';
    }

    // 4. Update order state and timestamp variables inside an atomic transaction block
    if (finalStatus !== 'PENDING') {
      await sql`
        UPDATE orders 
        SET status = ${finalStatus}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${order.id}
      `;
      
      console.log(`✅ Order ${order.id} status updated successfully to: ${finalStatus}`);
      
      // Future Enhancement Hook: If SUCCESSFUL, dispatch an automated receipt confirmation notice 
      // via your local SMS network gateway to the customer's phone line here.
    }

    // Acknowledge receipt of the webhook with a standard 200 response to prevent the aggregator from retrying
    return NextResponse.json({ success: true, message: "Webhook processed and registered successfully." }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Critical Webhook Engine Processing Failure:", error);
    return NextResponse.json({ success: false, error: "Internal processing exception encountered." }, { status: 500 });
  }
}
