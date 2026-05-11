'use client';

export function useUser() {
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  };
}
