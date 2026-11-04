import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server/db";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidMonetbilSignature(
  parameters: Record<string, string>,
  secret: string,
) {
  const receivedSignature = parameters.sign;
  if (!receivedSignature || !/^[a-f0-9]{32}$/i.test(receivedSignature)) {
    return false;
  }

  const signedValues = Object.keys(parameters)
    .filter((key) => key !== "sign")
    .sort()
    .map((key) => parameters[key])
    .join("");
  const expectedSignature = createHash("md5")
    .update(secret + signedValues)
    .digest("hex");
  return timingSafeEqual(
    Buffer.from(receivedSignature.toLowerCase(), "hex"),
    Buffer.from(expectedSignature, "hex"),
  );
}

export async function POST(request: Request) {
  const secret = process.env.MONETBIL_SERVICE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Monetbil notifications are not configured." }, { status: 503 });
  }

  let parameters: Record<string, string>;
  try {
    const formData = await request.formData();
    parameters = Object.fromEntries(
      [...formData.entries()].map(([key, value]) => [key, String(value)]),
    );
  } catch {
    return NextResponse.json({ error: "Invalid Monetbil notification." }, { status: 400 });
  }

  if (!isValidMonetbilSignature(parameters, secret)) {
    return NextResponse.json({ error: "Invalid Monetbil signature." }, { status: 403 });
  }

  const transactionId = parameters.transaction_id;
  const orderId = parameters.item_ref;
  const paymentRef = parameters.payment_ref;
  if (!transactionId || !orderId || !paymentRef) {
    return NextResponse.json({ error: "Monetbil notification is missing payment references." }, { status: 400 });
  }

  const database = getDatabase();
  const [order] = await database<{
    id: string;
    total_amount: string | number;
    reference_id: string;
    status: string;
  }[]>`
    SELECT id, total_amount, reference_id, status
    FROM orders
    WHERE id = ${orderId} AND reference_id = ${paymentRef}
    LIMIT 1
  `;
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json({ received: true });
  }

  let verificationResponse: Response;
  try {
    verificationResponse = await fetch(
      "https://api.monetbil.com/payment/v1/checkPayment",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ paymentId: transactionId }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );
  } catch (error) {
    console.error("Could not verify Monetbil transaction.", error);
    return NextResponse.json({ error: "Could not verify this payment notification." }, { status: 502 });
  }

  let result: unknown;
  try {
    result = await verificationResponse.json();
  } catch {
    return NextResponse.json({ error: "Monetbil returned an invalid verification response." }, { status: 502 });
  }

  const transaction = isRecord(result) && isRecord(result.transaction)
    ? result.transaction
    : null;
  if (!verificationResponse.ok || !transaction || !("status" in transaction)) {
    console.error("Monetbil transaction verification failed.");
    return NextResponse.json({ error: "Monetbil could not verify this payment." }, { status: 502 });
  }

  const notificationAmount = Number(parameters.amount);
  const verifiedAmount = transaction.amount;
  const notificationCurrency = parameters.currency;
  const verifiedCurrency = transaction.currency;
  if (
    !Number.isFinite(notificationAmount) ||
    notificationAmount !== Number(order.total_amount) ||
    (verifiedAmount !== undefined &&
      Number(verifiedAmount) !== Number(order.total_amount)) ||
    (notificationCurrency !== undefined && notificationCurrency !== "XAF") ||
    (typeof verifiedCurrency === "string" && verifiedCurrency !== "XAF")
  ) {
    console.error("Monetbil transaction details did not match the order.", { orderId });
    return NextResponse.json({ error: "Payment details do not match this order." }, { status: 400 });
  }

  const status = Number(transaction.status);
  const nextStatus =
    status === 1
      ? "SUCCESSFUL"
      : status === 7
        ? "TESTMODE_SUCCESSFUL"
        : status === -1
          ? "CANCELLED"
          : status === 9
            ? "TESTMODE_CANCELLED"
            : status === 0
              ? "FAILED"
              : status === 8
                ? "TESTMODE_FAILED"
                : null;
  if (!nextStatus) {
    return NextResponse.json({ received: true, pending: true });
  }

  await database`
    UPDATE orders
    SET status = ${nextStatus}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${order.id} AND status = 'PENDING'
  `;

  return NextResponse.json({ received: true });
}
