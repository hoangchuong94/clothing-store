'use client';

import { useTranslations } from 'next-intl';
import { User } from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { userMenuOptions } from './config';

interface UserMenuProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export function UserMenu({ isLoggedIn = false, onLogout }: UserMenuProps) {
  const t = useTranslations('header');

  if (!isLoggedIn) {
    return (
      <button
        className="text-foreground focus-visible:ring-ring inline-flex items-center justify-center rounded-md p-2 focus-visible:ring-2 focus-visible:outline-none"
        aria-label={t('user.login')}
        title={t('user.login')}
      >
        <User className="h-5 w-5" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="text-foreground focus-visible:ring-ring inline-flex items-center justify-center rounded-md p-2 focus-visible:ring-2 focus-visible:outline-none"
          aria-label="User menu"
        >
          <div className="border-foreground bg-muted flex h-6 w-6 items-center justify-center rounded-full border">
            <span className="text-xs font-bold">A</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {userMenuOptions.map((option) => (
          <DropdownMenuItem key={option.id}>{t(option.labelKey)}</DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>{t('user.logout')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
