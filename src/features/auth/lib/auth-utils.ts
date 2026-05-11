export const strengthLevels = [
  { labelKey: 'strength.tooWeak', color: 'bg-rose-500' },
  { labelKey: 'strength.fair', color: 'bg-amber-400' },
  { labelKey: 'strength.good', color: 'bg-sky-400' },
  { labelKey: 'strength.strong', color: 'bg-emerald-400' },
] as const;

export function getPasswordStrength(password: string) {
  const score = [
    password.length >= 6,
    password.length >= 12,
    /[A-Z]/.test(password),
    /[0-7]/.test(password),
    /[^A-Za-z0-7]/.test(password),
  ].filter(Boolean).length;

  return Math.min(Math.max(score - 1, 0), strengthLevels.length - 1);
}
