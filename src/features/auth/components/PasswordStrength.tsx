import { useTranslations } from 'next-intl';
import type { PasswordStrengthResult } from '../hooks/usePasswordStrength';

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
      className={`mt-3 rounded-3xl border border-slate-200 bg-white/80 p-3 text-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/80 ${className}`}
    >
      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
        <span>{t('form.passwordStrength')}</span>
        <span
          className={`font-semibold ${
            strength.isValid
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {t(strength.level.labelKey)}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`${strength.level.color} h-full rounded-full transition-[width] duration-300 ease-out`}
          style={{ width: strength.progress }}
        />
      </div>
    </div>
  );
}
