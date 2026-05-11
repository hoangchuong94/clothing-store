/**
 * CartSummary Component
 * Shows subtotal, tax, and total price
 */

'use client';

import React from 'react';

interface CartSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
}

export function CartSummary({ subtotal, tax, total }: CartSummaryProps) {
  return (
    <div className="space-y-2 border-t py-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Tax (8%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>

      <div className="flex justify-between border-t pt-2 text-lg font-bold">
        <span>Total</span>
        <span className="text-green-600">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
