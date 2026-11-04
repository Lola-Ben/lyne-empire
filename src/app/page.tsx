import ProductCard from "@/ui/components/ProductCard/ProductCard";
import { getStorefrontProducts } from "@/lib/server/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getStorefrontProducts();
  const sections = products.reduce<Record<string, typeof products>>(
    (groupedProducts, product) => {
      const sectionName = product.sectionName;
      groupedProducts[sectionName] ??= [];
      groupedProducts[sectionName].push(product);
      return groupedProducts;
    },
    {},
  );

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#262524]">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Explore our latest luxury human hair releases.</p>
      </div>

      <section>
        {/* Clean Responsive Grid layout shifting columns seamlessly based on viewport size */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Object.entries(sections).map(([sectionName, sectionProducts]) => (
            <div key={sectionName}>
              <h3 className="text-lg font-semibold text-[#262524]">{sectionName}</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-5">
                {sectionProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
