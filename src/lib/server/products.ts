import "server-only";

import { getDatabase } from "@/lib/server/db";
import type { Product, StorefrontProduct } from "@/lib/products";

type ProductRow = {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  base_price: string | number;
  image_urls: string[] | null;
  available_colors: string[] | null;
  category_name: string;
  category_slug: string;
  parent_section: string;
  sizes: string[] | null;
  stock: number;
};

type CategoryRow = {
  slug: string;
  name: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapProduct(row: ProductRow): StorefrontProduct {
  const imageUrls = row.image_urls ?? [];
  const colors = row.available_colors ?? [];
  const productImages = imageUrls.map((url, index) => ({
    url,
    color: colors[index] ?? "Default",
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
    sizes: row.sizes ?? [],
    description: row.description ?? "",
    images: [images[0], ...images.slice(1)],
    sectionName: row.parent_section,
  };
}

function productSelect(database: ReturnType<typeof getDatabase>) {
  return database`
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
  `;
}

export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  try {
    const database = getDatabase();
    const rows = await database<ProductRow[]>`
      ${productSelect(database)}
      ORDER BY p.created_at DESC
    `;
    return rows.map(mapProduct);
  } catch (error) {
    console.error("Failed to load storefront products.", error);
    throw new Error("Unable to load storefront products.", { cause: error });
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!uuidPattern.test(id)) return null;

  try {
    const database = getDatabase();
    const [row] = await database<ProductRow[]>`
      ${productSelect(database)}
      WHERE p.id = ${id}
      LIMIT 1
    `;
    return row ? mapProduct(row) : null;
  } catch (error) {
    console.error(`Failed to load product "${id}".`, error);
    throw new Error("Unable to load product.", { cause: error });
  }
}

export async function getRelatedProducts(
  product: Product,
): Promise<Product[]> {
  try {
    const database = getDatabase();
    const rows = await database<ProductRow[]>`
      ${productSelect(database)}
      WHERE p.id <> ${product.id}
      ORDER BY
        CASE WHEN c.slug = ${product.category} THEN 0 ELSE 1 END,
        p.created_at DESC
      LIMIT 4
    `;
    return rows.map(mapProduct);
  } catch (error) {
    console.error(`Failed to load recommendations for "${product.id}".`, error);
    throw new Error("Unable to load related products.", { cause: error });
  }
}

export async function getCategoryProducts(slug: string): Promise<{
  categoryName: string;
  products: Product[];
} | null> {
  try {
    const database = getDatabase();
    const [category] = await database<CategoryRow[]>`
      SELECT name FROM categories WHERE slug = ${slug} LIMIT 1
    `;
    if (!category) return null;

    const rows = await database<ProductRow[]>`
      ${productSelect(database)}
      WHERE c.slug = ${slug}
      ORDER BY p.created_at DESC
    `;

    return {
      categoryName: category.name,
      products: rows.map(mapProduct),
    };
  } catch (error) {
    console.error(`Failed to load category "${slug}".`, error);
    throw new Error("Unable to load category products.", { cause: error });
  }
}

export async function getProductCategories(): Promise<
  Array<{ slug: string; name: string }>
> {
  try {
    const database = getDatabase();
    return await database<CategoryRow[]>`
      SELECT slug, name FROM categories ORDER BY parent_section, name
    `;
  } catch (error) {
    console.error("Failed to load product categories.", error);
    throw new Error("Unable to load product categories.", { cause: error });
  }
}
