import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductAdminAccess } from "@/lib/server/product-admin";
import { addVendorContact, getVendorContacts } from "@/lib/server/vendor-contacts";

const vendorContactSchema = z.object({
  label: z.string().trim().min(1).max(80),
  phoneNumber: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/),
});

export async function GET() {
  try {
    return NextResponse.json({ contacts: await getVendorContacts() });
  } catch (error) {
    console.error("Failed to load vendor contacts.", error);
    return NextResponse.json(
      { error: "Vendor contact list is unavailable. Initialize the vendor contacts table first." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const access = await getProductAdminAccess();
  if (access.status !== "authorized") {
    return NextResponse.json(
      { error: "Only an authorized product admin can manage vendor contacts." },
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = vendorContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid vendor contact." },
      { status: 400 },
    );
  }

  const phoneNumber = `+${parsed.data.phoneNumber.replace(/^\+/, "")}`;
  try {
    const contact = await addVendorContact(parsed.data.label, phoneNumber);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "A vendor contact with this phone number already exists." },
        { status: 409 },
      );
    }

    console.error("Failed to add vendor contact.", error);
    return NextResponse.json({ error: "Could not add this vendor contact." }, { status: 500 });
  }
}
