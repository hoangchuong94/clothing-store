/**
 * EmptyCart Component
 * Displayed when cart has no items
 */

'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyCartProps {
  onClose: () => void;
}

export function EmptyCart({ onClose }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <ShoppingCart className="h-16 w-16 text-teal-500/60" />
        </div>

        <div>
          <h3 className="text-foreground text-lg font-semibold">Your cart is empty</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Looks like you haven not added any items yet.
          </p>
        </div>

        <Button
          onClick={onClose}
          variant="default"
          className="mt-4 bg-linear-to-r from-teal-500 to-indigo-500 text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/25"
        >
          Start Shopping
        </Button>
      </div>
    </div>
  );
}
