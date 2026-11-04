export type ProductImage = {
  url: string;
  color: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  categoryLabel: string;
  price: number;
  stock: number;
  sizes: string[];
  description: string;
  images: [ProductImage, ...ProductImage[]];
};

export type StorefrontProduct = Product & {
  sectionName: string;
};
