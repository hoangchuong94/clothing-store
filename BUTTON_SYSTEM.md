# Enterprise Button Design System

Production-grade button component with 9 premium variants, built with shadcn/ui, CVA, and Tailwind CSS v4.

## Architecture

- **Framework**: shadcn/ui with class-variance-authority (CVA)
- **Styling**: Tailwind CSS v4
- **File**: `src/components/ui/button.tsx`
- **API**: Unchanged from shadcn/ui standard

## Variants

### 1. **default**

Solid slate button with premium shadows. Primary action in most contexts.

```tsx
<Button variant="default" size="default">
  Click me
</Button>
```

**Use cases**: Secondary actions, form buttons, navigational buttons

---

### 2. **primary**

Gradient violet/fuchsia/indigo with premium shadow. Main call-to-action.

```tsx
<Button variant="primary" size="lg">
  <ArrowRight className="h-5 w-5" />
  Sign Up
</Button>
```

**Use cases**: Main CTAs, form submissions, important actions
**Features**: Gradient background, enhanced shadow on hover

---

### 3. **secondary**

Light slate with border. Alternative action.

```tsx
<Button variant="secondary" size="default">
  Cancel
</Button>
```

**Use cases**: Alternative actions, secondary options

---

### 4. **ghost**

Transparent with subtle hover. Minimal visual weight.

```tsx
<Button variant="ghost" size="sm">
  Learn more
</Button>
```

**Use cases**: Inline actions, supplementary buttons, subtle interactions

---

### 5. **glass**

Frosted glass effect with backdrop blur. Premium aesthetic.

```tsx
<Button variant="glass" size="icon">
  <Sun className="h-4 w-4" />
</Button>
```

**Use cases**: Theme toggle, overlay buttons, premium UI elements
**Features**: `backdrop-blur-xl`, white/slate with transparency

---

### 6. **social**

Soft white/slate for social authentication buttons.

```tsx
<Button variant="social" size="default" className="w-full">
  <GoogleIcon className="h-4 w-4" />
  Continue with Google
</Button>
```

**Use cases**: OAuth providers, social login, third-party integrations
**Features**: Soft shadows, minimal border, good contrast

---

### 7. **gradient**

Colorful gradient for prominent CTAs.

```tsx
<Button variant="gradient" size="lg">
  Upgrade Plan
</Button>
```

**Use cases**: Premium upgrades, special promotions, featured actions

---

### 8. **outline**

Minimal border with transparent background.

```tsx
<Button variant="outline" size="default">
  Skip
</Button>
```

**Use cases**: Modal buttons, optional actions, cancel buttons

---

### 9. **destructive**

Rose/red for destructive actions.

```tsx
<Button variant="destructive" size="default">
  Delete Account
</Button>
```

**Use cases**: Delete actions, dangerous operations, irreversible actions

---

### 10. **link**

Text-only link style with underline on hover.

```tsx
<Button variant="link">Forgot password?</Button>
```

**Use cases**: In-text links, secondary navigation, tertiary actions

---

## Sizes

| Size      | Height | Padding  | Use Case                     |
| --------- | ------ | -------- | ---------------------------- |
| `xs`      | h-8    | px-2.5   | Compact, inline actions      |
| `sm`      | h-9    | px-3     | Smaller buttons, tool bars   |
| `default` | h-11   | px-5     | Standard buttons             |
| `lg`      | h-12   | px-6     | Large CTAs, form submissions |
| `icon`    | 44px   | centered | Standard icon buttons        |
| `icon-sm` | 40px   | centered | Small icon buttons           |
| `icon-xs` | 32px   | centered | Tiny icon buttons            |
| `icon-lg` | 48px   | centered | Large icon buttons           |

---

## Usage Examples

### Authentication Form Submit

```tsx
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from '@/components/ui/icon';

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      disabled={isLoading}
      className="w-full"
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <span>Sign In</span>
          <ArrowRight className="h-5 w-5" />
        </>
      )}
    </Button>
  );
}
```

---

### Social Auth Buttons

```tsx
import { Button } from '@/components/ui/button';
import { GoogleIcon, GithubIcon } from '@/components/ui/icon';

export function SocialButtons() {
  return (
    <div className="grid gap-3">
      <Button variant="social" size="default" className="w-full">
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </Button>
      <Button variant="social" size="default" className="w-full">
        <GithubIcon className="h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  );
}
```

---

### Tab Navigation

```tsx
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function AuthTabs({ activeTab }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-slate-100/80 p-1">
      {['signin', 'signup'].map((tab) => (
        <Button
          key={tab}
          variant="glass"
          size="default"
          className={cn(
            'relative',
            activeTab === tab ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-slate-900',
          )}
        >
          {tab === 'signin' ? 'Sign In' : 'Sign Up'}
          {activeTab === tab && (
            <motion.span
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-full bg-white/90"
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            />
          )}
        </Button>
      ))}
    </div>
  );
}
```

