# Password Validation System - Integration Guide

## Quick Start (5 Minutes)

### Step 1: Use RegisterSchema in Your Form

Before:

```typescript
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // ❌ Too weak!
});
```

After:

```typescript
import { RegisterSchema } from '@/features/auth/schemas/auth-schemas';

const form = useForm({
  resolver: zodResolver(RegisterSchema),
  // ✅ Now enforces: 8+ chars, uppercase, lowercase, number, special char
});
```

### Step 2: Add Visual Strength Indicator

```typescript
'use client';

import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';

export function RegisterForm() {
  const form = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('password')} type="password" />

      {/* Add this one line! */}
      <PasswordStrengthMeter password={form.watch('password')} />

      <button type="submit">Register</button>
    </form>
  );
}
```

### Step 3: Server-Side Validation

```typescript
'use server';

import { RegisterSchema } from '@/features/auth/schemas/auth-schemas';
import { hash } from 'bcryptjs';

export async function registerAction(formData: unknown) {
  // 1. Validate
  const result = RegisterSchema.safeParse(formData);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  // 2. Hash password (bcrypt 12 rounds)
  const hashedPassword = await hash(result.data.password, 12);

  // 3. Save to database
  // await createUser(result.data.email, result.data.name, hashedPassword);

  return { success: true };
}
```

**That's it!** ✨

---

## Common Use Cases

### Use Case 1: Change Password Form

```typescript
import { ChangePasswordSchema } from '@/features/auth/schemas/auth-schemas';

export function ChangePasswordForm() {
  const form = useForm({
    resolver: zodResolver(ChangePasswordSchema),
    // Validates:
    // - currentPassword (required)
    // - password (new password with all requirements)
    // - passwordConfirm (must match password)
    // - Ensures new password ≠ current password
  });

  return (
    <form>
      <input {...form.register('currentPassword')} type="password" />
      <input {...form.register('password')} type="password" />
      <PasswordStrengthMeter password={form.watch('password')} />
      <input {...form.register('passwordConfirm')} type="password" />
      <button>Change Password</button>
    </form>
  );
}
```

### Use Case 2: Password Reset Form

```typescript
import { ResetPasswordSchema } from '@/features/auth/schemas/auth-schemas';

export function ResetPasswordForm() {
  const form = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    // Validates:
    // - email (required, valid format)
    // - token (from URL)
    // - password (new strong password)
    // - passwordConfirm (must match)
  });

  return (
    <form>
      <input {...form.register('email')} type="email" />
      <input {...form.register('token')} type="hidden" />
      <input {...form.register('password')} type="password" />
      <PasswordStrengthMeter password={form.watch('password')} />
      <input {...form.register('passwordConfirm')} type="password" />
      <button>Reset Password</button>
    </form>
  );
}
```

### Use Case 3: Display Password Analysis

```typescript
'use client';

import { getPasswordAnalysis } from '@/features/auth/lib/auth-utils';

export function PasswordAnalysisPage() {
  const [password, setPassword] = useState('');

  if (!password) return <p>Enter a password to analyze</p>;

  const analysis = getPasswordAnalysis(password);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded">
        <p>Score: {analysis.score} / {analysis.maxScore}</p>
        <p>Strength: {analysis.labelKey}</p>
        <p>Entropy: {analysis.entropyFormatted}</p>
      </div>

      <div>
        <p className="font-bold mb-2">Requirements:</p>
        <ul>
          {analysis.checklist.map(item => (
            <li key={item.id}>
              {item.met ? '✓' : '○'} {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### Use Case 4: Custom Hook

```typescript
'use client';

import { getPasswordStrengthDisplay } from '@/features/auth/lib/auth-utils';

export function usePasswordStrength(password: string) {
  const display = getPasswordStrengthDisplay(password);

  return {
    strength: display.labelKey, // 'strength.weak' | 'strength.medium' | 'strength.strong'
    percentage: display.percentage,
    color: display.color, // Tailwind bg-color
    isStrong: display.value === 2,
    isMedium: display.value === 1,
    isWeak: display.value === 0,
    missingRequirements: display.missingRequirements,
  };
}

// Usage:
function MyForm() {
  const password = form.watch('password');
  const strength = usePasswordStrength(password);

  return (
    <>
      <input type="password" {...form.register('password')} />
      {strength.isStrong && <p>✓ Strong password!</p>}
      {!strength.isStrong && (
        <p>Missing: {strength.missingRequirements.join(', ')}</p>
      )}
      <button disabled={!strength.isStrong}>
        Register
      </button>
    </>
  );
}
```

---

## Validation Flow

```
User Input
    ↓
Client-side validation (React Hook Form + Zod)
    ↓ If invalid, show error immediately
    ↓
User submits form
    ↓
Server-side validation (RegisterSchema.safeParse)
    ↓ If invalid, return error
    ↓
Check email not duplicate
    ↓
Check password not breached (optional HIBP API)
    ↓
Hash password with bcrypt
    ↓
Save to database
    ↓
