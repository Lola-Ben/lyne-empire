import { NextResponse } from "next/server";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { getProductAdminAccess } from "@/lib/server/product-admin";

export const runtime = "nodejs";

const signatureRequestSchema = z.object({
  paramsToSign: z.record(z.string(), z.union([z.string(), z.number()])),
});

const allowedParameters = new Set(["timestamp", "folder", "upload_preset"]);
const uploadFolder = "lyne-empire/products";

export async function POST(request: Request) {
  const access = await getProductAdminAccess();
  if (access.status !== "authorized") {
    return NextResponse.json(
      { error: "Only an authorized product admin can upload images." },
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

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
    return NextResponse.json(
      { error: "Signed Cloudinary uploads are not configured on the server." },
      { status: 503 },
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const parsed = signatureRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid upload signature request." }, { status: 400 });
    }

    const { paramsToSign } = parsed.data;
    if (
      Object.keys(paramsToSign).some((key) => !allowedParameters.has(key)) ||
      paramsToSign.folder !== uploadFolder ||
      paramsToSign.upload_preset !== uploadPreset
    ) {
      return NextResponse.json({ error: "Invalid upload parameters." }, { status: 400 });
    }

    const timestamp = Number(paramsToSign.timestamp);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (
      !Number.isInteger(timestamp) ||
      timestamp < currentTimestamp - 300 ||
      timestamp > currentTimestamp + 60
    ) {
      return NextResponse.json({ error: "Upload signature timestamp is invalid." }, { status: 400 });
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret,
    );
    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Could not sign Cloudinary upload parameters.", error);
    return NextResponse.json(
      { error: "Could not authorize the image upload." },
      { status: 500 },
    );
  }
}
