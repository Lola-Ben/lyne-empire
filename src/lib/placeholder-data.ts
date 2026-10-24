import { email } from "zod";



export const users = [
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    name: "Lyne Admin",
    phone_number: "+237679125986",
    email: "admin@lyne.com",
    password: "SecureAdminPassword123"
  },
  {
    id: "b2eedc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    name: "Amadou Bouba",
    phone_number: "+237690000000",
    email: null,
    password: "CustomerPassword2026"

  }
]


export const categories = [
    {name: "Bonestraight", slug: "bonestraight", parent_section: "Wigs & Bundles"},
    {name: "Brazillian Hair", slug: "brazillian-hair", parent_section: "Wigs & Bundles"},
    {name: "Dresses", slug: "dresses", parent_section: "Clothing & Apparel"},
    {name: "Bags & Purses", slug: "bags", parent_section: "Clothing & Apparel"},
    {name: "Shoes & Footwear", slug: "shoes", parent_section: "Clothing & Apparel"},
    {name: "Wigs Caps & Tools", slug: "wig-tools", parent_section: "Accessories"}
];


export const products = [
    {
    categorySlug: 'bonestraight',
    name: 'Super Double Drawn Bone Straight',
    brand: 'Lyns Human Hair',
    description: 'Silky smooth premium human hair. Can be ironed and bleached seamlessly.',
    base_price: 120000.00,
    currency: 'FCFA',
    image_urls: [
      'https://res.cloudinary.com/dgrusfnne/image/upload/jbywpyqieosvikpvzoxv.png',
      'https://res.cloudinary.com/dgrusfnne/image/upload/mfwy3eobabz1nrdcvd3l.png'
    ],
    available_colors: ['Natural Black', 'Brown Color'],
    product_variants: [
      {
        color: 'Natural Black',
        hair_length: '24 Inches',
        hair_texture: 'Bone Straight',
        stock_qty: 5,
        sku: 'LYNS-BS-24-BLK',
        price_override: 130000.00,
        variant_images: ['https://res.cloudinary.com/dgrusfnne/image/upload/jbywpyqieosvikpvzoxv.png']
      },
      {
        color: 'Brown Color',
        hair_length: '26 Inches',
        hair_texture: 'Bone Straight',
        stock_qty: 3,
        sku: 'LYNS-BS-26-PNO',
        price_override: 165000.00,
        variant_images: ['https://res.cloudinary.com/dgrusfnne/image/upload/mfwy3eobabz1nrdcvd3l.png']
      },
      {
        
      }
    ]
  },
  {
    categorySlug: 'dresses',
    name: 'Luxury Silk Evening Gown',
    brand: 'Lyns Luxury Apparel',
    description: 'Elegant floor-length silk dress designed for high-profile luxury occasions.',
    base_price: 45000.00,
    currency: 'FCFA',
    image_urls: [
      'https://res.cloudinary.com/dgrusfnne/image/upload/jbywpyqieosvikpvzoxv.png',
      'https://res.cloudinary.com/dgrusfnne/image/upload/mfwy3eobabz1nrdcvd3l.png'
    ],
    available_colors: ['Emerald Green', 'Ruby Red'],
    product_variants: [
      {
        color: 'Emerald Green',
        size: 'M',
        stock_qty: 8,
        sku: 'LYNS-DRS-EM-M',
        variant_images: ['https://res.cloudinary.com/dgrusfnne/image/upload/jbywpyqieosvikpvzoxv.pn']
      },
      {
        color: 'Ruby Red',
        size: 'L',
        stock_qty: 4,
        sku: 'LYNS-DRS-RD-L',
        variant_images: ['https://res.cloudinary.com/dgrusfnne/image/upload/mfwy3eobabz1nrdcvd3l.png']
      }
    ]
  },
  {
    categorySlug: "dresses",
    name: "Luxury Black Jacket",
    brand: "Lyns Luxury Apparel",
    description: "Elegant Black Jacket for Night Outings and Cold Weather",
    base_price: 16000.00,
    currency: "FCFA",
    image_url: ["https://res.cloudinary.com/dgrusfnne/image/upload/eojaxa1qgvqld580p4pw.png"],
    available_colors: ["black"]
  },

  {
    categorySlug: "bags",
    name: "Classic Silk Tote",
    brand: "Lyns Luxury Apparel",
    description: "Crafted from durable PU leather, this spacious shoulder bag offers premium texture product_variants including diamond-quilted, woven, and floral embossed finishes.",
    base_price: 5000.00,
    currency: "FCFA",
    image_urls: ["https://res.cloudinary.com/dgrusfnne/image/upload/wtgph8yv6mxxr9y5iej9.png"],
    available_colors: [],
  }

]

