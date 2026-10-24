import ProductCard from "@/ui/components/ProductCard/ProductCard";
import { products } from "@/lib/products";

export default async function Home() {
  // let products = [];
  
  // try {
  //   const res = await fetch("https://dummyjson.com", {
  //     method: "GET",
  //   });
  //   const data = await res.json();
  //   products = data.products || [];
  // } catch(error) {
  //   console.error("Error Detail:", error);
  // }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#262524]">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Explore our latest luxury human hair releases.</p>
      </div>

      <section>
        {/* Clean Responsive Grid layout shifting columns seamlessly based on viewport size */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
