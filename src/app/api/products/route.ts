import { NextResponse } from "next/server";
import { getProductAdminAccess } from "@/lib/server/product-admin";
import {
  saveProductListing,
  validateProductListing,
} from "@/lib/server/product-listing";

export const runtime = "nodejs";

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
    const listing = validateProductListing(body);
    if (!listing.success) {
      return NextResponse.json(
        { error: listing.error },
        { status: listing.status },
      );
    }

    const result = await saveProductListing(listing.data);
    if (result.status === "invalid-category") {
      return NextResponse.json(
        { error: "Select a valid product category." },
        { status: 400 },
      );
    }
    if (result.status === "not-found") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product listing.", error);
    return NextResponse.json(
      { error: "Could not save this product. Please try again." },
      { status: 500 },
    );
  }
}
