import {
  HeroSection,
  CategoriesSection,
  FeaturedProductsSection,
  NewArrivalsSection,
  NewsletterSection,
  PromotionBanner,
  TestimonialsSection,
} from '@/features/home/components';
import { getFeaturedProducts, getNewArrivalsProducts } from '@/features/products/server/products';

export const metadata = {
  title: 'Cyber Brand - Premium Streetwear x Cyber Fashion',
  description:
    'Streetwear meets cyber. Bold drops, limited pieces, infinite vibe. Shop exclusive Gen Z fashion.',
  keywords: [
    'streetwear',
    'cyberfashion',
    'genz',
    'clothing',
    'fashion',
    'limited edition',
    'cyber',
  ],
  openGraph: {
    title: 'Cyber Brand - Premium Streetwear x Cyber Fashion',
    description: 'Streetwear meets cyber. Bold drops, limited pieces, infinite vibe.',
    url: 'https://cyberbrand.com',
    siteName: 'Cyber Brand',
    type: 'website',
  },
};

export default async function LocalePage() {
  const featured = await getFeaturedProducts();
  const newArrivals = await getNewArrivalsProducts();

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection products={featured} />
      <NewArrivalsSection products={newArrivals} />
      <PromotionBanner />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
