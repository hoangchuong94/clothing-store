import { Category, Product, Testimonial } from '../types';
import { PRODUCTS } from '../server/data';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Hoodies',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
    slug: 'hoodies',
  },
  {
    id: '2',
    name: 'T-Shirts',
    image:
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
    slug: 'tshirts',
  },
  {
    id: '3',
    name: 'Pants',
    image:
      'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=600&q=80',
    slug: 'pants',
  },
  {
    id: '4',
    name: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
    slug: 'accessories',
  },
];

const productById = (id: string) => PRODUCTS.find((product) => product.id === id);

export const featuredProducts: Product[] = [
  productById('prod-006'),
  productById('prod-007'),
  productById('prod-008'),
  productById('prod-009'),
].filter((product): product is Product => Boolean(product));

export const newArrivals: Product[] = [
  productById('prod-010'),
  productById('prod-011'),
  productById('prod-012'),
  productById('prod-013'),
].filter((product): product is Product => Boolean(product));

export const testimonials: Testimonial[] = [
  {
    id: '1',
    author: 'Alex Chen',
    role: 'Fashion Influencer',
    content:
      'The quality and design are insane. Every piece hits different. This is THE brand for Gen Z.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  },
  {
    id: '2',
    author: 'Jordan Smith',
    role: 'Streetwear Enthusiast',
    content:
      'Finally a brand that gets the streetwear culture. The attention to detail is unmatched.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    author: 'Taylor Williams',
    role: 'Student',
    content: 'Affordable pricing with premium quality. Been waiting for a brand like this forever!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  },
];
