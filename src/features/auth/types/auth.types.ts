/**
 * Authentication types and interfaces
 * Centralized type definitions for the auth feature
 */

import { type UseFormRegister, type Control } from 'react-hook-form';
import { type LoginSchema, type RegisterSchema } from '../schemas/auth-schemas';
import { type UserRole } from '@/generated/prisma/enums';

/**
 * Type-safe auth error codes
 * Used for mapping and translation-friendly error handling
 */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'error.invalidCredentials',
  EMAIL_NOT_FOUND: 'error.emailNotFound',
  EMAIL_ALREADY_EXISTS: 'error.emailAlreadyExists',
  EMAIL_NOT_VERIFIED: 'error.emailNotVerified',
  ACCOUNT_NOT_LINKED: 'error.accountNotLinked',
  OAUTH_ERROR: 'error.oauthError',
  INVALID_FIELDS: 'error.invalidFields',
  DATABASE_ERROR: 'error.databaseError',
  UNKNOWN_ERROR: 'error.unknownError',
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

/**
 * Get provider-specific error code
 */
export function getProviderErrorCode(provider: string): string {
  return `error.provider.${provider}Error`;
}

/**
 * Structured auth error object
 * Enables type-safe error handling throughout the app
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
  isTranslated?: boolean; // Whether message is already translated
}

/**
 * Authentication response from server actions
 * Standardized format for all auth operations
 */
export interface AuthResponse<T = void> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

/**
 * Social provider types
 */
export type SocialProvider = 'google' | 'github';

/**
 * Login form values type (inferred from schema)
 */
export type LoginFormValues = LoginSchema;

/**
 * Register form values type (inferred from schema)
 */
export type RegisterFormValues = RegisterSchema;

/**
 * Session user with role information
 */
export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  scopes: string[];
}

/**
 * OAuth account linking state
 */
export interface OAuthAccountLinkingError {
  provider: SocialProvider;
  email: string;
  linkedProvider?: SocialProvider;
}

/**
 * Auth configuration from URL search params
 */
export interface AuthUrlParams {
  callbackUrl?: string;
  error?: string;
  errorDetails?: OAuthAccountLinkingError;
}

/**
 * Login hook return type
 */
export interface UseLoginReturn {
  // Form methods
  register: UseFormRegister<LoginFormValues>; // react-hook-form register
  handleSubmit: (
    onSubmit: (data: LoginFormValues) => Promise<void>,
  ) => (e?: React.FormEvent) => Promise<void>; // react-hook-form handleSubmit
  formState: {
    errors: Record<string, { message?: string }>;
    isValid: boolean;
    isDirty: boolean;
  };

  // State
  isLoading: boolean;
  error: AuthError | null;
  success: boolean;

  // Methods
  onSubmit: (values: LoginFormValues) => Promise<void>;
  onSocialAuth: (provider: SocialProvider) => Promise<void>;
  clearError: () => void;
  getErrorMessage: (authError: AuthError | null) => string;
}

/**
 * Register hook return type
 */
export interface UseRegisterReturn {
  // Form methods
  register: UseFormRegister<RegisterFormValues>; // react-hook-form register
  handleSubmit: (
    onSubmit: (data: RegisterFormValues) => Promise<void>,
  ) => (e?: React.FormEvent) => Promise<void>; // react-hook-form handleSubmit
  control: Control<RegisterFormValues>; // react-hook-form control
  formState: {
    errors: Record<string, { message?: string }>;
    isValid: boolean;
    isDirty: boolean;
  };

  // State
  isLoading: boolean;
  error: AuthError | null;
  success: boolean;

  // Methods
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  onSocialAuth: (provider: SocialProvider) => Promise<void>;
  clearError: () => void;
  getErrorMessage: (authError: AuthError | null) => string;
}

/**
 * Callback URL configuration
 * Handles redirect logic after authentication
 */
export interface CallbackUrlConfig {
  default: string;
  admin: string;
  getRedirectUrl: (userRole?: UserRole) => string;
}

export type RoleCode = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'SELLER' | 'CUSTOMER';

export type Scope = 'admin' | 'staff' | 'seller' | 'account' | 'cart';
