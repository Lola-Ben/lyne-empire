import Image from "next/image";
import { ShoppingBagIcon, XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from "@heroicons/react/24/outline";

import type { CartItem } from "@/lib/definition";
import { vendorWhatsAppContacts } from "@/lib/vendorContacts";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[],
    onUpdateQuantity: (itemId: string, newQuantity: number) => void;
    onRemoveItem: (itemId: string) => void;
}


export default function CartDrawer({isOpen, onClose, items, onUpdateQuantity, onRemoveItem}:CartDrawerProps) {

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderMessage = [
        "Hello Lyns Human Hair, I would like to place this order:",
        "",
        ...items.map((item) =>
            `- ${item.name} (${item.color}), quantity ${item.quantity}: ${(item.price * item.quantity).toLocaleString()} FCFA`,
        ),
        "",
        `Total: ${subtotal.toLocaleString()} FCFA`,
    ].join("\n");
    const whatsappUrl = (number: string) =>
        `https://wa.me/${number}?text=${encodeURIComponent(orderMessage)}`;
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            <button
                type="button"
                aria-label="Close shopping cart"
                className="absolute inset-0 bg-[#FAFAFA]/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="absolute inset-y-0 right-0 flex w-full max-w-full sm:pl-10">
                <div role="dialog" aria-modal="true" aria-label="Shopping cart" className="flex h-full w-full transform flex-col bg-white shadow-2xl transition-all sm:w-screen sm:max-w-md">
                    <div className="flex items-center justify-between border-b border-[#EFECE6] px-4 py-6 sm:px-6">
                        <h2 className="text-lg font-semibold tracking-wide text-gray-900 uppercase">Shopping Cart: {items.reduce((count, item) => count + item.quantity, 0)}</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-[#E53E34] transition-colors">
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" />

                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center" >
                                <ShoppingBagIcon className="h-12 w-12 text-gray-300 mb-4 strock-1" />
                                <p className="text-gray-500 font-medium mb-1">No items in the Cart</p>
                                <p className="text-gray-400 text-sm">Add items to your cart to see them here</p>
                                <button type="button" onClick={onClose} className="px-6 py-3 bg-[#935F4C] text-white rounded-md text-sm font-medium tracking-wide uppercase hover:bg-[#7A4E3E] transition-colors mt-4">Continue Shopping</button>
                            </div>
                        ) : (
                          <div className="flow-root">
                            <ul role="list" className="-my-6 divide-y divide-[#EFECE6]">
                                {items.map((item) => (
                                    <li key={item.id} className="flex flex-row items-start py-6 border-gray-100 last:border-0">
                                        <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-50 border border-[#EFECE6] relative">
                                            <Image 
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="absolute inset-0 w-full h-full object-contain p-1" />

                                        </div>
                                        <div className="ml-4 flex flex-1 flex-col">
                                            <div>
                                                <div className="flex justify-between text-base text-gray-900">
                                                    <div>
                                                        <p className="text-md font-medium letter-spacing-wide">{item.category}</p>
                                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide ">{item.brand}</p>
                                                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                                                    </div>
                                                    <p className="ml-4 text-sm font-bold">{item.price * item.quantity} (FCFA)</p>
                                                </div>
                                                <div className="mt-1 flex gap-3 text-xs text-gray-500">
                                                    <p>Size: <span className="text-gray-900 font-medium">{item.size}</span></p>
                                                    <p><span className="text-gray-900 font-medium">{item.color}</span></p>
                                                </div>
                                            </div>

                                            {/* Action Row */}
                                            <div className="flex flex-1 items-end justify-between text-sm">
                                                <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                                                    <button onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-2 py-1 text-gray-600 hover:text-gray-800">
                                                        <MinusIcon className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-2 py-1 text-gray-600">
                                                        {item.quantity}
                                                    </span>
                                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-gray-600 hover:text-gray-800">
                                                        <PlusIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <button onClick={() => onRemoveItem(item.id)}
                                                className="text-gray-400 hover:text-gray-600">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                          </div>
                            
                        )}
                    </div>
                    {items.length > 0 && (
                        <div className="border-t border-[#EFECE6] px-4 py-6 sm:px-6">
                            <div className="flex justufy-between text-base font-semibold text-gray-900 mb-2">
                                <p>Subtotal</p>
                                <p>{subtotal.toLocaleString()} FCFA</p>
                            </div>
                            <p className="mb-4 mt-0.5 text-xs text-gray-400">Contact the vendor to confirm delivery and payment.</p>
                            <div className="space-y-2">
                                <a
                                    href={whatsappUrl(vendorWhatsAppContacts[0].number)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center rounded-md border bg-[#935F4C] px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-[#7A4E3E]"
                                >
                                    Proceed to Checkout on WhatsApp
                                </a>
                                <p className="text-center text-xs text-gray-500">
                                    Primary vendor: {vendorWhatsAppContacts[0].number.replace("237", "+237 ")}
                                </p>
                                <a
                                    href={whatsappUrl(vendorWhatsAppContacts[1].number)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-1 text-center text-xs font-medium text-[#935F4C] underline underline-offset-2 hover:text-[#7A4E3E]"
                                >
                                    Contact alternate vendor ({vendorWhatsAppContacts[1].number.replace("237", "+237 ")})
                                </a>
                                <button onClick={onClose} className="w-full text-center text-xs font-semibold tracking-wider text-[#935F4C] hover:text-[#7A4E3E] transition-colors py-2">Continue Shopping</button>
                        </div>
                    </div>

                    )}
                </div>
            </div>
        </div>
    )

}
