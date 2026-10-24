import ProductCard from "@/ui/components/ProductCard/ProductCard";
import { products } from "@/lib/products";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryProducts = products.filter(
    (product) => product.category === slug,
  );
  const categoryName =
    categoryProducts[0]?.categoryLabel ?? slug.replaceAll("-", " ");

  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold capitalize text-[#262524]">
          {categoryName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse products in this category.
        </p>
      </div>
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-[#EFECE6] bg-white p-5 text-gray-600">
          No products are available in this category yet.
        </p>
      )}
    </main>
  );
}
