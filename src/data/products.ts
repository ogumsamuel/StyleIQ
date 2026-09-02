// ==================================================
// STYLEIQ PRODUCT DATA
// ==================================================

export type Product = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  category: string;
  gender: 'Men' | 'Women' | 'Unisex';
  style: string[];
  color: string;
  description: string;
  image: string;
};


// ==================================================
// PRODUCTS
// ==================================================

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Black Jacket',
    price: '$89.99',
    priceValue: 89.99,
    category: 'Jackets',
    gender: 'Unisex',
    style: [
      'Classic',
      'Casual',
      'Smart Casual',
    ],
    color: 'Black',
    description:
      'A timeless black jacket designed to give you a clean and versatile look. Perfect for casual outings, smart-casual occasions, and everyday styling.',
    image:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000',
  },

  {
    id: '2',
    name: 'Elegant Summer Dress',
    price: '$74.99',
    priceValue: 74.99,
    category: 'Dresses',
    gender: 'Women',
    style: [
      'Classic',
      'Minimalist',
    ],
    color: 'Red',
    description:
      'A lightweight and elegant summer dress with a clean design that works beautifully for warm days and special occasions.',
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000',
  },

  {
    id: '3',
    name: 'Premium Sneakers',
    price: '$109.99',
    priceValue: 109.99,
    category: 'Sneakers',
    gender: 'Unisex',
    style: [
      'Streetwear',
      'Casual',
      'Sporty',
    ],
    color: 'Red',
    description:
      'Comfortable premium sneakers designed for everyday wear. A great choice for casual and streetwear-inspired outfits.',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000',
  },

  {
    id: '4',
    name: 'Leather Handbag',
    price: '$64.99',
    priceValue: 64.99,
    category: 'Accessories',
    gender: 'Women',
    style: [
      'Classic',
      'Vintage',
    ],
    color: 'Brown',
    description:
      'A stylish leather handbag that adds a sophisticated touch to both everyday and classic outfits.',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000',
  },
];