'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Custom icons (SVG)
export { GithubIcon } from '../../../public/icons/GithubIcon';
export { GoogleIcon } from '../../../public/icons/GoogleIcon';

// Lucide React icons - re-export for convenience
export {
  // Social
  Share2 as TwitterIcon,
  Send as FacebookIcon,
  Play as YoutubeIcon,
  // UI
  User,
  Menu,
  Search,
  ShoppingCart,
  Heart,
  Eye,
  EyeOff,
  X as CloseIcon,
  Check,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  // Theme
  Sun,
  Moon,
  // Contact
  Mail,
  Phone,
  MapPin,
  // Other
  Sparkles,
  ShieldCheck,
  Flame,
  Zap,
  Quote,
  Globe,
  LogOut,
  Settings,
  Home,
  Package,
  MessageSquare,
  Star,
  Lock,
  AlertCircle,
  CheckCircle,
  Clock,
  Type,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';

/**
 * Icon size mapping helper
 * Converts size prop to width/height values
 */
export const iconSizeMap = {
  xs: { width: '12px', height: '12px' },
  sm: { width: '16px', height: '16px' },
  md: { width: '24px', height: '24px' },
  lg: { width: '32px', height: '32px' },
  xl: { width: '48px', height: '48px' },
} as const;

export type IconSize = keyof typeof iconSizeMap | number | string;

/**
 * Icon component wrapper properties
 */
export interface IconComponentProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Size of the icon
   * Can be a predefined size (xs, sm, md, lg, xl) or a number/string value
   */
  size?: IconSize;
  /**
   * CSS class name for additional styling
   */
  className?: string;
}

/**
 * Helper function to normalize icon size
 */
export function getNormalizedSize(size?: IconSize) {
  if (!size) return undefined;

  if (typeof size === 'string' && size in iconSizeMap) {
    return iconSizeMap[size as keyof typeof iconSizeMap];
  }

  if (typeof size === 'number') {
    return { width: `${size}px`, height: `${size}px` };
  }

  if (typeof size === 'string') {
    return { width: size, height: size };
  }

  return undefined;
}

/**
 * Wrapper component for easier icon usage with size mapping
 */
export const Icon = React.forwardRef<
  SVGSVGElement,
  IconComponentProps & { icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }
>(({ icon: IconComponent, size, className, style, ...props }, ref) => {
  const sizeStyles = getNormalizedSize(size);

  return (
    <IconComponent
      ref={ref}
      className={cn('inline-block shrink-0', className)}
      style={{
        ...sizeStyles,
        ...style,
      }}
      {...props}
    />
  );
});

Icon.displayName = 'Icon';
