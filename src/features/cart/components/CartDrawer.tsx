/**
 * Cart Drawer Component
 * Main cart UI using shadcn/ui Sheet
 * Displays cart items, totals, and checkout button
 */

'use client';

import React, { useMemo } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/features/cart/hooks';
import { CartItem as CartItemComponent } from './CartItem';
import { CartSummary } from './CartSummary';
import { EmptyCart } from './EmptyCart';
import { CartError } from './CartError';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, isEmpty, isLoading, error, itemCount, clearError } = useCart();

  // Memoize totals calculation to prevent unnecessary recalculation
  const totals = useMemo(() => {
    let subtotal = 0;
    let itemsCount = 0;

    for (const item of items) {
      subtotal += item.priceSnapshot * item.quantity;
      itemsCount += item.quantity;
    }

    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const total = Math.round((subtotal + tax) * 100) / 100;

    return { subtotal, tax, total, itemsCount };
  }, [items]);

  const handleCheckout = () => {
    onCheckout?.();
    // Could add checkout logic here
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col sm:w-135">
        {/* Header with close and item count */}
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <SheetTitle>Shopping Cart</SheetTitle>
              {!isEmpty && (
                <Badge variant="default" className="ml-auto">
                  {itemCount}
                </Badge>
              )}
            </div>
          </div>
          <SheetDescription>Review your items before checkout</SheetDescription>
        </SheetHeader>

        {/* Error State */}
        {error && <CartError error={error} onRetry={clearError} />}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-600">Updating cart...</span>
          </div>
        )}

        {/* Empty Cart State */}
        {isEmpty && !isLoading && <EmptyCart onClose={onClose} />}

        {/* Cart Items */}
        {!isEmpty && !isLoading && (
          <>
            <ScrollArea className="flex-1 overflow-y-auto pr-4">
              <div className="space-y-4 py-4 pl-2">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary and Checkout */}
            <SheetFooter className="mt-4 flex flex-col gap-4 border-t pt-4">
              <CartSummary subtotal={totals.subtotal} tax={totals.tax} total={totals.total} />

              <Button
                onClick={handleCheckout}
                disabled={isEmpty || isLoading}
                className="w-full"
                size="lg"
              >
                Proceed to Checkout
              </Button>

              <Button variant="outline" onClick={onClose} className="w-full" disabled={isLoading}>
                Continue Shopping
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
