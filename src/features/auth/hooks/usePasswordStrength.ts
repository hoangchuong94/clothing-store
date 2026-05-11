import { getPasswordStrength, strengthLevels } from '../lib/auth-utils';

export interface PasswordStrengthResult {
  score: number;
  level: (typeof strengthLevels)[number];
  progress: string;
  isValid: boolean;
}

/**
 * Hook for password strength calculation and validation
 */
export function usePasswordStrength(password: string): PasswordStrengthResult {
  const score = getPasswordStrength(password);
  const level = strengthLevels[score];
  const progress = `${(score / (strengthLevels.length - 1)) * 100}%`;
  const isValid = score >= 2; // Require at least "good" strength

  return {
    score,
    level,
    progress,
    isValid,
  };
}
