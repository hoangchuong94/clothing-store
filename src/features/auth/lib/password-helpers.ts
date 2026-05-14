import {
  PASSWORD_PATTERNS,
  PASSWORD_STRENGTH_LEVELS,
  PASSWORD_STRENGTH_THRESHOLDS,
  PASSWORD_CONSTRAINTS,
} from './password-constants';

/**
 * Password Strength Helper
 *
 * Đánh giá password strength dựa trên:
 * 1. Entropy thực tế (khó dự đoán/crack)
 * 2. Đáp ứng requirements (diversified character types)
 * 3. Độ dài (longer = harder to crack)
 *
 * Algorithm:
 * - Base score: 0
 * - +1: length >= 8 chars
 * - +1: length >= 12 chars (bonus for extra security margin)
 * - +1: has lowercase
 * - +1: has uppercase
 * - +1: has number
 * - +1: has special character
 * = Maximum 6 points
 *
 * Mapping:
 * - 0-1 points: WEAK (có thể crack với dictionary/brute force)
 * - 2-3 points: MEDIUM (reasonable protection cho avg user)
 * - 4+ points: STRONG (good protection ngay cả against advanced attacks)
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  level: (typeof PASSWORD_STRENGTH_LEVELS)[keyof typeof PASSWORD_STRENGTH_LEVELS];
  entropy: number;
  requirementsMet: string[];
} {
  let score = 0;
  const requirementsMet: string[] = [];

  // Trim password để consistent với validation
  const trimmed = password.trim();

  // Score 1: Base length >= 8
  if (trimmed.length >= PASSWORD_CONSTRAINTS.MIN_LENGTH) {
    score++;
    requirementsMet.push('minLength');
  }

  // Score 2: Extra length bonus >= 12
  // Rationale: 12 chars significantly increases entropy vs 8 chars
  if (trimmed.length >= 12) {
    score++;
    requirementsMet.push('extraLength');
  }

  const hasLowercase = PASSWORD_PATTERNS.LOWERCASE.test(trimmed);
  const hasUppercase = PASSWORD_PATTERNS.UPPERCASE.test(trimmed);
  const hasNumber = PASSWORD_PATTERNS.NUMBER.test(trimmed);
  const hasSpecial = PASSWORD_PATTERNS.SPECIAL_CHAR.test(trimmed);

  // Score 3: Has lowercase
  if (hasLowercase) {
    score++;
    requirementsMet.push('lowercase');
  }

  // Score 4: Has uppercase
  if (hasUppercase) {
    score++;
    requirementsMet.push('uppercase');
  }

  // Score 5: Has number
  if (hasNumber) {
    score++;
    requirementsMet.push('number');
  }

  // Score 6: Has special character
  if (hasSpecial) {
    score++;
    requirementsMet.push('special');
  }

  const hasAllRequiredTypes = hasLowercase && hasUppercase && hasNumber && hasSpecial;

  // Cấp độ strength dựa trên score và tất cả yêu cầu ký tự
  let level: (typeof PASSWORD_STRENGTH_LEVELS)[keyof typeof PASSWORD_STRENGTH_LEVELS];

  if (score >= PASSWORD_STRENGTH_THRESHOLDS.STRONG_MIN_REQUIREMENTS && hasAllRequiredTypes) {
    level = PASSWORD_STRENGTH_LEVELS.STRONG;
  } else if (score >= PASSWORD_STRENGTH_THRESHOLDS.MEDIUM_MIN_REQUIREMENTS) {
    level = PASSWORD_STRENGTH_LEVELS.MEDIUM;
  } else {
    level = PASSWORD_STRENGTH_LEVELS.WEAK;
  }

  // Tính entropy thực tế (simplified)
  // Actual formula: E = log2(charset_size^length)
  // Charset size ước tính dựa trên character types:
  // - lowercase: 26
  // - uppercase: 26
  // - number: 10
  // - special: ~30
  // Total possibility: ~92 characters
  const charsetSize = 26 + 26 + 10 + 30; // ~92
  const entropy = Math.log2(Math.pow(charsetSize, trimmed.length));

  return {
    score,
    level,
    entropy,
    requirementsMet,
  };
}

/**
 * Get password strength label & color cho UI display
 *
 * @param password - Password to evaluate
 * @returns { label: string; color: string; description: string }
 *
 * Usage:
 * const strength = getPasswordStrengthInfo(password);
 * <PasswordStrengthMeter
 *   color={strength.color}
 *   label={t(strength.label)}
 *   description={strength.description}
 * />
 */
