import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/server/db";
import { getUserById, normalizePhoneNumber } from "@/lib/server/users";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  paymentMethod: z.literal("MONETBIL"),
  phoneNumber: z.string().trim().min(1).max(30),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1).max(200),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1)
    .max(40),
});

const productIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const deliveryFee = 2000;

class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function createMonetbilSignature(
  parameters: Record<string, string>,
  secret: string,
) {
  const signedValues = Object.keys(parameters)
    .sort()
    .map((key) => parameters[key])
    .join("");

  return createHash("md5").update(secret + signedValues).digest("hex");
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in before starting checkout." }, { status: 401 });
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    return NextResponse.json(
      { error: "Your account could not be verified. Please sign in again." },
      { status: 401 },
    );
  }

  const serviceKey = process.env.MONETBIL_SERVICE_KEY;
  const serviceSecret = process.env.MONETBIL_SERVICE_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!serviceKey || !serviceSecret || !appUrl) {
    return NextResponse.json(
      { error: "Monetbil checkout is not configured on the server." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid checkout details." },
      { status: 400 },
    );
  }

  const payerPhone = normalizePhoneNumber(parsed.data.phoneNumber);
  if (!payerPhone) {
    return NextResponse.json({ error: "Enter a valid Cameroon mobile number." }, { status: 400 });
  }

  if (new Set(parsed.data.items.map((item) => item.itemId)).size !== parsed.data.items.length) {
    return NextResponse.json({ error: "Cart contains duplicate items." }, { status: 400 });
  }

  const itemRefs: Array<{
    productId: string;
    size: string;
    color: string;
    quantity: number;
  }> = [];
  for (const item of parsed.data.items) {
    const [productId, size, ...colorParts] = item.itemId.split("::");
    const color = colorParts.join("::");
    if (!productIdPattern.test(productId ?? "") || !size || !color) {
      return NextResponse.json(
        { error: "The cart contains an invalid product selection." },
        { status: 400 },
      );
    }
    itemRefs.push({ productId, size, color, quantity: item.quantity });
  }

  const database = getDatabase();
  const paymentRef = randomUUID();
  let createdOrderId: string | null = null;

  try {
    const order = await database.begin(async (transaction) => {
      const resolvedItems: Array<{
        productId: string;
        variantId: string;
        quantity: number;
        unitPrice: number;
      }> = [];
      let subtotal = 0;

      for (const item of itemRefs) {
        const [variant] =
          item.size === "One size"
            ? await transaction<{
                product_id: string;
                variant_id: string;
                base_price: string | number;
                price_override: string | number | null;
                stock_qty: number;
              }[]>`
                SELECT p.id AS product_id, pv.id AS variant_id, p.base_price,
                  pv.price_override, pv.stock_qty
                FROM products p
                JOIN product_variants pv ON pv.product_id = p.id
                WHERE p.id = ${item.productId}
                  AND pv.color = ${item.color}
                  AND pv.size IS NULL
                FOR UPDATE OF pv
              `
            : await transaction<{
                product_id: string;
                variant_id: string;
                base_price: string | number;
                price_override: string | number | null;
                stock_qty: number;
              }[]>`
                SELECT p.id AS product_id, pv.id AS variant_id, p.base_price,
                  pv.price_override, pv.stock_qty
                FROM products p
                JOIN product_variants pv ON pv.product_id = p.id
                WHERE p.id = ${item.productId}
                  AND pv.color = ${item.color}
                  AND pv.size = ${item.size}
                FOR UPDATE OF pv
              `;

        if (!variant) {
          throw new CheckoutError("A product option in your cart is no longer available.", 409);
        }
        if (variant.stock_qty < item.quantity) {
          throw new CheckoutError("There is not enough stock for an item in your cart.", 409);
        }

        const unitPrice = Number(variant.price_override ?? variant.base_price);
        subtotal += unitPrice * item.quantity;
        resolvedItems.push({
          productId: variant.product_id,
          variantId: variant.variant_id,
          quantity: item.quantity,
          unitPrice,
        });
      }

      const total = subtotal + deliveryFee;
      const [createdOrder] = await transaction<{ id: string }[]>`
        INSERT INTO orders (
          user_id, payer_phone, payment_provider, total_amount, currency, status, reference_id
        )
        VALUES (
          ${user.id}, ${payerPhone}, 'MONETBIL', ${total}, 'XAF', 'PENDING', ${paymentRef}
        )
        RETURNING id
      `;

      for (const item of resolvedItems) {
        await transaction`
          INSERT INTO order_items (order_id, product_id, variant_id, quantity, price_at_purchase)
          VALUES (
            ${createdOrder.id}, ${item.productId}, ${item.variantId},
            ${item.quantity}, ${item.unitPrice}
          )
        `;
      }

      return { id: createdOrder.id, total };
    });
    createdOrderId = order.id;

    const baseUrl = appUrl.replace(/\/+$/, "");
    const parameters: Record<string, string> = {
      amount: String(order.total),
      currency: "XAF",
      first_name: session.user.name ?? "",
      item_ref: order.id,
      locale: "en",
      notify_url: `${baseUrl}/api/webhooks/monetbil`,
      payment_ref: paymentRef,
      phone: payerPhone,
      return_url: `${baseUrl}/checkout/return?orderId=${encodeURIComponent(order.id)}`,
      user: user.id,
    };
    if (session.user.email) {
      parameters.email = session.user.email;
    }
    parameters.sign = createMonetbilSignature(parameters, serviceSecret);

    const monetbilResponse = await fetch(
      `https://www.monetbil.com/widget/v2.1/${encodeURIComponent(serviceKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(parameters),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      },
    );
    let monetbilResult: unknown;
    try {
      monetbilResult = await monetbilResponse.json();
    } catch {
      monetbilResult = null;
    }
    const paymentUrl =
      typeof monetbilResult === "object" &&
      monetbilResult !== null &&
      "payment_url" in monetbilResult &&
      typeof monetbilResult.payment_url === "string"
        ? monetbilResult.payment_url
        : null;

    if (!monetbilResponse.ok || !paymentUrl) {
      await database`
        UPDATE orders SET status = 'PAYMENT_INIT_FAILED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${order.id} AND status = 'PENDING'
      `;
      console.error("Monetbil did not return a payment URL.", monetbilResult);
      return NextResponse.json(
        { error: "Monetbil could not start this payment. Please try again." },
        { status: 502 },
      );
    }

    const parsedPaymentUrl = new URL(paymentUrl);
    if (
      parsedPaymentUrl.protocol !== "https:" ||
      parsedPaymentUrl.hostname !== "www.monetbil.com" ||
      !parsedPaymentUrl.pathname.startsWith("/pay/")
    ) {
      await database`
        UPDATE orders SET status = 'PAYMENT_INIT_FAILED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${order.id} AND status = 'PENDING'
      `;
      console.error("Monetbil returned an unexpected payment URL.");
      return NextResponse.json(
        { error: "Monetbil returned an invalid payment destination." },
        { status: 502 },
      );
    }

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Could not start Monetbil checkout.", error);
    if (createdOrderId) {
      try {
        await database`
          UPDATE orders SET status = 'PAYMENT_INIT_FAILED', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${createdOrderId} AND status = 'PENDING'
        `;
      } catch (updateError) {
        console.error("Could not update failed Monetbil order status.", updateError);
      }
    }
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
