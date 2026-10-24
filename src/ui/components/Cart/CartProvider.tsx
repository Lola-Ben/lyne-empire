"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getProductById } from "@/lib/products";
import type { CartItem } from "@/lib/definition";

type CartContextValue = {
  items: CartItem[];
  addItem: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ) => boolean;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "lyns-shopping-cart";
const emptyCart: CartItem[] = [];
let cartSnapshot = emptyCart;
let hasReadCart = false;
const cartListeners = new Set<() => void>();

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "brand" in value &&
    typeof value.brand === "string" &&
    "category" in value &&
    typeof value.category === "string" &&
    "imageUrl" in value &&
    typeof value.imageUrl === "string" &&
    "price" in value &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    "quantity" in value &&
    typeof value.quantity === "number" &&
    Number.isFinite(value.quantity) &&
    "size" in value &&
    typeof value.size === "string" &&
    "color" in value &&
    typeof value.color === "string"
  );
}

function readCart() {
  if (typeof window === "undefined") return emptyCart;
  try {
    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return emptyCart;

    const parsedCart: unknown = JSON.parse(savedCart);
    if (Array.isArray(parsedCart) && parsedCart.every(isCartItem)) {
      return parsedCart;
    }
    console.error("Saved shopping cart has an invalid format.");
  } catch (error) {
    console.error("Unable to load the saved shopping cart.", error);
  }
  return emptyCart;
}

function getCartSnapshot() {
  if (!hasReadCart) {
    cartSnapshot = readCart();
    hasReadCart = true;
  }
  return cartSnapshot;
}

function notifyCartListeners() {
  cartListeners.forEach((listener) => listener());
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
  hasReadCart = false;
  getCartSnapshot();
  notifyCartListeners();
}

function subscribeToCart(listener: () => void) {
  cartListeners.add(listener);
  if (cartListeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageChange);
  }
  return () => {
    cartListeners.delete(listener);
    if (cartListeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
}

function saveCart(nextItems: CartItem[]) {
  cartSnapshot = nextItems;
  hasReadCart = true;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems));
    } catch (error) {
      console.error("Unable to save the shopping cart.", error);
    }
  }
  notifyCartListeners();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    () => emptyCart,
  );

  const addItem = useCallback((
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ) => {
    const product = getProductById(productId);
    if (!product) {
      console.error(`Cannot add unknown product "${productId}" to the cart.`);
      return false;
    }

    const image =
      product.images.find((productImage) => productImage.color === color) ??
      product.images[0];
    const selectedSize = size ?? product.sizes[0] ?? "One size";
    const selectedColor = image.color;
    const newItem: CartItem = {
      id: `${product.id}::${selectedSize}::${selectedColor}`,
      name: product.name,
      brand: product.brand,
      category: product.categoryLabel,
      imageUrl: image.url,
      price: product.price,
      quantity,
      size: selectedSize,
      color: selectedColor,
    };
    const currentItems = getCartSnapshot();
    const existingItem = currentItems.find((item) => item.id === newItem.id);
    saveCart(
      existingItem
        ? currentItems.map((item) =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...currentItems, newItem],
    );
    return true;
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    saveCart(
      getCartSnapshot().map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    saveCart(getCartSnapshot().filter((item) => item.id !== itemId));
  }, []);

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem }),
    [items, addItem, updateQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
