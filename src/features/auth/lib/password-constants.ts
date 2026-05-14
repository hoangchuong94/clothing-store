/**
 * Password Validation Constants & Configuration
 *
 * Tiêu chuẩn này được thiết kế cho production SaaS/Ecommerce:
 * - Đủ mạnh để bảo vệ tài khoản
 * - Thân thiện với UX người dùng thực tế
 * - Tuân thủ best practices OWASP
 *
 * Giải thích bcrypt 72-byte limit:
 * bcrypt (thuật toán hashing được sử dụng bởi bcryptjs/argon2):
 * - Chỉ sử dụng 72 byte đầu tiên của password
 * - Ký tự ngoài 72 bytes sẽ bị bỏ qua (khó phát hiện)
 * - Do đó: giới hạn 72 ký tự tránh false sense of security
 * - 72 ký tự đã enough cho bất kỳ password thực tế nào
 * - Tham khảo: https://cheatsheetseries.owasp.org/
 */

/**
 * Password Length Constraints
 * Tuân thủ: OWASP, NIST SP 800-63-3, CWE-521
 */
export const PASSWORD_CONSTRAINTS = {
  /** Độ dài tối thiểu (bytes) - 8 ký tự là standard thực tế */
  MIN_LENGTH: 8,

  /** Độ dài tối đa (bytes) - phù hợp bcrypt 72-byte limit */
  MAX_LENGTH: 72,

  /** Số lần thử nhập sai trước khi lock account (để prevent brute force) */
  MAX_ATTEMPTS: 5,

  /** Thời gian lock account (phút) */
  LOCKOUT_DURATION_MINUTES: 15,
} as const;

/**
 * Character Set Patterns
 * Tách biệt rõ ràng để tránh hardcode regex phức tạp
 */
export const PASSWORD_PATTERNS = {
  /** Ít nhất 1 chữ cái viết thường: a-z */
  LOWERCASE: /[a-z]/,

  /** Ít nhất 1 chữ cái viết HOA: A-Z */
  UPPERCASE: /[A-Z]/,

  /** Ít nhất 1 chữ số: 0-9 */
  NUMBER: /[0-9]/,

  /**
   * Ít nhất 1 ký tự đặc biệt
   * Danh sách: ! @ # $ % ^ & * ( ) - _ = + [ ] { } ; : ' " , . < > ? / \ | ~ `
   * Tránh whitespace, quote lồng nhau
   */
  SPECIAL_CHAR: /[!@#$%^&*()\-_=+\[\]{};:'",.<>?/\\|~`]/,

  /**
   * Whitespace (space, tab, newline)
   * Dùng để detect & reject whitespace bất kỳ
   */
  WHITESPACE: /\s/,

  /**
   * Kiểm tra leading/trailing whitespace cụ thể
   * Dùng sau trim() để detect nếu user có ý định thêm space
   */
  LEADING_TRAILING: /^\s+|\s+$/,
} as const;

/**
 * Password Strength Levels
 * Dựa trên entropy thực tế & requirement combinations
 * Tính toán entropy đơn giản: log2(charset_size^length)
 *
 * Entropy breakdown:
 * - Weak: < 40 bits (easily cracked with modern hardware)
 * - Medium: 40-60 bits (reasonable resistance)
 * - Strong: > 60 bits (strong resistance)
 */
export const PASSWORD_STRENGTH_LEVELS = {
  WEAK: {
    value: 0,
    labelKey: 'strength.weak',
    color: 'bg-red-500',
    description: 'Quá yếu, dễ bị tấn công',
  },
  MEDIUM: {
    value: 1,
    labelKey: 'strength.medium',
    color: 'bg-yellow-500',
    description: 'Trung bình, chấp nhận được',
  },
  STRONG: {
    value: 2,
    labelKey: 'strength.strong',
    color: 'bg-green-500',
    description: 'Mạnh, bảo vệ tốt',
  },
} as const;

/**
 * Error Message Keys (i18n)
 * Format: 'validation.passwordXxx'
 * Dùng trong Zod schema để hỗ trợ i18n
 */
export const PASSWORD_ERROR_MESSAGES = {
  REQUIRED: 'validation.passwordRequired',
  TOO_SHORT: 'validation.passwordTooShort',
  TOO_LONG: 'validation.passwordTooLong',
  NO_LOWERCASE: 'validation.passwordNoLowercase',
  NO_UPPERCASE: 'validation.passwordNoUppercase',
  NO_NUMBER: 'validation.passwordNoNumber',
  NO_SPECIAL_CHAR: 'validation.passwordNoSpecialChar',
  HAS_WHITESPACE: 'validation.passwordHasWhitespace',
  MISMATCH: 'validation.passwordMismatch',
  SAME_AS_PREVIOUS: 'validation.passwordSameAsPrevious',
} as const;

/**
 * Strength Score Thresholds
 * Dùng để quyết định weak/medium/strong dựa trên entropy thực tế
 */
export const PASSWORD_STRENGTH_THRESHOLDS = {
  /** Score >= 2 = medium strength */
  MEDIUM_MIN_REQUIREMENTS: 2,

  /** Score >= 5 + all required character types = strong strength */
  STRONG_MIN_REQUIREMENTS: 5,

  /**
   * Điểm tối đa có thể đạt được:
   * - 1 point: 8+ length
   * - 1 point: 12+ length
   * - 1 point: lowercase
   * - 1 point: uppercase
   * - 1 point: number
   * - 1 point: special char
   * = 6 total max
   */
  MAX_SCORE: 6,
} as const;

/**
 * Validation Config cho reusable schemas
 * (Register, Reset Password, Change Password)
 */
export const PASSWORD_VALIDATION_CONFIG = {
  /**
   * Danh sách ký tự đặc biệt được phép
   * (friendly cho UX, không quá hạn chế)
   */
  ALLOWED_SPECIAL_CHARS: '!@#$%^&*()-_=+[]{};\':".< >/\\|~`',

  /**
   * Phía server có thể cần reject passwords giống common patterns:
   * - Không giống email username
   * - Không giống company name
   * - Không nằm trong top 10k breached passwords
   * (nên kiểm tra với service như HaveIBeenPwned API)
   */
  SHOULD_CHECK_BREACHED_PASSWORDS: true,

  /**
   * Khi reset/change password:
   * Cần check password không giống password cũ
   */
  SHOULD_DIFFER_FROM_PREVIOUS: true,

  /**
   * Số lần password cũ không được phép sử dụng lại
   * NIST recommend: 5 previous passwords
   */
  PASSWORD_HISTORY_LIMIT: 5,
} as const;

export type PasswordStrengthLevel =
  (typeof PASSWORD_STRENGTH_LEVELS)[keyof typeof PASSWORD_STRENGTH_LEVELS];
export type PasswordConstraints = typeof PASSWORD_CONSTRAINTS;
