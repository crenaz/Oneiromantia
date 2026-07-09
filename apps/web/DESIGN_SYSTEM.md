# Oneiromantia Design System

Compiled from `app/globals.css` (`@theme` block), `app/layout.tsx` (font wiring), and a usage
audit of every `className` across `app/` and `components/`. **Reconciled 2026-07-09**: the
`@theme` tokens now match real usage, and components reference named tokens
(`text-mist/60`, `bg-primary`, …) instead of hardcoded bracketed hexes.

Aesthetic in one line: **dark glassmorphic "dream HUD"** — near-black surfaces, frosted glass
panels, violet/cyan glow accents, and dense micro-typography in uppercase mono.

## 1. Color

All tokens live in the `@theme` block of `app/globals.css` and generate Tailwind utilities
(`bg-primary`, `text-aurora-cyan/80`, `from-primary`, …).

### Surfaces

| Token | Value | Role |
|---|---|---|
| `background` | `#09090b` | page background |
| `surface` | `#131315` | panel surface |
| `elevated` | `#1c1b1d` | elevated / hover surface |
| `border` | `rgba(255,255,255,0.05)` | default hairline (used as `border-white/5`) |
| — | `border-white/10` | emphasized border |
| — | `bg-white/5` | subtle fill / hover fill |

### Brand & accent

| Token | Value | Role |
|---|---|---|
| `primary` | `#7c3aed` | primary actions, gradients, glows |
| `primary-container` | `#6d28d9` | gradient end for CTAs |
| `secondary` | `#a78bfa` | ambient orb, soft accents |
| `aurora-cyan` | `#22d3ee` | data/accent highlights, links, glow |
| `dream-pink` | `#ec4899` | tertiary accent, gradient stop |
| `moon-gold` | `#f9bd22` | warnings, "lucidity", star accents |

### Text

| Token / class | Role |
|---|---|
| `text-white` | headings, primary content |
| `text-mist/60` (`mist` = `#ccc3d8`) | body / secondary text |
| `text-mist/40` | captions, labels, deemphasized text |
| `text-lilac` (`#d2bbff`) | soft violet highlight text |
| `text-aurora-cyan` | accent / data values |
| `text-moon-gold` | warning / gold accent text |

### Status

| Token | Value |
|---|---|
| `success` | `#22c55e` (plus decorative terminal green `#3af53a`) |
| `warning` | `#f59e0b` |
| `error` | `#ef4444` (plus soft error text `#ffb4ab`) |

### Intentionally untokenized

One-off decorative values left as raw hexes: the ambient indigo glow family (`#6366f1`,
`#4f46e5` — also baked into the `.glass-card`/`.glow-violet` rgba recipes), the archetype
illustration gradients (`#3b82f6`, `#db2777`, `#d9a312`, …), periwinkle `#adc6ff`, and the
generative-art fallback palette in `GenerativeVisualizer.tsx`
(`['#adc6ff', '#22d3ee', '#6366f1', '#e5e1e4']` — canvas JS, not CSS).

## 2. Typography

Fonts are loaded via `next/font/google` in `app/layout.tsx` and bound to `@theme` variables:

| Family | Token / class | Role |
|---|---|---|
| Inter | `--font-sans` / `font-sans` | default body |
| Space Grotesk | `--font-display` / `font-display` | headings, hero numerals |
| JetBrains Mono | `--font-mono` / `font-mono` | labels, stats, HUD chrome — the signature voice of the UI |

Type scale as actually used (smallest sizes dominate — this is a dense HUD, not an editorial page):

| Class | Typical pairing |
|---|---|
| `text-[9px]` | mono + `uppercase` + `tracking-widest` micro-labels |
| `text-[10px]` | mono labels, badges, table chrome |
| `text-xs` | body-in-panels, buttons |
| `text-sm` | emphasized body |
| `text-lg`–`text-4xl` | display headings (Space Grotesk, often `font-bold`) |

Recurring label recipe: `font-mono text-[10px] uppercase tracking-widest text-mist/40`.

## 3. Shape & spacing

| Element | Radius |
|---|---|
| Pills, badges, avatars, progress bars | `rounded-full` |
| Cards / panels | `rounded-2xl`, `rounded-xl` |
| Buttons, inputs, small tiles | `rounded-lg` |

Spacing rhythm: `gap-2` / `gap-4` for flex rows, `p-4` (compact) / `p-6` (default panel padding),
`space-y-4` / `space-y-6` for vertical stacks. Layout is overwhelmingly flexbox
(`flex items-center justify-between` is the most common composite).

## 4. Effects (defined in `globals.css`)

| Class | Recipe |
|---|---|
| `.glass-panel` | `rgba(8,8,12,0.45)` + `backdrop-blur(24px)` + 1px `white/5` border |
| `.glass-card` | `rgba(10,10,15,0.5)` + `backdrop-blur(16px)` + hover: indigo border `rgba(99,102,241,0.3)` + indigo glow |
| `.glow-violet` | `box-shadow: 0 0 25px rgba(99,102,241,0.2)` (indigo family, deliberately softer than `primary`) |
| `.glow-cyan` | `box-shadow: 0 0 25px rgba(34,211,238,0.2)` |

Ambient background: two huge blurred orbs (`blur-[120px]`/`blur-[150px]`) in `#6366f1/15` and
`#a78bfa/10`, fixed at opposite page corners (`app/page.tsx`).

### Gradients

| Recipe | Role |
|---|---|
| `from-primary to-primary-container` | primary CTA buttons |
| `from-primary to-aurora-cyan` | progress bars / meters |
| `from-primary via-aurora-cyan to-dream-pink` | decorative tri-color rail |
| `from-indigo-500 to-purple-500` | logo mark (indigo family, matches the glows) |

## 5. Motion

| Pattern | Value |
|---|---|
| Standard transition | `transition-colors` / `transition-all` + `duration-300` |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` (in `.glass-card`) |
| Ambient pulse | `.agent-pulse` → `pulse-slow` keyframes, 3s ease-in-out infinite (scale 1→1.05, opacity 0.6→1) |
| Activity indicators | `animate-pulse`, `animate-ping`, `animate-spin` |
| Press feedback | `active:scale-95` |

## 6. Reconciliation log (2026-07-09)

The declared `@theme` and component usage had drifted; reconciled in favor of what the UI
actually rendered (no intended visual changes):

- `primary` `#6366f1` → `#7c3aed`, `primary-container` `#4f46e5` → `#6d28d9` (matches all CTAs).
- `moon-gold` `#FBBF24` → `#f9bd22` (declared value had zero usages).
- Surface ramp `#050508/#08080c/#0a0a0f` → `#09090b/#131315/#1c1b1d` (the ramp components used).
- Added `mist`, `lilac`, `success`, `warning`, `error`; removed unused `deep-purple`.
- Migrated ~380 bracketed hex classes across 15 components to named tokens. Three stragglers
  that used the *old* declared surface hexes (`[#050508]` ×2, `[#08080c]` ×1) were mapped to
  `background`/`surface` — a sub-perceptual darkening of those three spots.
- The indigo glow family (`.glass-card` hover, `.glow-violet`, ambient orbs, logo) was left
  indigo on purpose — it reads as atmosphere, distinct from the violet `primary` of actions.
