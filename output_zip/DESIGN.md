---
name: Monolith Infrastructure
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b22'
  on-surface-variant: '#464555'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#474949'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f6060'
  on-tertiary-container: '#dbdbdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1ec'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  mono-code:
    fontFamily: jetbrainsMono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 80px
  gutter: 24px
  container-max: 1280px
---

## Brand & Style

The design system is engineered for premium developer infrastructure, emphasizing high performance, technical precision, and absolute reliability. It adopts a **Corporate Modern** aesthetic influenced by the clarity of Apple Keynote and the functional density of high-end developer tools. 

The visual narrative is centered on "Product-Focused Sophistication." By utilizing generous whitespace and a restricted color palette, the system directs all user attention toward technical content and performance metrics. The experience should feel like a high-end physical instrument: precise, responsive, and durable.

**Design Principles:**
- **Clarity over Decoration:** Every line and shadow must serve a functional purpose in establishing hierarchy.
- **Precision Engineering:** Use of thin 1px borders and tight tracking to simulate the feel of a calibrated interface.
- **Intentional Friction:** High-contrast interactions that provide clear feedback for critical developer workflows.

## Colors

The palette is strictly monochromatic to maintain a professional, low-noise environment, punctuated by a single "Indigo" accent for high-intent actions.

- **Backgrounds:** The primary canvas is `#FAFAFA`, providing a subtle warmth that reduces eye strain compared to pure white while maintaining a premium "gallery" feel.
- **Accents:** `#4F46E5` (Indigo) is reserved exclusively for primary calls-to-action, active states, and success indicators.
- **Surface & Borders:** Tonal grays are used for structural elements. Borders should maintain a consistent `#E4E4E7` (Zinc-200) in light mode to remain unobtrusive but defining.
- **Typography:** Use `#09090B` for headings to ensure maximum contrast and `#52525B` for secondary text.

## Typography

This design system utilizes a tiered typography strategy to balance editorial impact with technical utility. 

**Headline Logic:** Geist is used for all headlines and labels. It features a tight tracking (`-0.04em` to `-0.02em`) to create a "locked-in," authoritative look. Headlines should be set with minimal line heights to emphasize the geometric structure of the glyphs.

**Body Logic:** Inter is the workhorse for all prose and data. It provides exceptional legibility at small sizes. For technical snippets, logs, and CLI outputs, JetBrains Mono is the secondary typeface to ensure character distinction (e.g., `0` vs `O`).

**Scale:** Large display sizes must scale down aggressively for mobile (reducing by approx. 30%) to maintain the "high-performance" density without breaking layout flow.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid Grid**. Content is housed in a centered container with a maximum width of 1280px. 

**Grid System:**
- **Desktop:** 12-column grid with 24px gutters.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

**Rhythm:**
A strict 4px baseline grid governs all vertical spacing. Components should use `16px` (md) for internal padding and `24px` (lg) for section spacing. Generous whitespace (`80px+`) is encouraged between major landing page sections to mirror the "Keynote" aesthetic of focused, singular ideas.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Subtle Ambient Shadows** rather than heavy color fills.

1.  **Level 0 (Base):** `#FAFAFA` - The primary background.
2.  **Level 1 (Cards/Sections):** White (`#FFFFFF`) with a 1px border (`#E4E4E7`).
3.  **Level 2 (Dropdowns/Popovers):** White surface with a "Soft Ambient" shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`.
4.  **Level 3 (Overlays/Modals):** Glassmorphism. A semi-transparent white surface (`rgba(255, 255, 255, 0.8)`) with a `20px` backdrop-blur filter. This is reserved strictly for high-level UI overlays to maintain context of the underlying data.

**Borders:** Use 1px solid strokes for all interactive containers. Avoid thick borders or heavy shadows which can clutter technical views.

## Shapes

The shape language is **Soft and Professional**. It avoids the playfulness of fully rounded "pill" shapes in favor of a structured, architectural feel.

- **Small Components:** Checkboxes, tags, and small buttons use a `4px` (0.25rem) radius.
- **Standard Components:** Cards, input fields, and primary buttons use an `8px` (0.5rem) radius.
- **Large Containers:** Modals and large dashboard panels use a `12px` (0.75rem) radius.

This progression ensures that smaller elements feel precise, while larger containers feel approachable and integrated into the OS environment.

## Components

**Buttons:**
- **Primary:** Solid Indigo (`#4F46E5`) with White text. No gradients. On hover, darken by 5%.
- **Secondary:** White background with 1px Zinc-200 border. Black text.
- **Tertiary/Ghost:** No background or border. Indigo text for actions, Zinc-500 for secondary navigation.

**Inputs:**
- Fields must use a `16px` height-equivalent padding. Background should be pure White to pop against the `#FAFAFA` canvas. Focus states should use a 1px Indigo border and a soft 3px Indigo outer glow (low opacity).

**Cards:**
- White background, 1px border. No shadow by default. On hover (if interactive), apply the Level 2 Soft Ambient shadow to indicate lift.

**Chips/Tags:**
- Subtle Gray backgrounds (`#F4F4F5`) with `body-sm` typography. Used for metadata like "v1.2.0" or "Active."

**Code Blocks:**
- Dark mode exclusively for code blocks: `#09090B` background with JetBrains Mono font. High-contrast syntax highlighting using the Indigo primary color and its variants.

**Nodes/Graphs:**
- To reflect the logo's geometric nature, use 1px lines to connect data points or dashboard widgets, reinforcing the "infrastructure" theme.