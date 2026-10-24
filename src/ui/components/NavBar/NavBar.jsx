import Link from "next/link";
import Cart from "../Cart/Cart";
import AccountMenu from "./AccountMenu";
import MobileCategoryMenu from "./MobileCategoryMenu";

export default function NavBar() {
  return (
    <header className="relative z-40 flex h-16 w-full items-center justify-between gap-3 border-b border-[#EFECE6] bg-[#F7F4F0] px-3 text-[#262524] sm:px-6">
      <MobileCategoryMenu />
      <h1 className="text-lg font-bold uppercase tracking-tight text-[#935F4C]">
        <Link href="/">Lyns Human Hair</Link>
      </h1>

      <div className="flex items-center gap-4 text-sm font-medium sm:gap-6">
        <Cart />
        <AccountMenu />
      </div>
    </header>
  );
}
