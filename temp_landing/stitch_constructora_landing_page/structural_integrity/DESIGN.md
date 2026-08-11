---
name: Structural Integrity
colors:
  surface: '#fcf9f6'
  surface-dim: '#dcdad7'
  surface-bright: '#fcf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f0'
  surface-container: '#f0edea'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e5e2df'
  on-surface: '#1c1c1a'
  on-surface-variant: '#43474c'
  inverse-surface: '#31302f'
  inverse-on-surface: '#f3f0ed'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4e6073'
  primary: '#162839'
  on-primary: '#ffffff'
  primary-container: '#2c3e50'
  on-primary-container: '#96a9be'
  inverse-primary: '#b5c8df'
  secondary: '#944a00'
  on-secondary: '#ffffff'
  secondary-container: '#fc8f34'
  on-secondary-container: '#663100'
  tertiary: '#1b292a'
  on-tertiary: '#ffffff'
  tertiary-container: '#303f40'
  on-tertiary-container: '#9aaaab'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4fb'
  primary-fixed-dim: '#b5c8df'
  on-primary-fixed: '#091d2e'
  on-primary-fixed-variant: '#36485b'
  secondary-fixed: '#ffdcc5'
  secondary-fixed-dim: '#ffb783'
  on-secondary-fixed: '#301400'
  on-secondary-fixed-variant: '#713700'
  tertiary-fixed: '#d5e6e7'
  tertiary-fixed-dim: '#b9cacb'
  on-tertiary-fixed: '#0f1e1f'
  on-tertiary-fixed-variant: '#3a494a'
  background: '#fcf9f6'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2df'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style
The design system is built for the high-end construction and architectural sector. It balances the raw, physical strength of building materials with the precision of modern engineering. The personality is authoritative, dependable, and meticulously organized.

The aesthetic follows a **Modern/Minimalist** approach with a focus on structural clarity. It utilizes heavy whitespace to evoke a sense of scale and uses "architectural" alignment—where elements feel like they are part of a rigid, intentional grid. The UI should evoke a sense of permanence and trust through clean lines and a sophisticated, earth-toned palette.

## Colors
The palette is grounded in "construction site" materials but elevated for a premium digital experience.

*   **Primary (Deep Slate Blue):** `#2C3E50`. Represents the structural steel and the "blueprint" authority. Used for major headers, primary actions, and brand elements.
*   **Secondary (Burnt Terracotta):** `#E67E22`. Used as a "character" accent for calls-to-action, status indicators, and highlighting craft. It provides warmth against the cooler slate.
*   **Neutral (Off-White/Beige):** `#F8F5F2`. A sophisticated stone-like background color that is softer and more premium than pure white.
*   **Surface (Charcoal):** `#34495E`. Used for text and icons to ensure high legibility and a sense of weight.

## Typography
Typography is used to create a clear hierarchy of information, mimicking the way signage works on a job site—bold, clear, and unmistakable.

**Montserrat** is used for headlines. Its geometric construction feels engineered and stable. Keep tracking tight on larger sizes to maintain a "block" feel.

**Work Sans** is used for all functional and body text. It is highly legible and feels grounded. Use the uppercase `label-md` style for category headers and small navigation elements to reinforce the architectural blueprint aesthetic.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to ensure content feels contained and controlled, mirroring a site plan.

*   **Grid:** 12-column grid for desktop with 24px gutters.
*   **Rhythm:** All vertical spacing must be a multiple of 8px. Use generous padding (64px+) between major sections to emphasize the "clean" and "professional" brand pillars.
*   **Alignment:** Hard-left alignment is preferred for all text blocks to create a strong vertical "axis" in the design.
*   **Mobile:** Scale margins down to 16px. Stack all column content vertically, maintaining 32px of breathing room between distinct modules.

## Elevation & Depth
This design system avoids excessive shadows to maintain a "solid" feel. Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines**.

*   **Tiers:** The base layer is the neutral `#F8F5F2`. Secondary containers (like cards or sidebars) use pure `#FFFFFF` or a light gray `#E5E7E9`.
*   **Borders:** Use subtle 1px borders (`#D5D8DC`) instead of shadows to define areas. This mimics the look of technical drawings.
*   **Active States:** Only use shadows for "Floating Action" elements or modals. These should be sharp, low-diffusion shadows (e.g., `0px 4px 12px rgba(0,0,0,0.1)`) to feel like a physical object resting on a table.

## Shapes
In construction, precision is key. The shape language is primarily **Soft (0.25rem)**.

Avoid fully rounded "pill" shapes as they feel too casual for a professional contractor. The slight rounding on buttons and cards prevents the UI from feeling too hostile or "Brutalist," but keeps the overall silhouette rectangular and structured. 

*   **Large Components:** Large sections or hero images should remain sharp (0px) to frame the screen effectively.
*   **Interactive Elements:** Use the `0.25rem` radius for buttons, input fields, and tags.

## Components
*   **Buttons:** Primary buttons use the `primary_color` (Slate) with white text. They should feel "heavy." Secondary buttons use a 2px border of the primary color.
*   **Input Fields:** Use a solid 1px border. When focused, the border weight increases to 2px in the `primary_color`. Use a light gray background for the field to differentiate from the page background.
*   **Cards:** Pure white background, 1px light border, no shadow. Card titles should use `headline-md`.
*   **Chips/Tags:** Use the `secondary_color` (Terracotta) sparingly for status labels (e.g., "In Progress") to draw the eye.
*   **Lists:** Use dividers (`1px solid #D5D8DC`) between all list items to reinforce the grid-based structure.
*   **Progress Bars:** Important for construction timelines. Use a thick 8px bar with the `secondary_color` for the "filled" state and a light neutral for the "track."