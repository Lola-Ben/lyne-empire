import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/server/db";
import { getProductAdminAccess } from "@/lib/server/product-admin";

export const runtime = "nodejs";

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

function variantKey(color: string, size: string | null) {
  return JSON.stringify([color, size]);
}

export async function POST(request: Request) {
  try {
    const access = await getProductAdminAccess();
    if (access.status === "unauthenticated") {
      return NextResponse.json(
        { error: "Sign in with an authorized product admin account." },
        { status: 401 },
      );
    }
    if (access.status === "not-configured") {
      return NextResponse.json(
        { error: "Product admin access is not configured on the server." },
        { status: 503 },
      );
    }
    if (access.status !== "authorized") {
      return NextResponse.json(
        { error: "You are not authorized to publish products." },
        { status: 403 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid product details." },
        { status: 400 },
      );
    }

    const {
      name,
      brand,
      description,
      basePrice,
      categorySlug,
      sizes,
      images,
      variants,
    } = parsed.data;
    const normalizedSizes = [...new Set(sizes)];
    const colors = [...new Set(images.map((image) => image.color))];
    const expectedPairs = new Set(
      colors.flatMap((color) =>
        normalizedSizes.length > 0
          ? normalizedSizes.map((size) => variantKey(color, size))
          : [variantKey(color, null)],
      ),
    );
    const submittedPairs = new Set(
      variants.map((variant) => variantKey(variant.color, variant.size)),
    );

    if (
      normalizedSizes.length !== sizes.length ||
      variants.length !== expectedPairs.size ||
      submittedPairs.size !== variants.length ||
      [...expectedPairs].some((key) => !submittedPairs.has(key))
    ) {
      return NextResponse.json(
        { error: "Stock must be provided once for every color and size combination." },
        { status: 400 },
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return NextResponse.json(
        { error: "Cloudinary uploads are not configured on the server." },
        { status: 503 },
      );
    }

    for (const image of images) {
      const imageUrl = new URL(image.url);
      if (
        imageUrl.protocol !== "https:" ||
        imageUrl.hostname !== "res.cloudinary.com" ||
        !imageUrl.pathname.startsWith(`/${cloudName}/image/upload/`)
      ) {
        return NextResponse.json(
          { error: "Product images must be uploaded to this store's Cloudinary account." },
          { status: 400 },
        );
      }
    }

    if (images.filter((image) => image.primary).length !== 1) {
      return NextResponse.json(
        { error: "Choose exactly one main product photo." },
        { status: 400 },
      );
    }

    const primaryFirstImages = [...images].sort(
      (left, right) => Number(right.primary) - Number(left.primary),
    );
    const database = getDatabase();
    const [category] = await database<{ id: string }[]>`
      SELECT id FROM categories WHERE slug = ${categorySlug} LIMIT 1
    `;
    if (!category) {
      return NextResponse.json(
        { error: "Select a valid product category." },
        { status: 400 },
      );
    }

    const [product] = await database.begin(async (transaction) => {
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
          ${name},
          ${brand},
          ${description},
          ${basePrice},
          'FCFA',
          ${primaryFirstImages.map((image) => image.url)},
          ${primaryFirstImages.map((image) => image.color)}
        )
        RETURNING id
      `;

      for (const variant of variants) {
        await transaction`
          INSERT INTO product_variants (product_id, color, size, stock_qty)
          VALUES (
            ${createdProduct.id},
            ${variant.color},
            ${variant.size},
            ${variant.stock}
          )
        `;
      }

      return [createdProduct];
    });

    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product listing.", error);
    return NextResponse.json(
      { error: "Could not save this product. Please try again." },
      { status: 500 },
    );
  }
}
