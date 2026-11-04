"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/ui/components/Cart/CartProvider";
import type { VendorContact } from "@/lib/server/vendor-contacts";

const deliveryFee = 2000;

export default function CheckoutOptions({
  buyerName,
  buyerPhone,
  vendorContacts,
  contactsAvailable,
}: {
  buyerName: string;
  buyerPhone: string;
  vendorContacts: VendorContact[];
  contactsAvailable: boolean;
}) {
  const { items } = useCart();
  const [method, setMethod] = useState<"MONETBIL" | "WHATSAPP">("MONETBIL");
  const [phone, setPhone] = useState(buyerPhone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;
  const orderMessage = [
    `Hello, I'm ${buyerName}. I would like to place this order:`,
    "",
    ...items.map(
      (item) =>
        `- ${item.name} (${item.color}, ${item.size}), quantity ${item.quantity}: ${(item.price * item.quantity).toLocaleString()} FCFA`,
    ),
    "",
    `Items subtotal: ${subtotal.toLocaleString()} FCFA`,
    `Delivery: ${deliveryFee.toLocaleString()} FCFA`,
    `Total: ${total.toLocaleString()} FCFA`,
  ].join("\n");

  async function submitMonetbil() {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "MONETBIL",
          phoneNumber: phone,
          items: items.map((item) => ({
            itemId: item.id,
            quantity: item.quantity,
          })),
        }),
      });
      const result: unknown = await response.json();
      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("paymentUrl" in result) ||
        typeof result.paymentUrl !== "string"
      ) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not start payment. Please try again.";
        throw new Error(message);
      }

      window.location.assign(result.paymentUrl);
    } catch (submitError) {
      console.error("Monetbil checkout request failed.", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not start payment. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-[#262524]">Your cart is empty</h1>
        <p className="mt-2 text-sm text-[#5F5A56]">Add items before proceeding to checkout.</p>
        <Link href="/" className="mt-6 inline-block rounded bg-[#935F4C] px-5 py-3 text-sm font-semibold text-white">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-xl border border-[#EFECE6] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#262524]">Checkout</h1>
        <p className="mt-1 text-sm text-[#5F5A56]">Choose how you would like to complete your order.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            aria-pressed={method === "MONETBIL"}
            onClick={() => setMethod("MONETBIL")}
            className={`rounded-lg border p-4 text-left text-[#262524] transition-colors ${method === "MONETBIL" ? "border-[#935F4C] bg-[#F7F4F0]" : "border-[#EFECE6] bg-[#FAFAFA] hover:border-[#D9C9C0] hover:bg-[#F7F4F0]"}`}
          >
            <span className="block font-semibold">Pay with Monetbil</span>
            <span className="mt-1 block text-sm text-[#5F5A56]">Secure mobile money checkout</span>
          </button>
          <button
            type="button"
            aria-pressed={method === "WHATSAPP"}
            onClick={() => setMethod("WHATSAPP")}
            className={`rounded-lg border p-4 text-left text-[#262524] transition-colors ${method === "WHATSAPP" ? "border-[#935F4C] bg-[#F7F4F0]" : "border-[#EFECE6] bg-[#FAFAFA] hover:border-[#D9C9C0] hover:bg-[#F7F4F0]"}`}
          >
            <span className="block font-semibold">Order through WhatsApp</span>
            <span className="mt-1 block text-sm text-[#5F5A56]">Send your item list to the vendor</span>
          </button>
        </div>

        {method === "MONETBIL" ? (
          <div className="mt-6">
            <label htmlFor="payment-phone" className="block text-sm font-medium text-[#262524]">
              Mobile money number
            </label>
            <input
              id="payment-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+237 6XX XXX XXX"
              className="mt-2 w-full rounded border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 focus:border-[#935F4C] focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20"
            />
            <p className="mt-2 text-xs text-[#7A746F]">Enter the number you will use to authorize payment.</p>
            <button
              type="button"
              disabled={isSubmitting || !phone.trim()}
              onClick={submitMonetbil}
              className="mt-5 w-full rounded bg-[#935F4C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7A4E3E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Connecting to Monetbil..." : `Continue to payment · ${total.toLocaleString()} FCFA`}
            </button>
          </div>
        ) : (
          <div className="mt-6">
            {contactsAvailable && vendorContacts.length > 0 ? (
              <div className="space-y-3">
                {vendorContacts.map((contact) => {
                  const whatsappNumber = contact.phoneNumber.replace(/\D/g, "");
                  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
                  return (
                    <a
                      key={contact.id}
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-md border border-[#935F4C] px-4 py-3 text-center text-sm font-semibold text-[#935F4C] hover:bg-[#F7F4F0]"
                    >
                      Send order to {contact.label}
                    </a>
                  );
                })}
              </div>
            ) : (
              <p role="alert" className="rounded border border-[#D9C9C0] bg-[#F7F4F0] p-3 text-sm text-[#7A4E3E]">
                Vendor contacts are not available yet. Please try Monetbil or contact the store.
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-[#5F5A56]">
              WhatsApp opens a message with your cart details. The vendor will confirm availability, delivery, and payment.
            </p>
          </div>
        )}

        {error && <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      </section>

      <aside className="h-fit rounded-xl border border-[#EFECE6] bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-[#262524]">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="text-[#5F5A56]">
                {item.name} · {item.color} · {item.size} × {item.quantity}
              </span>
              <span className="shrink-0">{(item.price * item.quantity).toLocaleString()} FCFA</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-2 border-t border-[#EFECE6] pt-4 text-sm text-[#5F5A56]">
          <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toLocaleString()} FCFA</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee.toLocaleString()} FCFA</span></div>
          <div className="flex justify-between pt-2 text-base font-semibold text-[#262524]"><span>Total</span><span>{total.toLocaleString()} FCFA</span></div>
        </div>
      </aside>
    </main>
  );
}
