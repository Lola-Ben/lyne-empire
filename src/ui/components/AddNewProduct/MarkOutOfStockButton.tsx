"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MarkOutOfStockButtonProps = {
  productId: string;
};

export default function MarkOutOfStockButton({
  productId,
}: MarkOutOfStockButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function markOutOfStock() {
    if (
      !window.confirm(
        "Set the stock for every color and size of this product to zero?",
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-out-of-stock" }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not update product stock. Please try again.";
        setError(message);
        return;
      }

      router.refresh();
    } catch (requestError) {
      console.error("Could not mark product out of stock.", requestError);
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={markOutOfStock}
        disabled={isSubmitting}
        className="rounded-lg border border-[#D9C9C0] px-4 py-2 text-sm font-medium text-[#754B3D] hover:bg-[#F7F4F0] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Updating stock..." : "Mark out of stock"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
