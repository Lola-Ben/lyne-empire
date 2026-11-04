import { NextResponse } from "next/server";
import { getProductAdminAccess } from "@/lib/server/product-admin";
import { seedInitialVendorContacts } from "@/lib/server/vendor-contacts";

export async function POST() {
  const access = await getProductAdminAccess();
  if (access.status !== "authorized") {
    return NextResponse.json(
      { error: "Only an authorized product admin can seed vendor contacts." },
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
      message: "Vendor contact database table is ready and initial contacts are seeded.",
    });
  } catch (error) {
    console.error("Failed to seed the vendor contact database.", error);
    return NextResponse.json(
      { error: "Could not seed the vendor contact database." },
      { status: 500 },
    );
  }
}