Send verification email
```

---

## Error Messages

All error messages use i18n keys. Example:

```typescript
// When password is too short
{form.formState.errors.password && (
  <span>{t(form.formState.errors.password.message)}</span>
  // 'validation.passwordTooShort' → "Password must be at least 8 characters."
)}
```

### Available Message Keys

```
validation.passwordRequired
validation.passwordTooShort
validation.passwordTooLong
validation.passwordNoLowercase
validation.passwordNoUppercase
validation.passwordNoNumber
validation.passwordNoSpecialChar
validation.passwordHasWhitespace
validation.passwordMismatch
validation.passwordSameAsPrevious
```

---

## Advanced: Direct Validation

If you need to validate outside of forms:

```typescript
import { validatePasswordStrength } from '@/features/auth/lib/password-validators';

// Direct validation
const result = validatePasswordStrength('MyPass123!');

if (result.valid) {
  console.log('✓ Password is valid');
} else {
  console.log('✗ Errors:', result.errors);
  // ['validation.passwordTooShort', 'validation.passwordNoSpecial']
}
```

---

## Advanced: Calculate Strength Programmatically

```typescript
import {
  calculatePasswordStrength,
  getMissingRequirements,
  isPasswordStrong,
} from '@/features/auth/lib/password-helpers';

const password = 'MyPassword123!';

// Full calculation
const strength = calculatePasswordStrength(password);
console.log(strength.score); // 5 (out of 6)
console.log(strength.entropy); // 45.2 bits
console.log(strength.level.value); // 2 (STRONG)

// Missing requirements
const missing = getMissingRequirements(password);
console.log(missing); // [] (empty = all requirements met)

// Quick boolean check
if (isPasswordStrong(password)) {
  console.log('Strong enough to register');
}
```

---

## Advanced: Server-Side Password Change

```typescript
'use server';

import { ChangePasswordSchema } from '@/features/auth/schemas/auth-schemas';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';

export async function changePasswordAction(data: unknown) {
  // 1. Authenticate user
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  // 2. Validate input
  const result = ChangePasswordSchema.safeParse(data);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  // 3. Get current password from DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  // 4. Verify current password
  const isCurrentCorrect = await compare(result.data.currentPassword, user.password);
  if (!isCurrentCorrect) {
    return { error: 'Current password is incorrect' };
  }

  // 5. Hash new password
  const hashedPassword = await hash(result.data.password, 12);

  // 6. Update password
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  // 7. Invalidate all sessions (logout everywhere)
  // await invalidateAllSessions(session.user.id);

  // 8. Send notification email
  // await sendPasswordChangedEmail(user.email);

  return { success: true };
}
```

---

## Checklist for Implementation

- [ ] Read PASSWORD_VALIDATION_README.md
- [ ] Import RegisterSchema in your register form
- [ ] Add PasswordStrengthMeter component
- [ ] Update server-side registration action
- [ ] Test with weak password → should show errors
- [ ] Test with strong password → should pass
- [ ] Verify error messages display correctly
- [ ] Check i18n translations work (English & Vietnamese)
- [ ] Test on mobile (responsive)
- [ ] Enable ChangePasswordSchema if using change password
- [ ] Set up password hashing (bcrypt 12 rounds)
- [ ] (Optional) Add HaveIBeenPwned API check
- [ ] (Optional) Implement 2FA

---

## Troubleshooting

### Q: Password error message not showing?

A: Check that the field name matches: `form.register('password')` not `form.register('pwd')`

### Q: PasswordStrengthMeter not updating?

A: Make sure you're using `form.watch('password')` to track changes:

```typescript
<PasswordStrengthMeter password={form.watch('password')} />
```

### Q: Type errors in TypeScript?

A: Make sure you import types correctly:

```typescript
import type { RegisterSchema } from '@/features/auth/schemas/auth-schemas';
type RegisterFormValues = RegisterSchema;
```

### Q: Should I use ResetPasswordSchema?

A: Yes, if you have a "Forgot Password" → email link → reset password flow

### Q: How strong should passwords be?

A: "Medium" (score 2-3) is acceptable for most users. "Strong" (score 4+) is recommended for sensitive operations.

---

## Performance Notes

- Validation is **instant** (no API calls for client-side)
- Strength calculation is **<1ms** (entropy is calculated locally)
- Optional: Server-side HaveIBeenPwned check adds ~100-200ms (async)

---

## Security Reminders

✅ **DO:**

- Always validate server-side
- Hash with bcrypt 12+ rounds
- Store hashed passwords only
- Use HTTPS for all transmission

❌ **DON'T:**

- Trust client-side validation alone
- Store plain-text passwords
- Log passwords anywhere
- Use weak hashing (MD5, SHA1)

---

## Next: Add Tests

```typescript
import { validatePasswordStrength } from '@/features/auth/lib/password-validators';

describe('Password Validation', () => {
  test('validates strong passwords', () => {
    const result = validatePasswordStrength('MyStr0ng!');
    expect(result.valid).toBe(true);
  });

  test('rejects weak passwords', () => {
    const result = validatePasswordStrength('weak');
    expect(result.valid).toBe(false);
  });

  test('rejects passwords with whitespace', () => {
    const result = validatePasswordStrength('My Pass 123!');
    expect(result.valid).toBe(false);
  });
});
```

---

## Files to Review

Essential files to understand the system:

1. **password-constants.ts** - The standards/config
2. **password-validators.ts** - The Zod validators
3. **password-helpers.ts** - The strength calculation
4. **auth-schemas.ts** - The schemas (use these!)
5. **PasswordStrengthMeter.tsx** - The UI components

---

**Ready to integrate?** Start with Step 1 above! 🚀
