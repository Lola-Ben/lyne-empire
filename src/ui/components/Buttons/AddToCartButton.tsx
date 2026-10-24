"use client";

import { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/ui/components/Cart/CartProvider";

type AddToCartButtonProps = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
};

export default function AddToCartButton({
  productId,
  quantity,
  size,
  color,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    if (addItem(productId, quantity, size, color)) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="mt-auto flex w-full items-center justify-center gap-1.5 rounded bg-[#935F4C] py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#7A4E3E] sm:gap-2 sm:py-2 sm:text-sm"
    >
      <ShoppingCartIcon className="h-4 w-4" />
      <span>{added ? "Added to Cart" : "Add to Cart"}</span>
    </button>
  );
}
