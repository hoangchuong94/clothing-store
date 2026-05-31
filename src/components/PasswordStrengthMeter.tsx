'use client';

import {
  getPasswordStrengthDisplay,
  getPasswordRequirementChecklist,
} from '@/features/auth/lib/auth-utils';
import { useTranslations } from 'next-intl';

interface PasswordStrengthMeterProps {
  password: string;
  showChecklist?: boolean;
  showEntropy?: boolean;
  className?: string;
}

function strengthColorClass(color: string) {
  if (color.includes('green') || color.includes('emerald')) return 'bg-teal-500';
  if (color.includes('yellow') || color.includes('amber')) return 'bg-amber-500';
  return 'bg-rose-500';
}

export function PasswordStrengthMeter({
  password,
  showChecklist = true,
  showEntropy = false,
  className = '',
}: PasswordStrengthMeterProps) {
  const t = useTranslations();

  if (!password) return null;

  const display = getPasswordStrengthDisplay(password);
  const checklist = getPasswordRequirementChecklist(password);
  const barColor = strengthColorClass(display.color);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm font-medium">{t(display.labelKey)}</span>
            <div className={`h-2 w-2 rounded-full ${barColor}`} />
          </div>

          <span className="text-muted-foreground text-xs">{display.percentage}%</span>
        </div>

        <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
          <div
            className={`h-full transition-all duration-300 ${barColor}`}
            style={{ width: `${display.percentage}%` }}
          />
        </div>
      </div>

      {showEntropy && (
        <p className="text-muted-foreground text-xs">
          Entropy: ~{Math.round(display.entropy || 0)} bits
        </p>
      )}

      {showChecklist && (
        <div className="space-y-2">
          <p className="text-foreground text-xs font-semibold">{t('strength.requirements')}</p>
          <ul className="space-y-1.5">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-xs">
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    item.met
                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.met ? 'ok' : '-'}
                </span>

                <span
                  className={
                    item.met
                      ? 'font-medium text-teal-700 dark:text-teal-300'
                      : 'text-muted-foreground'
                  }
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {display.percentage < 100 && display.missingRequirements.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          <p className="mb-2 text-xs font-medium">{t('strength.suggestions')}</p>
          <ul className="space-y-1">
            {display.missingRequirements.map((req, idx) => (
              <li key={idx} className="text-xs">
                - {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {display.percentage === 100 && (
        <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-teal-800 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-100">
          <p className="text-xs font-medium">OK: {t('strength.strong')} password ready to use</p>
        </div>
      )}
    </div>
  );
}

export function PasswordStrengthMeterCompact({
  password,
  className = '',
}: Omit<PasswordStrengthMeterProps, 'showChecklist' | 'showEntropy'>) {
  const t = useTranslations();

  if (!password) return null;

  const display = getPasswordStrengthDisplay(password);
  const barColor = strengthColorClass(display.color);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-foreground text-xs font-medium">{t(display.labelKey)}</span>
        <span className="text-muted-foreground text-xs">{display.percentage}%</span>
      </div>
      <div className="bg-muted h-1.5 w-full rounded-full">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${display.percentage}%` }}
        />
      </div>
    </div>
  );
}

export function PasswordStrengthAnalysis({
  password,
  className = '',
}: Omit<PasswordStrengthMeterProps, 'showChecklist' | 'showEntropy'>) {
  const t = useTranslations();

  if (!password) {
    return (
      <div className={`text-muted-foreground py-12 text-center ${className}`}>
        {t('common.enterPassword')}
      </div>
    );
  }

  const display = getPasswordStrengthDisplay(password);
  const checklist = getPasswordRequirementChecklist(password);
  const barColor = strengthColorClass(display.color);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="border-border border-b pb-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">{t('strength.analysis')}</h3>
          <span className={`rounded-full px-3 py-1 text-sm font-medium text-white ${barColor}`}>
            {t(display.labelKey)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Strength Score</span>
            <span className="font-semibold">{display.percentage}%</span>
          </div>
          <div className="bg-muted h-3 w-full rounded-full">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${display.percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border-2 p-3 transition-colors ${
              item.met
                ? 'border-teal-200 bg-teal-50 dark:border-teal-400/20 dark:bg-teal-400/10'
                : 'border-border bg-muted/50'
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  item.met ? 'bg-teal-500 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {item.met ? 'ok' : 'x'}
              </span>
              <span
                className={`text-sm font-medium ${
                  item.met ? 'text-teal-700 dark:text-teal-300' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-indigo-800 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-100">
        <p className="mb-2 text-sm font-semibold">Entropy Information</p>
        <p className="text-sm">
          This password has approximately <strong>{display.entropy}</strong> bits of entropy, making
          it resistant to brute force attacks.
        </p>
      </div>

      {display.percentage < 100 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          <p className="mb-3 text-sm font-semibold">{t('strength.suggestions')}</p>
          <ul className="space-y-2">
            {display.missingRequirements.map((req, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span>-</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export type { PasswordStrengthMeterProps };
