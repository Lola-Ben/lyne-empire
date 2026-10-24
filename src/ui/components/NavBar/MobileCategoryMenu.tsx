"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { navigationCategories } from "@/lib/navigationCategories";

export default function MobileCategoryMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? "Close category menu" : "Open category menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-category-menu"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[#935F4C] transition-colors hover:bg-[#EFECE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#935F4C] md:hidden"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close category menu"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <nav
            id="mobile-category-menu"
            aria-label="Mobile product categories"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col overflow-y-auto bg-white p-5 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between border-b border-[#EFECE6] pb-4">
              <span className="text-sm font-bold uppercase tracking-widest text-[#935F4C]">
                Categories
              </span>
              <button
                type="button"
                aria-label="Close category menu"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-2 text-gray-500 hover:bg-[#F7F4F0] hover:text-[#935F4C]"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {navigationCategories.map((category) => (
              <section key={category.id} className="py-2">
                <h2 className="px-2 pb-1 text-xs font-bold uppercase tracking-wide text-[#935F4C]">
                  {category.section}
                </h2>
                <ul>
                  {category.items.map((item) => {
                    const href = `/category/${item.slug}`;
                    const isActive =
                      pathname === href || pathname.startsWith(`${href}/`);
                    return (
                      <li key={item.slug}>
                        <Link
                          href={href}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setIsOpen(false)}
                          className={`block rounded px-2 py-2.5 text-sm ${
                            isActive
                              ? "bg-[#EFECE6] font-semibold text-[#935F4C]"
                              : "text-[#262524] hover:bg-[#F7F4F0]"
                          }`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
