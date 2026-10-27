import postgres from "postgres";
import { categories, products, users } from "../../lib/placeholder-data";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

// Force Nextjs to by pass static compiler optimizations for this endpoint
export const dynamic = 'force-dynamic';

// Initialize lightweight client cleanly
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require", max: 1 });

async function seedUsers() {

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      phone_number VARCHAR(20) NOT NULL UNIQUE,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashpassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, phone_number, email, password) 
        VALUES (${user.id}, ${user.name}, ${user.phone_number}, ${user.email}, ${hashpassword}) 
        ON CONFLICT (phone_number) DO NOTHING;
      `;
    })
  );

  return insertedUsers;
}

async function seedCategories() {

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      parent_section VARCHAR(100) NOT NULL
    );
  `;

  const categoryUuidMap: Record<string, string> = {};

  await Promise.all(
    categories.map(async (category) => {
      const [insertedCat] = await sql`
        INSERT INTO categories (name, slug, parent_section)
        VALUES (${category.name}, ${category.slug}, ${category.parent_section})
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `;

      categoryUuidMap[category.slug] = insertedCat.id;
    })
  );

  return categoryUuidMap;
}

async function seedProducts(categoryUuidMap: Record<string, string>) {

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      brand VARCHAR(100) DEFAULT 'Lyns Human Hair',
      description TEXT,
      base_price DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'FCFA',
      image_urls TEXT[] NOT NULL,
      available_colors VARCHAR(50)[] NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS product_variants (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      color VARCHAR(50) NOT NULL,
      hair_length VARCHAR(50),
      hair_texture VARCHAR(100),
      size VARCHAR(50),
      variant_images TEXT[],
      price_override DECIMAL(10, 2),
      stock_qty INT DEFAULT 0,
      sku VARCHAR(100) UNIQUE
    );
  `;

  await Promise.all(
    products.map(async (prod) => {
      const categoryId = categoryUuidMap[prod.categorySlug];

      if (!categoryId) return;

      const [insertedProd] = await sql`
        INSERT INTO products (
          category_id, name, brand, description, base_price, currency, image_urls, available_colors
        )
        VALUES (
          ${categoryId},
          ${prod.name},
          ${prod.brand ?? "Lyns Human Hair"},
          ${prod.description ?? null},
          ${prod.base_price},
          ${prod.currency ?? "FCFA"},
          ${prod.image_urls ?? []},
          ${prod.available_colors ?? []}
        )
        ON CONFLICT DO NOTHING
        RETURNING id;
      `;

      if (!insertedProd) return;

      const variantRows = "product_variants" in prod ? (prod.product_variants ?? []) : [];

      await Promise.all(
        variantRows.map(async (variant) => {
          const variantData = variant as Partial<{
            color: string;
            hair_length: string | null;
            hair_texture: string | null;
            size: string | null;
            variant_images: string[];
            price_override: number | null;
            stock_qty: number;
            sku: string | null;
          }>;

          if (!variantData.color) return;

          return sql`
            INSERT INTO product_variants (
              product_id, color, hair_length, hair_texture, size, variant_images, price_override, stock_qty, sku
            )
            VALUES (
              ${insertedProd.id},
              ${variantData.color},
              ${variantData.hair_length ?? null},
              ${variantData.hair_texture ?? null},
              ${variantData.size ?? null},
              ${variantData.variant_images ?? []},
              ${variantData.price_override ?? null},
              ${variantData.stock_qty ?? 0},
              ${variantData.sku ?? null}
            )
            ON CONFLICT (sku) DO NOTHING;
          `;
        })
      );
    })
  );
}

async function seedOrders() {

  // FIX: Removed illegal trailing commas and commas before parentheses
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      payer_phone VARCHAR(20) NOT NULL,
      payment_provider VARCHAR(50) NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'FCFA',
      status VARCHAR(30) DEFAULT 'PENDING',
      reference_id VARCHAR(100) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // FIX: Fixed spelling error (CASADE -> CASCADE) and removed commas before parenthesis
  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE SET NULL,
      variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
      quantity INT NOT NULL DEFAULT 1,
      price_at_purchase DECIMAL(10, 2) NOT NULL
    );
  `;
}

export async function GET() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    // Process base independent definitions sequentially to prevent dependency timing conflicts
    const categoryMap = await seedCategories();
    await seedUsers();
    
    // Seed relational dependencies after parents exist
    await seedProducts(categoryMap);
    await seedOrders();

    return NextResponse.json({
      success: true,
      message: '✅ Safe database tables initialized and fashion items seeded cleanly using lightweight postgres client!'
    });
  } catch (error: unknown) {
    console.error('❌ Table creation or seeding execution failed:', error);
    // FIX: Prepend explicit return statement so error payloads dispatch cleanly
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}
