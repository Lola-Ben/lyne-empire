import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductAdminAccess } from "@/lib/server/product-admin";
import {
  markProductOutOfStock,
  saveProductListing,
  validateProductListing,
} from "@/lib/server/product-listing";

export const runtime = "nodejs";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const outOfStockSchema = z.object({
  action: z.literal("mark-out-of-stock"),
}).strict();

type ProductRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: ProductRouteContext) {
  try {
    const access = await getProductAdminAccess();
    if (access.status !== "authorized") {
      return NextResponse.json(
        { error: "Only an authorized product admin can edit products." },
        {
          status:
            access.status === "unauthenticated"
              ? 401
              : access.status === "not-configured"
                ? 503
                : 403,
        },
      );
    }

    const { id } = await params;
    if (!uuidPattern.test(id)) {
      return NextResponse.json({ error: "Invalid product identifier." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const outOfStockAction = outOfStockSchema.safeParse(body);
    if (outOfStockAction.success) {
      const result = await markProductOutOfStock(id);
      if (result === "not-found") {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }

      return NextResponse.json({ id, stock: 0 });
    }

    const listing = validateProductListing(body);
    if (!listing.success) {
      return NextResponse.json(
        { error: listing.error },
        { status: listing.status },
      );
    }

    const result = await saveProductListing(listing.data, id);
    if (result.status === "invalid-category") {
      return NextResponse.json(
        { error: "Select a valid product category." },
        { status: 400 },
      );
    }
    if (result.status === "not-found") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error("Failed to update product listing.", error);
    return NextResponse.json(
      { error: "Could not update this product. Please try again." },
      { status: 500 },
    );
  }
}
