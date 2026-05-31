import { useTranslations } from 'next-intl';
import type { PasswordStrengthResult } from '../hooks';

interface PasswordStrengthProps {
  strength: PasswordStrengthResult;
  className?: string;
}

/**
 * Password strength indicator component
 * Displays visual feedback for password strength with animations
 */
export function PasswordStrength({ strength, className }: PasswordStrengthProps) {
  const t = useTranslations('auth');

  return (
    <div
      className={`border-border bg-card mt-3 rounded-3xl border p-3 text-sm transition-colors duration-200 ${className}`}
    >
      <div className="text-muted-foreground flex items-center justify-between gap-4">
        <span>{t('form.passwordStrength')}</span>
        <span
          className={`font-semibold ${
            strength.isValid ? 'text-teal-600 dark:text-teal-300' : 'text-foreground'
          }`}
        >
          {t(strength.level.labelKey)}
        </span>
      </div>
      <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
        <div
          className={`${strength.level.color} h-full rounded-full transition-[width] duration-300 ease-out`}
          style={{ width: strength.progress }}
        />
      </div>
    </div>
  );
}
