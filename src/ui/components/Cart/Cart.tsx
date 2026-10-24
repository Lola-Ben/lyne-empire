"use client";

import { useState } from "react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import CartDrawer from "@/ui/components/Cart/CartDrawer";
import { useCart } from "./CartProvider";

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label={`Open cart, ${itemCount} items`}
        className="relative flex items-center gap-1.5 transition-colors hover:text-[#935F4C]"
      >
        <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
        <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#935F4C] text-xs text-white">
          {itemCount}
        </span>
        <span>Cart</span>
      </button>
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </>
  );
}