---

### Theme Toggle Icon Button

```tsx
import { Button } from '@/components/ui/button';
import { Sun, Moon } from '@/components/ui/icon';

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  return (
    <Button
      variant="glass"
      size="icon"
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
```

---

### Form Actions

```tsx
import { Button } from '@/components/ui/button';

export function FormActions() {
  return (
    <div className="flex gap-3">
      <Button variant="secondary" size="default">
        Cancel
      </Button>
      <Button variant="primary" size="default">
        Save Changes
      </Button>
      <Button variant="destructive" size="default">
        Delete
      </Button>
    </div>
  );
}
```

---

### Loading States

```tsx
import { Button } from '@/components/ui/button';
import { Loader2 } from '@/components/ui/icon';

export function AsyncButton() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={isLoading} aria-busy={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        'Submit'
      )}
    </Button>
  );
}
```

---

## Design Principles

### 1. **Soft Shadows**

All buttons use soft, subtle shadows that increase on hover for tactile feedback.

```css
shadow-[0_18px_50px_rgba(15,23,42,0.18)]
hover:shadow-[0_20px_60px_rgba(15,23,42,0.22)]
```

### 2. **Rounded Corners**

Consistent 28px border radius (rounded-[1.75rem]) for modern SaaS aesthetic.

### 3. **Semantic Sizing**

Sizes follow a consistent scale: 8px → 9px → 11px → 12px for predictable spacing.

### 4. **Dark Mode First**

Every variant has explicit dark mode support with `dark:` prefixes.

### 5. **Focus Accessibility**

Focus ring uses violet (`.500`) with proper offset and ring opacity for visibility.

### 6. **Disabled States**

Disabled buttons reduce opacity to 60% and remove interactive shadows.

### 7. **Loading States**

Use `aria-busy="true"` with spinner icon and loading text for semantic HTML.

---

## Tailwind Classes Reference

### Base Classes (All Buttons)

```
group/button inline-flex shrink-0 items-center justify-center gap-2
rounded-[1.75rem] border border-transparent bg-clip-padding
font-semibold tracking-tight transition-all duration-200
outline-none select-none focus-visible:ring-2 focus-visible:ring-violet-500/60
disabled:opacity-60 disabled:shadow-none [&_svg]:shrink-0
```

### Variant Classes

- **default**: `bg-slate-950 text-white shadow-[...]`
- **primary**: `bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500`
- **secondary**: `bg-slate-100 text-slate-950 border border-slate-200`
- **ghost**: `bg-transparent text-slate-700 hover:bg-slate-100/70`
- **glass**: `bg-white/80 backdrop-blur-xl border border-white/40`
- **social**: `bg-white/90 border border-slate-200 shadow-sm`
- **gradient**: `bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600`
- **outline**: `border border-slate-200 hover:bg-slate-50/70`
- **destructive**: `bg-rose-500 text-white`
- **link**: `text-violet-500 underline-offset-4 hover:underline`

---

## Best Practices

✅ **Do**

- Use `variant="primary"` for main CTAs
- Use `variant="ghost"` for inline/secondary actions
- Use `variant="glass"` for premium UI elements
- Provide `aria-busy="true"` for async buttons
- Use `aria-label` for icon-only buttons
- Keep loading text short and descriptive

❌ **Don't**

- Overuse gradient variant (use sparingly for emphasis)
- Add unnecessary classNames that conflict with CVA
- Use multiple variants together (pick one)
- Forget to set `disabled` on loading buttons
- Mix motion animations (buttons have internal transitions)

---

## Accessibility

All buttons include:

- ✅ Focus-visible ring with proper contrast
- ✅ Disabled state with `disabled` attribute
- ✅ Loading state with `aria-busy="true"`
- ✅ Icon-only buttons with `aria-label`
- ✅ Semantic HTML with proper `type` attributes
- ✅ Keyboard navigation support

---

## Performance

- CVA generates classes at build time (zero runtime cost)
- No dynamic class generation
- Tailwind CSS v4 ensures minimal bundle size
- Shadow transitions use CSS, not JavaScript
- Icon animations use CSS transforms

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Contributing

To add new variants:

1. Add variant to `buttonVariants` CVA in `src/components/ui/button.tsx`
2. Include explicit dark mode support with `dark:` prefixes
3. Test focus, hover, active, and disabled states
4. Update this documentation with usage example
5. Run `pnpm lint` and `npx tsc --noEmit`

---

Generated: May 7, 2026  
Version: 1.0 (Production-Ready)
