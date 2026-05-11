/**
 * AddToCartButton Component
 * Example usage of cart system on product cards
 * Shows how to integrate cart with product pages
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ShoppingCart, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddToCart } from '@/features/cart/hooks';
import { AddToCartPayload, CartItemVariant } from '@/features/cart/types';
import { Badge } from '@/components/ui/badge';

interface AddToCartButtonProps {
  productId: string;
  name: string;
  priceSnapshot: number;
  image: string;
  stock: number;
  variants?: CartItemVariant[];
  variantId?: string;
  quantity?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function AddToCartButton({
  productId,
  name,
  priceSnapshot,
  image,
  stock,
  variants,
  variantId,
  quantity = 1,
  onSuccess,
  onError,
  className,
}: AddToCartButtonProps) {
  const { addItem, isLoading } = useAddToCart({
    onSuccess: () => {
      setShowSuccess(true);
      onSuccess?.();
      // Show success state for 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onError,
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = useCallback(async () => {
    if (stock <= 0) return;

    const payload: AddToCartPayload = {
      productId,
      name,
      priceSnapshot,
      quantity,
      image,
      stock,
      variants,
      variantId,
    };

    await addItem(payload);
  }, [productId, name, priceSnapshot, quantity, image, stock, variants, variantId, addItem]);

  const isDisabled = isLoading || stock <= 0;

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      size="sm"
      variant={showSuccess ? 'default' : 'outline'}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : showSuccess ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added
        </>
      ) : stock <= 0 ? (
        <>
          <Badge variant="destructive" className="mr-2">
            Out
          </Badge>
          Out of Stock
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
