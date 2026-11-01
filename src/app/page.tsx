import ProductCard from "@/ui/components/ProductCard/ProductCard";
import type { Product } from "@/lib/products";
import postgres from "postgres";

type StorefrontProductRow = {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  base_price: string | number;
  image_urls: string[];
  available_colors: string[];
  category_name: string;
  category_slug: string;
  parent_section: string;
  sizes: string[];
  stock: number;
};

type StorefrontProduct = Product & { sectionName: string };

export const dynamic = "force-dynamic";

const databaseUrl = process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("POSTGRES_URL is not configured.");
}

const sql = postgres(databaseUrl, { ssl: "require" });

async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  try {
    const rows = await sql<StorefrontProductRow[]>`
      SELECT
        p.id,
        p.name,
        p.brand,
        p.description,
        p.base_price,
        p.image_urls,
        p.available_colors,
        c.name AS category_name,
        c.slug AS category_slug,
        c.parent_section,
        COALESCE(
          (
            SELECT array_agg(DISTINCT pv.size)
            FROM product_variants pv
            WHERE pv.product_id = p.id AND pv.size IS NOT NULL
          ),
          ARRAY[]::text[]
        ) AS sizes,
        COALESCE(
          (
            SELECT SUM(pv.stock_qty)
            FROM product_variants pv
            WHERE pv.product_id = p.id
          ),
          0
        )::int AS stock
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC;
    `;

    return rows.map((row) => {
      const productImages = row.image_urls.map((url, index) => ({
        url,
        color: row.available_colors[index] ?? "Default",
      }));
      const images =
        productImages.length > 0
          ? productImages
          : [{ url: "/globe.svg", color: "Default" }];

      return {
        id: row.id,
        name: row.name,
        brand: row.brand ?? "Lyne Empire",
        category: row.category_slug,
        categoryLabel: row.category_name,
        price: Number(row.base_price),
        stock: row.stock,
        sizes: row.sizes,
        description: row.description ?? "",
        images: [images[0], ...images.slice(1)],
        sectionName: row.parent_section,
      };
    });
  } catch (error) {
    console.error("Failed to load storefront products from the database.", error);
    throw new Error("Unable to load storefront products.", { cause: error });
  }
}

export default async function Home() {
  const products = await getStorefrontProducts();
  const sections = products.reduce<Record<string, StorefrontProduct[]>>(
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
