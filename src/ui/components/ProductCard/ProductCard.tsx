"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import AddToCartButton from "../Buttons/AddToCartButton";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const image = product.images[selectedImageIndex] ?? product.images[0];
  const selectedSize = product.sizes[0] ?? "One size";

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#EFECE6] bg-white transition-shadow hover:shadow-sm sm:rounded-xl sm:hover:shadow-md">
      <Link
        href={`/product/${product.id}`}
        className="group flex flex-1 flex-col"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFECE6] sm:aspect-square">
          <Image
            src={image.url}
            alt={`${product.name} in ${image.color}`}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105 sm:p-4"
          />
        </div>
        <div className="flex flex-1 flex-col p-2.5 sm:p-4">
          <div className="min-w-0">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8C7468] sm:text-[11px] sm:tracking-[0.16em]">
              {product.brand}
            </p>
            <h2 className="mt-1 line-clamp-2 min-h-9 text-sm font-semibold leading-snug tracking-tight text-[#262524] sm:min-h-0 sm:text-base">
              {product.name}
            </h2>
            <p className="mt-2 text-sm font-bold leading-tight text-[#935F4C] sm:text-lg">
              {product.price.toLocaleString()}
              <span className="ml-1 text-[9px] font-semibold uppercase tracking-wide sm:text-xs">
                FCFA
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
              {product.sizes.length > 0 && (
                <span className="rounded bg-[#F7F4F0] px-1.5 py-1 text-[9px] font-medium text-[#5F5752] sm:px-2 sm:text-[11px]">
                  Sizes: {product.sizes.slice(0, 2).join(", ")}
                  {product.sizes.length > 2
                    ? ` +${product.sizes.length - 2}`
                    : ""}
                </span>
              )}
              <span
                className={`rounded px-1.5 py-1 text-[9px] font-medium sm:px-2 sm:text-[11px] ${
                  product.stock > 0
                    ? "bg-[#EEF5EF] text-[#386344]"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
              </span>
            </div>
          </div>
        </div>
      </Link>
      {product.images.length > 1 && (
        <fieldset className="px-2.5 pb-2 sm:px-4 sm:pb-3">
          <legend className="sr-only">Choose product color</legend>
          <div className="flex flex-wrap gap-1.5">
            {product.images.map((productImage, index) => (
              <button
                key={`${productImage.color}-${index}`}
                type="button"
                aria-label={`Show ${productImage.color} image`}
                aria-pressed={selectedImageIndex === index}
                onClick={() => setSelectedImageIndex(index)}
                className={`rounded-full border px-2 py-1 text-[9px] leading-tight transition-colors sm:text-[11px] ${
                  selectedImageIndex === index
                    ? "border-[#935F4C] bg-[#F7F4F0] font-semibold text-[#754B3D]"
                    : "border-[#EFECE6] text-[#5F5752] hover:border-[#B89989]"
                }`}
              >
                {productImage.color}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4">
        <AddToCartButton
          productId={product.id}
          quantity={1}
          size={selectedSize}
          color={image.color}
        />
      </div>
    </article>
  );
}
