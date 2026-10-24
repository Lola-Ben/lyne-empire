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

export const products: Product[] = [
  {
    id: "bone-straight-13x4",
    name: "Bone Straight 13x4",
    brand: "Lyns Hair",
    category: "bonestraight",
    categoryLabel: "Bonestraight",
    price: 60000,
    stock: 10,
    sizes: ["18 inches", "20 inches", "22 inches", "24 inches", "26 inches"],
    description:
      "Sleek, versatile bone straight human hair with a natural finish for everyday wear and special occasions.",
    images: [
      { url: "/globe.svg", color: "Natural Black" },
      { url: "/globe.svg", color: "Brown" },
    ],
  },
  {
    id: "bone-straight-closure",
    name: "Bone Straight Closure Wig",
    brand: "Sensationnel",
    category: "bonestraight",
    categoryLabel: "Bonestraight",
    price: 85000,
    stock: 6,
    sizes: ["16 inches", "18 inches", "20 inches", "22 inches", "24 inches"],
    description:
      "A soft, smooth closure wig designed for a natural-looking part and easy styling.",
    images: [
      { url: "/globe.svg", color: "Jet Black" },
      { url: "/globe.svg", color: "Burgundy" },
    ],
  },
  {
    id: "brazilian-body-wave",
    name: "Brazilian Body Wave",
    brand: "Outre",
    category: "brazillian-hair",
    categoryLabel: "Brazilian Hair",
    price: 70000,
    stock: 8,
    sizes: ["18 inches", "20 inches", "22 inches", "24 inches", "26 inches"],
    description:
      "Full, flowing Brazilian body wave hair with a soft texture and long-lasting natural movement.",
    images: [
      { url: "/globe.svg", color: "Natural Black" },
      { url: "/globe.svg", color: "Brown" },
    ],
  },
  {
    id: "brazilian-straight-bundle",
    name: "Brazilian Straight Bundle",
    brand: "X-Pression",
    category: "brazillian-hair",
    categoryLabel: "Brazilian Hair",
    price: 55000,
    stock: 12,
    sizes: ["14 inches", "16 inches", "18 inches", "20 inches"],
    description:
      "A silky straight Brazilian bundle that can be worn sleek or styled to suit your look.",
    images: [
      { url: "/globe.svg", color: "Black" },
      { url: "/globe.svg", color: "Honey Blonde" },
    ],
  },
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getRelatedProducts(product: Product) {
  const sameCategory = products.filter(
    (candidate) =>
      candidate.id !== product.id && candidate.category === product.category,
  );
  const otherProducts = products.filter(
    (candidate) =>
      candidate.id !== product.id && candidate.category !== product.category,
  );

  return [...sameCategory, ...otherProducts].slice(0, 4);
}
