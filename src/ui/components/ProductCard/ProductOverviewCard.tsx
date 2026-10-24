"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import AddToCartButton from "../Buttons/AddToCartButton";
import ProductImageGallery from "./ProductImageGallery";

type ProductOverviewCardProps = {
  product: Product;
};

export default function ProductOverviewCard({
  product,
}: ProductOverviewCardProps) {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes[0] ?? "One size",
  );

  return (
    <article className="grid gap-6 rounded-xl border border-[#EFECE6] bg-[#F7F4F0] p-4 sm:p-6 lg:grid-cols-2">
      <ProductImageGallery
        key={product.id}
        productName={product.name}
        images={product.images}
      />

      <div className="flex flex-col rounded-xl bg-white p-5 sm:p-6">
        <p className="text-sm font-medium uppercase tracking-wide text-[#935F4C]">
          {product.brand} · {product.categoryLabel}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#262524] sm:text-3xl">
          {product.name}
        </h1>
        <p className="mt-3 text-xl font-semibold text-[#935F4C]">
          {product.price.toLocaleString()} FCFA
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-[#EFECE6] py-4 text-sm">
          <div>
            <dt className="text-gray-500">Selected size</dt>
            <dd className="mt-1 font-medium text-[#262524]">{selectedSize}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Availability</dt>
            <dd className="mt-1 font-medium text-[#262524]">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </dd>
          </div>
        </dl>

        {product.sizes.length > 0 && (
          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-semibold text-[#935F4C]">
              Select size
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                    selectedSize === size
                      ? "border-[#935F4C] bg-[#935F4C] text-white"
                      : "border-[#D9C9C0] bg-white text-[#262524] hover:border-[#935F4C]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <section className="mt-5">
          <h2 className="font-semibold text-[#935F4C]">Product details</h2>
          <p className="mt-2 leading-relaxed text-gray-600">
            {product.description}
          </p>
        </section>

        <div className="mt-auto pt-6">
          <AddToCartButton
            productId={product.id}
            quantity={1}
            size={selectedSize}
          />
        </div>
      </div>
    </article>
  );
}
