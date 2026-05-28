import {
  calculatePasswordStrength,
  getPasswordStrengthInfo,
  getMissingRequirements,
  getPasswordStrengthPercentage,
  isPasswordStrong,
  generateStrongPassword,
  formatEntropy,
} from './password-helpers';

/**
 * ============================================
 * PASSWORD STRENGTH UTILITIES
 * ============================================
 * Production-grade password strength calculation
 * Support cho UI display & real-time feedback
 */

export { calculatePasswordStrength } from './password-helpers';

/**
 * Legacy compatibility: strengthLevels array
 * (untuk support code cũ, nhưng recommend use calculatePasswordStrength())
 */
export const strengthLevels = [
  { labelKey: 'strength.weak', color: 'bg-rose-500' },
  { labelKey: 'strength.medium', color: 'bg-yellow-500' },
  { labelKey: 'strength.strong', color: 'bg-emerald-500' },
] as const;

/**
 * Legacy compatibility: getPasswordStrength()
 * Maps old behavior ke new calculatePasswordStrength()
 *
 * @deprecated Prefer calculatePasswordStrength()
 * @returns 0 (weak), 1 (medium), 2 (strong)
 */
export function getPasswordStrength(password: string): 0 | 1 | 2 {
  const { level } = calculatePasswordStrength(password);
  return level.value as 0 | 1 | 2;
}

/**
 * ============================================
 * UI HELPER FUNCTIONS
 * ============================================
 */

/**
 * Get password strength display info cho rendering UI
 * Trả về: label key (i18n), color, description, percentage, entropy
 *
 * Usage:
 * const info = getPasswordStrengthDisplay(password);
 * <PasswordStrength
 *   color={info.color}
 *   label={t(info.labelKey)}
 *   description={info.description}
 *   percentage={info.percentage}
 *   entropy={info.entropy}
 * />
 */
export function getPasswordStrengthDisplay(password: string) {
  const strength = getPasswordStrengthInfo(password);
  const percentage = getPasswordStrengthPercentage(password);
  const missing = getMissingRequirements(password);
  const { entropy } = calculatePasswordStrength(password);

  return {
    ...strength,
    percentage,
    entropy,
    missingRequirements: missing,
  };
}

/**
 * Get password strength checklist cho interactive UI
 * Hiển thị từng requirement status: ✓ hoặc ✗
 *
 * Usage:
 * const checklist = getPasswordRequirementChecklist(password);
 * {checklist.map(item => (
 *   <ChecklistItem key={item.id} {...item} />
 * ))}
 */
export function getPasswordRequirementChecklist(password: string) {
  const { requirementsMet } = calculatePasswordStrength(password);

  const requirements = [
    {
      id: 'minLength',
      label: 'At least 8 characters',
      met: requirementsMet.includes('minLength'),
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter (a-z)',
      met: requirementsMet.includes('lowercase'),
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter (A-Z)',
      met: requirementsMet.includes('uppercase'),
    },
    {
      id: 'number',
      label: 'One number (0-9)',
      met: requirementsMet.includes('number'),
    },
    {
      id: 'special',
      label: 'One special character (!@#$%)',
      met: requirementsMet.includes('special'),
    },
  ];

  return requirements;
}

/**
 * ============================================
 * PASSWORD ANALYSIS & FEEDBACK
 * ============================================
 */

/**
 * Get detailed password analysis
 * Untuk advanced UI yang show entropy, bits, etc
 *
 * @param password - Password to analyze
 * @returns Detailed analysis object
 */
export function getPasswordAnalysis(password: string) {
  const analysis = calculatePasswordStrength(password);
  const display = getPasswordStrengthDisplay(password);
  const checklist = getPasswordRequirementChecklist(password);

  return {
    score: analysis.score,
    maxScore: 6,
    entropyFormatted: formatEntropy(analysis.entropy),
    percentageStrength: display.percentage,
    ...display,
    checklist,
  };
}

/**
 * Suggest password strength improvement
 * Return actionable feedback
 *
 * @param password - Current password
 * @returns Suggestion message
 */
export function suggestPasswordImprovement(password: string): string {
  const missing = getMissingRequirements(password);

  if (missing.length === 0) {
    return 'Password is strong! Ready to use.';
  }

  if (missing.length === 1) {
    return `Add ${missing[0].toLowerCase()} to improve.`;
  }

  return `Add: ${missing.slice(0, 2).join(', ')}`;
}

/**
 * ============================================
 * STRENGTH CHECKERS
 * ============================================
 */

export { isPasswordStrong, generateStrongPassword };

/**
 * Check nếu password đạt minimum requirement (medium+)
 * Dùng cho form validation
 */
export function isPasswordAcceptable(password: string): boolean {
  const { level } = calculatePasswordStrength(password);
  // Medium strength or better
  return level.value >= 1;
}

/**
 * ============================================
 * UTILITIES
 * ============================================
 */

/**
 * Get password strength color cho Tailwind
 * Quick helper cho inline styling
 */
export function getPasswordStrengthColor(password: string): string {
  return getPasswordStrengthInfo(password).color;
}

/**
 * Get password strength label key cho i18n
 */
export function getPasswordStrengthLabel(password: string): string {
  return getPasswordStrengthInfo(password).labelKey;
}
