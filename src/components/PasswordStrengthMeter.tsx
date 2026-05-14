/**
 * PASSWORD STRENGTH METER COMPONENT
 *
 * Ready-to-use UI component for displaying real-time password strength
 * TypeScript + React + Tailwind CSS
 *
 * Usage:
 * <PasswordStrengthMeter password={form.watch('password')} />
 */

'use client';

import {
  getPasswordStrengthDisplay,
  getPasswordRequirementChecklist,
} from '@/features/auth/lib/auth-utils';
import { useTranslations } from 'next-intl';

interface PasswordStrengthMeterProps {
  /** The password to analyze */
  password: string;

  /** Show or hide the requirements checklist */
  showChecklist?: boolean;

  /** Show entropy bits (for advanced UX) */
  showEntropy?: boolean;

  /** Custom className for container */
  className?: string;
}

/**
 * PasswordStrengthMeter Component
 *
 * Displays:
 * - Color-coded strength bar (red/yellow/green)
 * - Strength label (Weak/Medium/Strong)
 * - Percentage score (0-100%)
 * - Requirements checklist (✓/○)
 * - Suggestions for missing requirements
 * - Optional entropy bits
 *
 * All strings are i18n translated using next-intl
 */
export function PasswordStrengthMeter({
  password,
  showChecklist = true,
  showEntropy = false,
  className = '',
}: PasswordStrengthMeterProps) {
  const t = useTranslations();

  // Don't show anything if password is empty
  if (!password) return null;

  const display = getPasswordStrengthDisplay(password);
  const checklist = getPasswordRequirementChecklist(password);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{t(display.labelKey)}</span>

            {/* Strength indicator dot */}
            <div className={`h-2 w-2 rounded-full ${display.color}`} />
          </div>

          <span className="text-xs text-gray-500">{display.percentage}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-300 ${display.color}`}
            style={{ width: `${display.percentage}%` }}
          />
        </div>
      </div>

      {/* Entropy (optional) */}
      {showEntropy && (
        <p className="text-xs text-gray-500">Entropy: ~{Math.round(display.entropy || 0)} bits</p>
      )}

      {/* Requirements Checklist */}
      {showChecklist && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">{t('strength.requirements')}</p>
          <ul className="space-y-1.5">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-xs">
                {/* Checkmark or placeholder */}
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    item.met ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  } `}
                >
                  {item.met ? '✓' : '○'}
                </span>

                {/* Label */}
                <span className={item.met ? 'font-medium text-green-700' : 'text-gray-600'}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {display.percentage < 100 && display.missingRequirements.length > 0 && (
        <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
          <p className="mb-2 text-xs font-medium text-yellow-700">{t('strength.suggestions')}</p>
          <ul className="space-y-1">
            {display.missingRequirements.map((req, idx) => (
              <li key={idx} className="text-xs text-yellow-700">
                • {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success state */}
      {display.percentage === 100 && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3">
          <p className="text-xs font-medium text-green-700">
            ✓ {t('strength.strong')} password ready to use
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * ALTERNATIVE MINIMAL VERSION
 * For compact UI where space is limited
 */
export function PasswordStrengthMeterCompact({
  password,
  className = '',
}: Omit<PasswordStrengthMeterProps, 'showChecklist' | 'showEntropy'>) {
  const t = useTranslations();

  if (!password) return null;

  const display = getPasswordStrengthDisplay(password);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{t(display.labelKey)}</span>
        <span className="text-xs text-gray-500">{display.percentage}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${display.color}`}
          style={{ width: `${display.percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * DETAILED VERSION
 * For comprehensive password analysis page
 */
export function PasswordStrengthAnalysis({
  password,
  className = '',
}: Omit<PasswordStrengthMeterProps, 'showChecklist' | 'showEntropy'>) {
  const t = useTranslations();

  if (!password) {
    return (
      <div className={`py-12 text-center text-gray-500 ${className}`}>
        {t('common.enterPassword')}
      </div>
    );
  }

  const display = getPasswordStrengthDisplay(password);
  const checklist = getPasswordRequirementChecklist(password);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b pb-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t('strength.analysis')}</h3>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              display.color.replace('bg-', 'bg-') + ' text-white'
            }`}
          >
            {t(display.labelKey)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Strength Score</span>
            <span className="font-semibold">{display.percentage}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all ${display.color}`}
              style={{ width: `${display.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Requirements Grid */}
      <div className="grid grid-cols-2 gap-4">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border-2 p-3 transition-colors ${
              item.met ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  item.met ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {item.met ? '✓' : '✕'}
              </span>
              <span
                className={`text-sm font-medium ${item.met ? 'text-green-700' : 'text-gray-600'}`}
              >
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Entropy Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="mb-2 text-sm font-semibold text-blue-900">Entropy Information</p>
        <p className="text-sm text-blue-700">
          This password has approximately <strong>{display.entropy}</strong> bits of entropy, making
          it resistant to brute force attacks.
        </p>
      </div>

      {/* Recommendations */}
      {display.percentage < 100 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="mb-3 text-sm font-semibold text-yellow-900">{t('strength.suggestions')}</p>
          <ul className="space-y-2">
            {display.missingRequirements.map((req, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-yellow-800">
                <span>•</span>
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
