import {
  HeroSection,
  CategoriesSection,
  FeaturedProductsSection,
  NewArrivalsSection,
  NewsletterSection,
  PromotionBanner,
  TestimonialsSection,
} from '@/features/home/components';

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

export default function LocalePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <NewArrivalsSection />
      <PromotionBanner />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
