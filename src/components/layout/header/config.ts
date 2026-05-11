export type NavItem = {
  id: string;
  labelKey: string;
  href: string;
};

export const navItems: NavItem[] = [
  { id: 'men', labelKey: 'nav.men', href: '/products?gender=men' },
  { id: 'women', labelKey: 'nav.women', href: '/products?gender=women' },
  { id: 'new', labelKey: 'nav.new', href: '/products?badge=NEW' },
  { id: 'unisex', labelKey: 'nav.unisex', href: '/products?gender=unisex' },
  { id: 'sale', labelKey: 'nav.sale', href: '/products?badge=SALE' },
];

export type UserMenuOption = {
  id: string;
  labelKey: string;
};

export const userMenuOptions: UserMenuOption[] = [
  { id: 'profile', labelKey: 'user.profile' },
  { id: 'orders', labelKey: 'user.orders' },
  { id: 'logout', labelKey: 'user.logout' },
];
