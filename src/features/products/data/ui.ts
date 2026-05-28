import { Category, Testimonial } from '../types';

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

// Feature product ids — used by server to resolve repository-backed products.
export const FEATURED_PRODUCT_IDS = ['prod-006', 'prod-007', 'prod-008', 'prod-009'];
export const NEW_ARRIVALS_PRODUCT_IDS = ['prod-010', 'prod-011', 'prod-012', 'prod-013'];

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
