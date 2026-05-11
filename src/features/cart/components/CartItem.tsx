/**
 * CartItem Component
 * Displays individual cart item with quantity controls
 */

import { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUpdateCartItem, useRemoveCartItem } from '@/features/cart/hooks';
import type { CartItem, CartItemVariant } from '@/features/cart/types';

interface CartItemProps {
  item: CartItem;
}

export function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      await updateCartItem.updateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeCartItem.removeItem(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-4 py-4">
      {/* Product Image */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border">
        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-sm leading-tight font-medium">{item.name}</h4>
            <p className="text-muted-foreground text-sm">${item.priceSnapshot.toFixed(2)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Variants */}
        {item.variants && item.variants.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.variants.map((variant: CartItemVariant) => (
              <Badge key={variant.id} variant="secondary" className="text-xs">
                {variant.name}: {variant.value}
              </Badge>
            ))}
          </div>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.stock}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-sm font-medium">
            ${(item.priceSnapshot * item.quantity).toFixed(2)}
          </div>
        </div>

        {/* Stock Warning */}
        {item.quantity >= item.stock && (
          <p className="text-destructive text-xs">Only {item.stock} left in stock</p>
        )}
      </div>
    </div>
  );
}
