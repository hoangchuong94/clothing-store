import { API_ROUTES } from './api-routes';

export const PUBLIC_API_ROUTES = [API_ROUTES.AUTH] as const;

export type PublicApiRoute = (typeof PUBLIC_API_ROUTES)[number];

export function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));
}
