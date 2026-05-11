export interface ProductVariant {
  id: string;
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  category: string;
  gender?: 'men' | 'women' | 'unisex';
  badge?: string;
  rating?: number;
  reviews?: number;
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface ProductFilters {
  category?: string;
  badge?: string;
  gender?: 'men' | 'women' | 'unisex';
  minPrice?: number;
  maxPrice?: number;
  sort?: 'priceAsc' | 'priceDesc' | 'ratingDesc';
}

export interface AvailableProductFilters {
  categories: string[];
  badges: string[];
  genders: Array<'men' | 'women' | 'unisex'>;
  priceRange: {
    min: number;
    max: number;
  };
}
