import React from "react";
import SideNavBar from "@/ui/components/sideBar/SideNavBar";
import NavBar from "@/ui/components/NavBar/NavBar";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AddProductButton from "@/ui/components/Buttons/AddProductButton";
import { CartProvider } from "@/ui/components/Cart/CartProvider";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Lyne Empire | Premium Human Hair & Beauty Essentials",
  description:
    "Lyne Empire offers premium human hair extensions, wigs, bundles, beauty essentials, and fashionable accessories for confident, luxurious styling in Cameroon and beyond.",
  icons: {
    icon: {
      url: "/lyne-logo.jpg",
      type: "image/jpeg",
    },
    shortcut: "/lyne-logo.jpg",
    apple: "/lyne-logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${roboto.className} bg-[#FAFAFA] text-[#262524]`}>
        <CartProvider>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <SideNavBar />

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col min-w-0">
              <NavBar />
              <AddProductButton />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
