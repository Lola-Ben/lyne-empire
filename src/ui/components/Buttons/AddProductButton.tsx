
import Link from "next/link";
import { ArrowUpIcon } from "@heroicons/react/24/outline";

import { getProductAdminAccess } from "@/lib/server/product-admin";

export default async function AddProductButton() {
  const access = await getProductAdminAccess();
  if (access.status !== "authorized") return null;

  return (
    <Link
      href="/upload"
      className="ml-6 mt-2 flex w-fit items-center justify-center gap-2 rounded bg-[#935F4C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7A4E3E]"
    >
      <ArrowUpIcon className="h-4 w-4" />
      <span>Create Product Listing</span>
    </Link>
  );
}
        