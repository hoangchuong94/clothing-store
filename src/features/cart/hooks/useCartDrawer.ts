/**
 * useCartDrawer - Manage cart drawer open/close state
 * Simple state management for drawer visibility
 */

'use client';

import { useState, useCallback } from 'react';

export function useCartDrawer(initialOpen: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
