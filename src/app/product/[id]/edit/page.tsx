import { notFound } from "next/navigation";
import Link from "next/link";
import AddNewProduct from "@/ui/components/AddNewProduct/AddNewProduct";
import { getProductAdminAccess } from "@/lib/server/product-admin";
import {
  getProductCategories,
  getProductForEditing,
} from "@/lib/server/products";
import MarkOutOfStockButton from "@/ui/components/AddNewProduct/MarkOutOfStockButton";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const access = await getProductAdminAccess();

  if (access.status !== "authorized") {
    const message =
      access.status === "unauthenticated"
        ? "Sign in with an authorized product admin account to edit products."
        : access.status === "not-configured"
          ? "Product editing is disabled until PRODUCT_ADMIN_PHONE_NUMBERS is configured on the server."
          : "Your account is not authorized to edit products.";

    return (
      <main className="mx-auto max-w-2xl p-4 sm:p-8">
        <section className="rounded-xl border border-[#EFECE6] bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-[#262524]">
            Product editing access
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#5F5A56]">
            {message}
          </p>
          {access.status === "unauthenticated" && (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/product/${id}/edit`)}`}
              className="mt-4 inline-flex rounded-lg bg-[#935F4C] px-4 py-2 text-sm font-medium text-white hover:bg-[#7A4E3E]"
            >
              Sign in
            </Link>
          )}
        </section>
      </main>
    );
  }

  const [product, categories] = await Promise.all([
    getProductForEditing(id),
    getProductCategories(),
  ]);
  if (!product) notFound();

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto mb-4 flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Need to stop sales temporarily? Keep this listing and set all inventory to zero.
        </p>
        <MarkOutOfStockButton productId={product.id} />
      </div>
      <AddNewProduct categories={categories} initialProduct={product} />
    </main>
  );
}
