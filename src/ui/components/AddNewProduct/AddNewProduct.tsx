"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AddNewProductImageUpload, {
  type ListingImage,
} from "./AddNewProductImageUpload";

type ProductCategory = {
  slug: string;
  name: string;
};

type AddNewProductProps = {
  categories: ProductCategory[];
  initialProduct?: {
    id: string;
    name: string;
    brand: string;
    description: string;
    basePrice: number;
    categorySlug: string;
    sizes: string[];
    images: ListingImage[];
    variants: Array<{ color: string; size: string | null; stock: number }>;
  };
};

const popularBrands = [
  "Bobbi Boss",
  "Freetress",
  "Janet Collection",
  "Mayde Beauty",
  "Outre",
  "Sensationnel",
  "X-Pression",
];

function parseSizes(value: string) {
  return [...new Set(value.split(",").map((size) => size.trim()).filter(Boolean))];
}

function variantKey(color: string, size: string) {
  return JSON.stringify([color, size]);
}

export default function AddNewProduct({
  categories,
  initialProduct,
}: AddNewProductProps) {
  const router = useRouter();
  const [images, setImages] = useState<ListingImage[]>(
    () => initialProduct?.images ?? [],
  );
  const [sizeInput, setSizeInput] = useState(
    () => initialProduct?.sizes.join(", ") ?? "",
  );
  const [stockByVariant, setStockByVariant] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        (initialProduct?.variants ?? []).map(({ color, size, stock }) => [
          variantKey(color, size ?? "One size"),
          String(stock),
        ]),
      ),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sizes = useMemo(() => parseSizes(sizeInput), [sizeInput]);
  const colors = useMemo(
    () => [...new Set(images.map((image) => image.color.trim()).filter(Boolean))],
    [images],
  );
  const variantSizes = sizes.length > 0 ? sizes : ["One size"];
  const hasCompleteImageColors =
    images.length > 0 && images.every((image) => image.color.trim().length > 0);

  function updateStock(color: string, size: string, stock: string) {
    const key = variantKey(color, size);
    setStockByVariant((current) => ({ ...current, [key]: stock }));
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (sizes.length > 20) {
      setError("Add no more than 20 size or length options.");
      return;
    }

    if (!hasCompleteImageColors) {
      setError("Upload at least one photo and add a color for every photo.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const variants = colors.flatMap((color) =>
      variantSizes.map((size) => ({
        color,
        size: size === "One size" && sizes.length === 0 ? null : size,
        stock: Number(stockByVariant[variantKey(color, size)] ?? 0),
      })),
    );
    const primaryFirstImages = [...images].sort(
      (left, right) => Number(right.isPrimary) - Number(left.isPrimary),
    );

    setIsSubmitting(true);
    try {
      const response = await fetch(
        initialProduct ? `/api/products/${initialProduct.id}` : "/api/products",
        {
          method: initialProduct ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.get("name"),
            brand: formData.get("brand"),
            description: formData.get("description"),
            basePrice: Number(formData.get("basePrice")),
            categorySlug: formData.get("categorySlug"),
            sizes,
            images: primaryFirstImages.map(({ url, color, isPrimary }) => ({
              url,
              color: color.trim(),
              primary: isPrimary,
            })),
            variants,
          }),
        },
      );

      const result: unknown = await response.json();
      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("id" in result) ||
        typeof result.id !== "string"
      ) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : `Could not ${initialProduct ? "update" : "publish"} the product. Check the details and try again.`;
        setError(message);
        return;
      }

      router.push(`/product/${result.id}`);
      router.refresh();
    } catch (submitError) {
      console.error("Product listing submission failed.", submitError);
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <header className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#935F4C]">
          Product management
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#262524] sm:text-3xl">
          {initialProduct ? "Edit product listing" : "Create a product listing"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
          {initialProduct
            ? "Update the listing details, photos, colors, sizes, and stock for this product."
            : "Add the details customers need to find and choose this item. Photos, colors, sizes, and stock will be saved with the product."}
        </p>
      </header>

      <form
        onSubmit={submitProduct}
        onReset={() => {
          setImages(initialProduct?.images ?? []);
          setSizeInput(initialProduct?.sizes.join(", ") ?? "");
          setStockByVariant(
            Object.fromEntries(
              (initialProduct?.variants ?? []).map(({ color, size, stock }) => [
                variantKey(color, size ?? "One size"),
                String(stock),
              ]),
            ),
          );
          setError("");
        }}
        className="space-y-6 rounded-xl border border-[#EFECE6] bg-white p-4 shadow-sm sm:p-6"
      >
        <section aria-labelledby="listing-details-heading" className="space-y-4">
          <div>
            <h2 id="listing-details-heading" className="font-semibold text-[#262524]">
              Listing details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              These details appear on product cards and product pages.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#262524]">
                Product name <span className="text-red-700">*</span>
              </span>
              <input
                name="name"
                defaultValue={initialProduct?.name}
                required
                minLength={2}
                maxLength={100}
                autoComplete="off"
                placeholder="e.g. Bone Straight Lace Front Wig"
                className="rounded-lg border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#262524]">
                Brand <span className="text-red-700">*</span>
              </span>
              <input
                name="brand"
                defaultValue={initialProduct?.brand}
                required
                maxLength={100}
                list="popular-product-brands"
                placeholder="Select a suggestion or enter a brand"
                className="rounded-lg border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20"
              />
              <datalist id="popular-product-brands">
                {popularBrands.map((brand) => (
                  <option value={brand} key={brand} />
                ))}
                <option value="Lyne Empire" />
              </datalist>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#262524]">
                Price (FCFA) <span className="text-red-700">*</span>
              </span>
              <input
                name="basePrice"
                defaultValue={initialProduct?.basePrice}
                type="number"
                required
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="e.g. 45000"
                className="rounded-lg border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#262524]">
                Category <span className="text-red-700">*</span>
              </span>
              <select
                name="categorySlug"
                required
                defaultValue={initialProduct?.categorySlug ?? ""}
                className="rounded-lg border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20"
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {categories.map((category) => (
                  <option value={category.slug} key={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-[#262524]">
                Description <span className="text-red-700">*</span>
              </span>
              <textarea
                name="description"
                defaultValue={initialProduct?.description}
                required
                minLength={10}
                maxLength={5000}
                rows={4}
                placeholder="Describe the material, fit, texture, or other useful product details."
                className="resize-y rounded-lg border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20"
              />
              <span className="text-xs text-gray-500">
                Keep it clear and factual; up to 5,000 characters.
              </span>
            </label>
          </div>
        </section>

        <section aria-labelledby="listing-options-heading" className="space-y-4 border-t border-[#EFECE6] pt-5">
          <div>
            <h2 id="listing-options-heading" className="font-semibold text-[#262524]">
              Options and inventory
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Add comma-separated sizes, then enter stock for each photo color
              and size combination. Leave sizes blank for a one-size item.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#262524]">Sizes or lengths</span>
            <input
              type="text"
              value={sizeInput}
              onChange={(event) => setSizeInput(event.target.value)}
              maxLength={1000}
              placeholder="e.g. Small, Medium, Large or 18 inches, 20 inches"
              className="rounded-lg border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20"
            />
            <span className="text-xs text-gray-500">
              Separate each size or length with a comma.
            </span>
          </label>

          {colors.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-[#EFECE6]">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-[#F7F4F0] text-[#262524]">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Color</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Size / length</th>
                    <th scope="col" className="w-36 px-3 py-2.5 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6]">
                  {colors.flatMap((color) =>
                    variantSizes.map((size) => (
                      <tr key={variantKey(color, size)}>
                        <th scope="row" className="px-3 py-2.5 font-medium text-[#262524]">
                          {color}
                        </th>
                        <td className="px-3 py-2.5 text-gray-600">{size}</td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min="0"
                            max="100000"
                            step="1"
                            inputMode="numeric"
                            aria-label={`Stock for ${color}, ${size}`}
                            value={stockByVariant[variantKey(color, size)] ?? "0"}
                            onChange={(event) =>
                              updateStock(color, size, event.target.value)
                            }
                            className="w-full rounded-md border border-[#EFECE6] bg-[#FAFAFA] px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#935F4C]"
                          />
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          )}
          {colors.length === 0 && (
            <p className="rounded-lg bg-[#F7F4F0] px-3 py-2.5 text-sm text-gray-600">
              Upload photos and assign each a color to enter inventory.
            </p>
          )}
        </section>

        <section className="border-t border-[#EFECE6] pt-5">
          <AddNewProductImageUpload images={images} onImagesChange={setImages} />
        </section>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-[#EFECE6] pt-5 sm:flex-row sm:justify-end">
          <button
            type="reset"
            disabled={isSubmitting}
            className="rounded-lg border border-[#EFECE6] px-5 py-2.5 text-sm font-medium text-[#262524] hover:bg-[#F7F4F0] disabled:opacity-50"
          >
            Clear form
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !hasCompleteImageColors || categories.length === 0}
            className="rounded-lg bg-[#935F4C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7A4E3E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? initialProduct
                ? "Saving changes..."
                : "Publishing..."
              : initialProduct
                ? "Save changes"
                : "Publish listing"}
          </button>
        </div>
      </form>
    </section>
  );
}
