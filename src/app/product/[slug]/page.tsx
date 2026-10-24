import { notFound } from "next/navigation";
import ProductCard from "@/ui/components/ProductCard/ProductCard";
import ProductOverviewCard from "@/ui/components/ProductCard/ProductOverviewCard";
import { getProductById, getRelatedProducts } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductById(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 p-4 sm:p-8">
      <ProductOverviewCard product={product} />

      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-products-heading">
          <div className="mb-5">
            <h2
              id="related-products-heading"
              className="text-xl font-bold text-[#262524] sm:text-2xl"
            >
              You may also like
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              More styles selected for you.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
