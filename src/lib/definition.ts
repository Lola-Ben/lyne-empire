export interface CartItem {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number,
    imageUrl: string;
    quantity: number;
    size: string;
    color: string;
}

export interface CheckoutPayload {
    userId: string,
    phoneNumber: string,
    paymentProvider: "MTN_MOMO" | "ORANGE_MOMO",
    cartItem: [CartItem]
}

export interface orderItem {
    id: string;
    orderId: string;
    productId: string;
    variantId: string;
    quantity: number;
    priceAtPurchase: number;
}


export interface customerOrder {
    id: string;
    userId?: string;
    payerPhone: string;
    paymentProvider: "MOMO_MTN" | "ORANGE_MONEY";
    totalAmount: number;
    currency: string;
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
    referenceId?: string;
    items?: orderItem[];
    createAt: string;

}