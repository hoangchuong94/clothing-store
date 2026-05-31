import { getTranslations } from 'next-intl/server';
import { FilterPanel } from '@/features/products/components/FilterPanel';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { ProductsHero } from '@/features/products/components/ProductsHero';
import { AddToCartButton } from '@/features/cart/components/AddToCartButton';
import { getProducts, extractAvailableFilters } from '@/features/products/server/products';
import { getAllProducts } from '@/features/products/server/data';
import { parseProductFilters } from '@/features/products/server/schemas';
interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const t = await getTranslations('products.hero');
  const resolvedSearchParams = await searchParams;
  const products = await getProducts(resolvedSearchParams);
  const availableFilters = extractAvailableFilters(await getAllProducts());
  const currentFilters = parseProductFilters(resolvedSearchParams);

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <ProductsHero badge={t('badge')} heading={t('heading')} description={t('description')} />
        <div className="grid gap-8 xl:grid-cols-[300px_1fr]">
          <FilterPanel availableFilters={availableFilters} currentFilters={currentFilters} />
          <section className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.25em] text-teal-600 uppercase dark:text-teal-300">
                  Results
                </p>
                <h2 className="text-foreground mt-2 text-3xl font-semibold">
                  {products.length} items found
                </h2>
              </div>
            </div>

            <ProductGrid
              products={products}
              renderAction={(product) => (
                <AddToCartButton
                  productId={product.id}
                  name={product.name}
                  priceSnapshot={product.price}
                  image={product.image}
                  stock={product.stock}
                />
              )}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
