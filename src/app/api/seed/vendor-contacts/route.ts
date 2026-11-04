import { NextResponse } from "next/server";
import { getProductAdminAccess } from "@/lib/server/product-admin";
import { seedInitialVendorContacts } from "@/lib/server/vendor-contacts";

export async function GET() {
  const access = await getProductAdminAccess();
  if (access.status !== "authorized") {
    return NextResponse.json(
      { error: "Only an authorized product admin can initialize vendor contacts." },
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

  try {
    await seedInitialVendorContacts();
    return NextResponse.json({
      success: true,
      message: "Vendor contacts table is ready and the initial vendor contacts have been seeded.",
    });
  } catch (error) {
    console.error("Failed to initialize vendor contacts.", error);
    return NextResponse.json(
      { error: "Could not initialize vendor contacts." },
      { status: 500 },
    );
  }
}
