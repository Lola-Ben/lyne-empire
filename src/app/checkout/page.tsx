import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/server/users";
import {
  getVendorContacts,
  type VendorContact,
} from "@/lib/server/vendor-contacts";
import CheckoutOptions from "./CheckoutOptions";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const user = userId ? await getUserById(userId) : null;

  if (!session?.user || !user) {
    const callbackUrl = encodeURIComponent("/checkout");
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <section className="rounded-xl border border-[#EFECE6] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-[#262524]">Sign in to checkout</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#5F5A56]">
            Sign in to your account or create one before placing an order. Your cart will be kept while you do.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/login?callbackUrl=${callbackUrl}`}
              className="rounded-md bg-[#935F4C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7A4E3E]"
            >
              Sign in
            </Link>
            <Link
              href={`/register?callbackUrl=${callbackUrl}`}
              className="rounded-md border border-[#935F4C] px-5 py-3 text-sm font-semibold text-[#935F4C] hover:bg-[#F7F4F0]"
            >
              Create account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  let contacts: VendorContact[] = [];
  let contactsAvailable = true;
  try {
    contacts = await getVendorContacts();
  } catch (error) {
    console.error("Unable to load WhatsApp vendor contacts for checkout.", error);
    contactsAvailable = false;
  }

  return (
    <CheckoutOptions
      buyerName={session.user.name ?? "Customer"}
      buyerPhone={session.user.phone ?? user.phone_number}
      vendorContacts={contacts}
      contactsAvailable={contactsAvailable}
    />
  );
}
