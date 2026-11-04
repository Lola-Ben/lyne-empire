import AddNewProduct from "@/ui/components/AddNewProduct/AddNewProduct";
import Link from "next/link";
import { getProductAdminAccess } from "@/lib/server/product-admin";
import { getProductCategories } from "@/lib/server/products";

export const dynamic = "force-dynamic";

export default async function Page() {
  const access = await getProductAdminAccess();

  if (access.status !== "authorized") {
    const message =
      access.status === "unauthenticated"
        ? "Sign in with an authorized product admin account to create listings."
        : access.status === "not-configured"
          ? "Product publishing is disabled until PRODUCT_ADMIN_PHONE_NUMBERS is configured on the server as a comma-separated list of authorized account phone numbers."
          : "Your account is not authorized to create product listings.";

    return (
      <main className="mx-auto max-w-2xl p-4 sm:p-8">
        <section className="rounded-xl border border-[#EFECE6] bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-[#262524]">
            Product listing access
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#5F5A56]">{message}</p>
          {access.status === "unauthenticated" && (
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-lg bg-[#935F4C] px-4 py-2 text-sm font-medium text-white hover:bg-[#7A4E3E]"
            >
              Sign in
            </Link>
          )}
        </section>
      </main>
    );
  }

  const categories = await getProductCategories();

  return (
    <div className="p-4 sm:p-6">
      <AddNewProduct categories={categories} />
    </div>
  );
}