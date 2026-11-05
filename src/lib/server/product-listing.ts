import "server-only";

import { z } from "zod";
import { getDatabase } from "@/lib/server/db";

const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  brand: z.string().trim().min(1).max(100),
  description: z.string().trim().min(10).max(5000),
  basePrice: z.number().finite().positive(),
  categorySlug: z.string().trim().min(1).max(100),
  sizes: z.array(z.string().trim().min(1).max(50)).max(20),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        color: z.string().trim().min(1).max(50),
        primary: z.boolean(),
      }),
    )
    .min(1)
    .max(8),
  variants: z
    .array(
      z.object({
        color: z.string().trim().min(1).max(50),
        size: z.string().trim().min(1).max(50).nullable(),
        stock: z.number().int().min(0).max(100000),
      }),
    )
    .min(1)
    .max(160),
});

export type ProductListingInput = z.infer<typeof productSchema>;

type ValidatedProductListing = {
  success: true;
  data: ProductListingInput;
};

type InvalidProductListing = {
  success: false;
  error: string;
  status: 400 | 503;
};

function variantKey(color: string, size: string | null) {
  return JSON.stringify([color, size]);
}

export function validateProductListing(
  input: unknown,
): ValidatedProductListing | InvalidProductListing {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid product details.",
      status: 400,
    };
  }

  const data = parsed.data;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    return {
      success: false,
      error: "Cloudinary uploads are not configured on the server.",
      status: 503,
    };
  }

  const normalizedSizes = [...new Set(data.sizes)];
  const colors = [...new Set(data.images.map((image) => image.color))];
  const expectedPairs = new Set(
    colors.flatMap((color) =>
      normalizedSizes.length > 0
        ? normalizedSizes.map((size) => variantKey(color, size))
        : [variantKey(color, null)],
    ),
  );
  const submittedPairs = new Set(
    data.variants.map((variant) => variantKey(variant.color, variant.size)),
  );

  if (
    normalizedSizes.length !== data.sizes.length ||
    data.variants.length !== expectedPairs.size ||
    submittedPairs.size !== data.variants.length ||
    [...expectedPairs].some((key) => !submittedPairs.has(key))
  ) {
    return {
      success: false,
      error: "Stock must be provided once for every color and size combination.",
      status: 400,
    };
  }

  for (const image of data.images) {
    const imageUrl = new URL(image.url);
    if (
      imageUrl.protocol !== "https:" ||
      imageUrl.hostname !== "res.cloudinary.com" ||
      !imageUrl.pathname.startsWith(`/${cloudName}/image/upload/`)
    ) {
      return {
        success: false,
        error: "Product images must be uploaded to this store's Cloudinary account.",
        status: 400,
      };
    }
  }

  if (data.images.filter((image) => image.primary).length !== 1) {
    return {
      success: false,
      error: "Choose exactly one main product photo.",
      status: 400,
    };
  }

  return { success: true, data };
}

export async function saveProductListing(
  data: ProductListingInput,
  productId?: string,
): Promise<
  | { status: "saved"; id: string }
  | { status: "invalid-category" }
  | { status: "not-found" }
> {
  const primaryFirstImages = [...data.images].sort(
    (left, right) => Number(right.primary) - Number(left.primary),
  );
  const database = getDatabase();
  const [category] = await database<{ id: string }[]>`
    SELECT id FROM categories WHERE slug = ${data.categorySlug} LIMIT 1
  `;
  if (!category) {
    return { status: "invalid-category" };
  }

  const [savedProductId] = await database.begin(async (transaction) => {
    let id: string;

    if (productId) {
      const [updatedProduct] = await transaction<{ id: string }[]>`
        UPDATE products
        SET
          category_id = ${category.id},
          name = ${data.name},
          brand = ${data.brand},
          description = ${data.description},
          base_price = ${data.basePrice},
          currency = 'FCFA',
          image_urls = ${primaryFirstImages.map((image) => image.url)},
          available_colors = ${primaryFirstImages.map((image) => image.color)}
        WHERE id = ${productId}
        RETURNING id
      `;
      if (!updatedProduct) return [];

      id = updatedProduct.id;
      await transaction`
        DELETE FROM product_variants WHERE product_id = ${id}
      `;
    } else {
      const [createdProduct] = await transaction<{ id: string }[]>`
        INSERT INTO products (
          category_id,
          name,
          brand,
          description,
          base_price,
          currency,
          image_urls,
          available_colors
        )
        VALUES (
          ${category.id},
          ${data.name},
          ${data.brand},
          ${data.description},
          ${data.basePrice},
          'FCFA',
          ${primaryFirstImages.map((image) => image.url)},
          ${primaryFirstImages.map((image) => image.color)}
        )
        RETURNING id
      `;
      id = createdProduct.id;
    }

    for (const variant of data.variants) {
      await transaction`
        INSERT INTO product_variants (product_id, color, size, stock_qty)
        VALUES (${id}, ${variant.color}, ${variant.size}, ${variant.stock})
      `;
    }

    return [{ id }];
  });

  return savedProductId
    ? { status: "saved", id: savedProductId.id }
    : { status: "not-found" };
}

export async function markProductOutOfStock(
  productId: string,
): Promise<"updated" | "not-found"> {
  const database = getDatabase();
  const [product] = await database<{ id: string }[]>`
    SELECT id FROM products WHERE id = ${productId} LIMIT 1
  `;
  if (!product) return "not-found";

  await database`
    UPDATE product_variants
    SET stock_qty = 0
    WHERE product_id = ${productId}
  `;
  return "updated";
}
