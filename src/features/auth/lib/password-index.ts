/**
 * Password Validation & Strength System - Main Exports
 *
 * Production-grade password validation for authentication
 * Designed for Next.js + TypeScript SaaS/Ecommerce applications
 */

// Constants
export {
  PASSWORD_CONSTRAINTS,
  PASSWORD_PATTERNS,
  PASSWORD_STRENGTH_LEVELS,
  PASSWORD_ERROR_MESSAGES,
  PASSWORD_STRENGTH_THRESHOLDS,
  PASSWORD_VALIDATION_CONFIG,
  type PasswordStrengthLevel,
  type PasswordConstraints,
} from './password-constants';

// Validators
export {
  validatePasswordStrength,
  passwordValidator,
  passwordMatchValidator,
  validatePasswordDifferent,
  validatePasswordNotBreached,
  type ValidatePasswordResult,
} from './password-validators';

// Helpers
export {
  calculatePasswordStrength,
  getPasswordStrengthInfo,
  formatEntropy,
  isPasswordStrong,
  getMissingRequirements,
  getPasswordStrengthPercentage,
  generateStrongPassword,
  type PasswordStrengthInfo,
  type PasswordStrengthCalculation,
} from './password-helpers';

// Auth Utils
export {
  getPasswordStrength,
  strengthLevels,
  getPasswordStrengthDisplay,
  getPasswordRequirementChecklist,
  getPasswordAnalysis,
  suggestPasswordImprovement,
  isPasswordAcceptable,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
} from './auth-utils';
