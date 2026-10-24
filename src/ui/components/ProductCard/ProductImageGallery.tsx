"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/products";

type ProductImageGalleryProps = {
  productName: string;
  images: [ProductImage, ...ProductImage[]];
};

export default function ProductImageGallery({
  productName,
  images,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImage = images[selectedImageIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
        <Image
          src={selectedImage.url}
          alt={`${productName} in ${selectedImage.color}`}
          fill
          priority
          className="object-contain p-6"
        />
      </div>
      {images.length > 1 && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Available product colors"
        >
          {images.map((image, index) => (
            <button
              key={`${image.color}-${index}`}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              aria-pressed={selectedImageIndex === index}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selectedImageIndex === index
                  ? "border-[#935F4C] bg-[#935F4C] text-white"
                  : "border-[#D9C9C0] bg-white text-[#262524] hover:border-[#935F4C]"
              }`}
            >
              {image.color}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
