
import Link from "next/link";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
 

export default function AddProductButton() {
    return (
        <button  className="flex items-center justify-center gap-2 w-50  bg-[#935F4C] hover:bg-[#7A4E3E] text-white font-medium text-sm py-2 rounded transition-colors mt-2 ml-6">
            <Link href="/upload" className="flex items-center justify-center gap-2 w-full">
                <ArrowUpIcon className="h-4 w-4" />
                <span>Add Product</span>
            </Link>
        </button>
    );
}
        