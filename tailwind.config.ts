import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config = {
  // No .dark block exists (or is planned) — this repurposes the slot for the
  // paper/Blueprint toggle so any future `dark:` utility resolves the same
  // way `draft:` does, rather than tracking two separate theme mechanisms.
  darkMode: ['selector', '[data-theme="blueprint"]'],
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        // Indirected through --font-body/--font-heading/--font-ui (defined in
        // globals.css) rather than the raw next/font variables, so a theme can
        // swap the typographic voice without a config change.
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ui)', 'ui-monospace', 'monospace'],
        display: ['var(--font-heading)', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        // Indirected through --fs-* (defined in globals.css), same pattern as
        // fontFamily above — Blueprint overrides just these to compensate for
        // Geist Mono reading larger than the paper-mode pairing at the same
        // declared size, without touching section padding or grid gap.
        'display-xl': ['var(--fs-display-xl)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        'display-l': ['var(--fs-display-l)', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'display-m': ['var(--fs-display-m)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        body: ['var(--fs-body)', { lineHeight: '1.65' }],
        'mono-label': ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.18em' }],
      },
      colors: {
        paper: {
          DEFAULT: 'hsl(var(--paper))',
          2: 'hsl(var(--paper-2))',
          3: 'hsl(var(--paper-3))',
        },
        ink: {
          DEFAULT: 'hsl(var(--ink))',
          dim: 'hsl(var(--ink-dim))',
          mute: 'hsl(var(--ink-mute))',
        },
        signal: 'hsl(var(--signal))',
        steel: 'hsl(var(--steel))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // `draft:tracking-normal` etc. — reads as intent (this is a Blueprint
    // override) rather than `dark:` borrowed for a mode that isn't dark mode.
    plugin(({ addVariant }) => {
      addVariant('draft', '&:is([data-theme="blueprint"] *)');
    }),
  ],
} satisfies Config;

export default config;