export function getPasswordStrengthInfo(password: string) {
  const { level } = calculatePasswordStrength(password);
  return {
    labelKey: level.labelKey,
    color: level.color,
    description: level.description,
    value: level.value,
  };
}

/**
 * Format entropy value thành human-readable string
 *
 * @param entropy - Entropy bits
 * @returns formatted string (e.g., "42 bits")
 */
export function formatEntropy(entropy: number): string {
  return `${Math.round(entropy)} bits`;
}

/**
 * Check nếu password đạt strong level
 * Dùng cho form validation logic
 *
 * @param password - Password to check
 * @returns boolean - true nếu strong, false nếu weak/medium
 */
export function isPasswordStrong(password: string): boolean {
  const { level } = calculatePasswordStrength(password);
  return level.value === PASSWORD_STRENGTH_LEVELS.STRONG.value;
}

/**
 * Get yêu cầu còn thiếu dưới dạng readable list
 *
 * @param password - Password to analyze
 * @returns Array of missing requirements descriptions
 *
 * Example output:
 * ['At least 1 uppercase letter', 'At least 1 special character']
 */
export function getMissingRequirements(password: string): string[] {
  const trimmed = password.trim();
  const missing: string[] = [];

  // Các yêu cầu trong ngôn ngữ thân thiện
  const requirementDescriptions = {
    minLength: `At least ${PASSWORD_CONSTRAINTS.MIN_LENGTH} characters`,
    lowercase: 'At least 1 lowercase letter (a-z)',
    uppercase: 'At least 1 uppercase letter (A-Z)',
    number: 'At least 1 number (0-9)',
    special: `At least 1 special character (!@#$%)`,
    maxLength: `Maximum ${PASSWORD_CONSTRAINTS.MAX_LENGTH} characters`,
  };

  // Check mỗi requirement
  if (trimmed.length < PASSWORD_CONSTRAINTS.MIN_LENGTH) {
    missing.push(requirementDescriptions.minLength);
  }

  if (trimmed.length > PASSWORD_CONSTRAINTS.MAX_LENGTH) {
    missing.push(requirementDescriptions.maxLength);
  }

  if (!PASSWORD_PATTERNS.LOWERCASE.test(trimmed)) {
    missing.push(requirementDescriptions.lowercase);
  }

  if (!PASSWORD_PATTERNS.UPPERCASE.test(trimmed)) {
    missing.push(requirementDescriptions.uppercase);
  }

  if (!PASSWORD_PATTERNS.NUMBER.test(trimmed)) {
    missing.push(requirementDescriptions.number);
  }

  if (!PASSWORD_PATTERNS.SPECIAL_CHAR.test(trimmed)) {
    missing.push(requirementDescriptions.special);
  }

  return missing;
}

/**
 * Visual strength meter score (0-100)
 * Dùng cho progress bar UI
 *
 * @param password - Password to evaluate
 * @returns number 0-100 representing strength percentage
 */
export function getPasswordStrengthPercentage(password: string): number {
  const { score } = calculatePasswordStrength(password);
  const maxScore = PASSWORD_STRENGTH_THRESHOLDS.MAX_SCORE || 6;
  return Math.round((score / maxScore) * 100);
}

/**
 * Generate random strong password (utility)
 * Dùng cho "Suggest Password" feature nếu có
 *
 * @returns Generated strong password (8-16 chars, all requirements met)
 */
export function generateStrongPassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Ensure tất cả requirement type được include
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specials[Math.floor(Math.random() * specials.length)];

  // Fill remaining chars ngẫu nhiên từ tất cả set
  const allChars = lowercase + uppercase + numbers + specials;
  const targetLength = 12; // Strong password length

  for (let i = password.length; i < targetLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle để không có pattern
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Type exports
 */
export type PasswordStrengthInfo = ReturnType<typeof getPasswordStrengthInfo>;
export type PasswordStrengthCalculation = ReturnType<typeof calculatePasswordStrength>;
