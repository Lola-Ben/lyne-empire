import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/server/db";
import { getUserById } from "@/lib/server/users";

export const dynamic = "force-dynamic";

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
  }

  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const database = getDatabase();
  const [order] = await database<{ status: string }[]>`
    SELECT status FROM orders WHERE id = ${orderId} AND user_id = ${user.id} LIMIT 1
  `;
  if (!order) notFound();

  const successful = order.status === "SUCCESSFUL";
  const testMode = order.status === "TESTMODE_SUCCESSFUL";
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <section className="rounded-xl border border-[#EFECE6] bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-[#262524]">
          {successful ? "Payment confirmed" : testMode ? "Test payment completed" : "Payment processing"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#5F5A56]">
          {successful
            ? "Your order is paid. Thank you for shopping with Lyne Empire."
            : testMode
              ? "Monetbil confirmed this transaction in test mode. No real payment was collected."
              : "Monetbil has returned you to the store. Your order status will update after payment verification."}
        </p>
        <Link href="/" className="mt-6 inline-block rounded bg-[#935F4C] px-5 py-3 text-sm font-semibold text-white">
          Continue shopping
        </Link>
      </section>
    </main>
  );
}
