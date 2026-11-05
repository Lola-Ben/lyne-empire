import { NextResponse } from "next/server";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { getProductAdminAccess } from "@/lib/server/product-admin";

export const runtime = "nodejs";

const signatureRequestSchema = z.object({
  paramsToSign: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()]),
  ),
});

const allowedParameters = new Set([
  "timestamp",
  "folder",
  "upload_preset",
  "source",
  "public_id",
  "overwrite",
  "use_filename",
  "unique_filename",
]);
const uploadFolder = "lyne-empire/products";
const publicIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,254}$/;

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
      console.warn("Rejected Cloudinary signature parameters.", {
        keys: Object.keys(paramsToSign),
      });
      return NextResponse.json({ error: "Invalid upload parameters." }, { status: 400 });
    }

    if (
      paramsToSign.source !== undefined &&
      paramsToSign.source !== "local" &&
      paramsToSign.source !== "uw"
    ) {
      return NextResponse.json({ error: "Invalid upload source." }, { status: 400 });
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

    const publicId = paramsToSign.public_id;
    if (
      publicId !== undefined &&
      (typeof publicId !== "string" || !publicIdPattern.test(publicId))
    ) {
      return NextResponse.json({ error: "Invalid image identifier." }, { status: 400 });
    }

    if (
      paramsToSign.overwrite !== undefined &&
      paramsToSign.overwrite !== false &&
      paramsToSign.overwrite !== "false"
    ) {
      return NextResponse.json({ error: "Replacing existing images is not allowed." }, { status: 400 });
    }

    for (const key of ["use_filename", "unique_filename"] as const) {
      const value = paramsToSign[key];
      if (
        value !== undefined &&
        typeof value !== "boolean" &&
        value !== "true" &&
        value !== "false"
      ) {
        return NextResponse.json({ error: "Invalid image naming options." }, { status: 400 });
      }
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
