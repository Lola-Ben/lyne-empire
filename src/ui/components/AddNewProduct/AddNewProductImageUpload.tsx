"use client";

import Image from "next/image";
import {
  CldUploadWidget,
  type CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { useState } from "react";

type ProductImage = {
  publicId: string;
  url: string;
  isPrimary: boolean;
};

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
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
  "Ombre",
  "Pink",
  "Purple",
  "Red",
];

export default function AddNewProductImageUpload() {
  const [productImages, setProductImages] = useState<{
    images: ProductImage[];
    colors: string[];
  }>({ images: [], colors: [] });
  const [uploadError, setUploadError] = useState("");
  const { images, colors } = productImages;

  console.log(productImages);

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

    setProductImages((current) => {
      if (current.images.some((image) => image.publicId === info.public_id)) {
        return current;
      }

      return {
        images: [
          ...current.images,
          {
            publicId: info.public_id,
            url: info.secure_url,
            isPrimary: current.images.length === 0,
          },
        ],
        colors: [...current.colors, "Brown"],
      };
    });
    setUploadError("");
  }

  function updateColor(imageIndex: number, color: string) {
    setProductImages((current) => ({
      ...current,
      colors: current.colors.map((currentColor, index) =>
        index === imageIndex ? color : currentColor,
      ),
    }));
  }

  function setPrimaryImage(publicId: string) {
    setProductImages((current) => ({
      ...current,
      images: current.images.map((image) => ({
        ...image,
        isPrimary: image.publicId === publicId,
      })),
    }));
  }

  function removeImage(publicId: string) {
    setProductImages((current) => {
      const removedIndex = current.images.findIndex(
        (image) => image.publicId === publicId,
      );
      const images = current.images.filter(
        (image) => image.publicId !== publicId,
      );

      if (images.length > 0 && !images.some((image) => image.isPrimary)) {
        images[0] = { ...images[0], isPrimary: true };
      }

      return {
        images,
        colors: current.colors.filter((_, index) => index !== removedIndex),
      };
    });
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-semibold text-[#934F4C]">Product Images</legend>
      <input
        type="hidden"
        name="productImages"
        value={JSON.stringify({ image: images, colors })}
      />

      {cloudName && uploadPreset ? (
        <CldUploadWidget
          options={{
            cloudName,
            uploadPreset,
            multiple: true,
            maxFiles: 10,
            resourceType: "image",
            sources: ["local"],
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          }}
          onSuccess={addImage}
          onError={() => setUploadError("Upload failed. Please try again.")}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="w-fit rounded-lg bg-[#935F4C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7A4E3E]"
            >
              Upload images
            </button>
          )}
        </CldUploadWidget>
      ) : (
        <p className="text-sm text-[#6B625E]">
          Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and
          NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable uploads.
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
          {images.map((image, imageIndex) => (
            <li
              key={image.publicId}
              className="flex gap-3 rounded-lg border border-[#EFECE6] bg-white p-3"
            >
              <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-md bg-[#F7F4F0]">
                <Image
                  src={image.url}
                  alt="Uploaded product"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="primaryProductImage"
                    checked={image.isPrimary}
                    onChange={() => setPrimaryImage(image.publicId)}
                    className="accent-[#935F4C]"
                  />
                  Primary image
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Product color</span>
                  <input
                    type="text"
                    list="product-color-suggestions"
                    value={colors[imageIndex] ?? "Brown"}
                    onChange={(event) =>
                      updateColor(imageIndex, event.target.value)
                    }
                    aria-label="Product color for this image"
                    placeholder="e.g. Black, Brown, Blonde"
                    className="w-full rounded border border-[#EFECE6] bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#935F4C]"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeImage(image.publicId)}
                  className="w-fit text-sm text-[#7A4E3E] underline underline-offset-2"
                >
                  Remove image
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}
