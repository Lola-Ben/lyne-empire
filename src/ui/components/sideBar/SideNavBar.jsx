"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutGrid,} from 'lucide-react';
import clsx from 'clsx';
import { navigationCategories } from "@/lib/navigationCategories";

export default function SideNavBar() {
  const pathname = usePathname();
  const isHomeActive = pathname === "/";

  return (
    <aside className="hidden min-h-screen w-64 flex-col gap-4 border-r border-[#EFECE6] bg-[#F7F4F0] p-6 md:flex">
      <div className="mb-4">
        <span className="text-xs font-bold tracking-widest text-[#935F4C] uppercase">Categories</span>
      </div>
      <div className="mb-6">
        <Link href="/" className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium", isHomeActive ? "bg-[#EFECE6] text-[#935F4C]" : "text-[#262524] hover:bg-[#EFECE6] hover:text-[#935F4C]")}>
          <span className="text-gray-400 group-hover:text-[#935F4C] transition-colors">
          <LayoutGrid className="h-5 w-5" />
          </span>
          <span>Home</span>
        </Link>
      </div>
      <div className="space-y-6 overflow-y-auto">
        {navigationCategories.map((category => (
          <div key={category.id} className="flex flex-col">
            <h4 className="text-xs font-bold tracking-widest text-[#935F4C] uppercase mb-2 pl-3">{category.section}</h4>
            <ul className="space-y-0.5">
              {category.items.map(item => {
                const targetPath = `/category/${item.slug}`;
                const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
                const isSubCategoryActive =
                  normalizedPathname === targetPath ||
                  normalizedPathname.startsWith(`${targetPath}/`);
                return (
                  <li key={item.slug}>
                    <Link
                      href={targetPath}
                      aria-current={isSubCategoryActive ? "page" : undefined}
                      className={clsx(
                        "flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                        isSubCategoryActive
                          ? "border border-[#D9C9C0] bg-[#EFECE6] text-[#935F4C]"
                          : "text-[#262524] hover:bg-[#EFECE6] hover:text-[#935F4C]",
                      )}
                    >
                      <span>{item.name}</span>
                      {isSubCategoryActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#935F4C]" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )))}
      </div>
    </aside>
  );
}
