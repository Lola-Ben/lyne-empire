"use client";

import Image from "next/image";
import {
  CldUploadWidget,
  type CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { useState, type Dispatch, type SetStateAction } from "react";

export type ListingImage = {
  publicId: string;
  url: string;
  color: string;
  isPrimary: boolean;
};

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const colorSuggestions = [
  "Black",
  "Blue",
  "Blonde",
  "Burgundy",
  "Brown",
  "Copper",
  "Ginger",
  "Gray",
  "Green",
  "Jet Black",
  "Natural Black",
  "Ombre",
  "Pink",
  "Purple",
  "Red",
  "White",
];
const maxImages = 8;

type AddNewProductImageUploadProps = {
  images: ListingImage[];
  onImagesChange: Dispatch<SetStateAction<ListingImage[]>>;
};

export default function AddNewProductImageUpload({
  images,
  onImagesChange,
}: AddNewProductImageUploadProps) {
  const [uploadError, setUploadError] = useState("");

  function addImage(result: CloudinaryUploadWidgetResults) {
    const info = result.info;
    if (
      result.event !== "success" ||
      typeof info !== "object" ||
      info === null ||
      typeof info.public_id !== "string" ||
      typeof info.secure_url !== "string"
    ) {
      return;
    }

    if (images.length >= maxImages) {
      setUploadError(`You can add up to ${maxImages} product images.`);
      return;
    }
    onImagesChange((currentImages) => {
      if (
        currentImages.length >= maxImages ||
        currentImages.some((image) => image.publicId === info.public_id)
      ) {
        return currentImages;
      }

      return [
        ...currentImages,
        {
          publicId: info.public_id,
          url: info.secure_url,
          color: "",
          isPrimary: currentImages.length === 0,
        },
      ];
    });
    setUploadError("");
  }

  function updateImage(publicId: string, updates: Partial<ListingImage>) {
    onImagesChange((currentImages) =>
      currentImages.map((image) => ({
          ...image,
          ...updates,
          isPrimary:
            updates.isPrimary === true
              ? image.publicId === publicId
              : image.publicId === publicId
                ? (updates.isPrimary ?? image.isPrimary)
                : image.isPrimary,
        })),
    );
  }

  function removeImage(publicId: string) {
    onImagesChange((currentImages) => {
      const remainingImages = currentImages.filter(
        (image) => image.publicId !== publicId,
      );
      if (
        remainingImages.length > 0 &&
        !remainingImages.some((image) => image.isPrimary)
      ) {
        remainingImages[0] = { ...remainingImages[0], isPrimary: true };
      }
      return remainingImages;
    });
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-semibold text-[#935F4C]">
        Product photos <span className="text-red-700">*</span>
      </legend>
      <p className="text-sm leading-relaxed text-gray-600">
        Upload clear product cutouts on a transparent background when possible.
        PNG and WebP transparency are preserved. The first marked photo is the
        main listing image; each photo needs its matching color.
      </p>

      {cloudName && apiKey && uploadPreset ? (
        <CldUploadWidget
          signatureEndpoint="/api/cloudinary-signature"
          options={{
            cloudName,
            apiKey,
            uploadPreset,
            folder: "lyne-empire/products",
            multiple: true,
            maxFiles: maxImages,
            maxImageFileSize: 10_000_000,
            maxImageWidth: 6000,
            maxImageHeight: 6000,
            validateMaxWidthHeight: true,
            resourceType: "image",
            sources: ["local"],
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          }}
          onSuccess={addImage}
          onError={() => setUploadError("Image upload failed. Please try again.")}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={images.length >= maxImages}
              className="w-fit rounded-lg bg-[#935F4C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7A4E3E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {images.length >= maxImages ? "Photo limit reached" : "Upload photos"}
            </button>
          )}
        </CldUploadWidget>
      ) : (
        <p role="alert" className="text-sm text-red-700">
          Set the Cloudinary cloud name, API key, API secret, and signed upload
          preset to enable image uploads.
        </p>
      )}

      {uploadError && (
        <p role="alert" className="text-sm text-red-700">
          {uploadError}
        </p>
      )}

      <datalist id="product-color-suggestions">
        {colorSuggestions.map((color) => (
          <option key={color} value={color} />
        ))}
      </datalist>

      {images.length > 0 && (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.map((image) => (
            <li
              key={image.publicId}
              className="flex gap-3 rounded-lg border border-[#EFECE6] bg-white p-3"
            >
              <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-md border border-[#EFECE6] bg-[radial-gradient(ellipse_at_50%_38%,_#fff_0%,_#FAFAFA_55%,_#F7F4F0_100%)] sm:w-28">
                <Image
                  src={image.url}
                  alt={image.color ? `Product in ${image.color}` : "Product photo preview"}
                  fill
                  sizes="112px"
                  className="object-contain p-1"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#262524]">
                  <input
                    type="radio"
                    name="primaryProductImage"
                    checked={image.isPrimary}
                    onChange={() => updateImage(image.publicId, { isPrimary: true })}
                    className="accent-[#935F4C]"
                  />
                  Main photo
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[#262524]">
                    Color for this photo
                  </span>
                  <input
                    type="text"
                    list="product-color-suggestions"
                    value={image.color}
                    onChange={(event) =>
                      updateImage(image.publicId, { color: event.target.value })
                    }
                    aria-label="Product color for this image"
                    placeholder="e.g. Natural Black"
                    maxLength={50}
                    required
                    className="w-full rounded border border-[#EFECE6] bg-[#FAFAFA] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeImage(image.publicId)}
                  className="w-fit text-sm text-[#935F4C] underline underline-offset-2 hover:text-[#7A4E3E]"
                >
                  Remove photo
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-500">{images.length} of {maxImages} photos added</p>
    </fieldset>
  );
}
