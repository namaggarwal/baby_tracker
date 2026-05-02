---
name: Modern Parent Design System
colors:
  surface: '#f7faf5'
  surface-dim: '#d8dbd6'
  surface-bright: '#f7faf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f0'
  surface-container: '#ecefea'
  surface-container-high: '#e6e9e4'
  surface-container-highest: '#e0e3df'
  on-surface: '#191c1a'
  on-surface-variant: '#424841'
  inverse-surface: '#2d312e'
  inverse-on-surface: '#eff2ed'
  outline: '#737970'
  outline-variant: '#c2c8be'
  surface-tint: '#456646'
  primary: '#436444'
  on-primary: '#ffffff'
  primary-container: '#5b7d5b'
  on-primary-container: '#f7fff2'
  inverse-primary: '#abd0a9'
  secondary: '#61597e'
  on-secondary: '#ffffff'
  secondary-container: '#dfd4ff'
  on-secondary-container: '#625a7f'
  tertiary: '#5d5c55'
  on-tertiary: '#ffffff'
  tertiary-container: '#76746d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c6edc4'
  primary-fixed-dim: '#abd0a9'
  on-primary-fixed: '#012108'
  on-primary-fixed-variant: '#2e4e30'
  secondary-fixed: '#e7deff'
  secondary-fixed-dim: '#cbc1eb'
  on-secondary-fixed: '#1d1637'
  on-secondary-fixed-variant: '#494265'
  tertiary-fixed: '#e6e2d9'
  tertiary-fixed-dim: '#c9c6be'
  on-tertiary-fixed: '#1c1c17'
  on-tertiary-fixed-variant: '#484741'
  background: '#f7faf5'
  on-background: '#191c1a'
  surface-variant: '#e0e3df'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-xl:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
  label-md:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  touch-target-min: 56px
  stack-lg: 32px
  stack-md: 16px
  stack-sm: 8px
---

## Brand & Style
The personality of this design system is nurturing, reliable, and effortless. It is specifically crafted for parents operating in high-stress, low-sleep environments where cognitive clarity and ease of use are paramount. The aesthetic merges **Minimalism** with **Soft UI** elements to create a digital environment that feels safe and calm. 

The UI avoids sharp edges and jarring transitions, instead utilizing gentle curves and a spacious layout to reduce visual noise. Every interaction is designed to be intentional and forgiving, evoking the sensation of a supportive companion rather than a complex tool.

## Colors
The color palette is anchored in a neutral **Warm Cream** (#FDF9F0) to reduce eye strain during late-night usage compared to pure white. 

- **Primary (Sage Green):** Used for growth and health-related indicators.
- **Secondary (Muted Lavender):** Used for sleep and rest-related tracking.
- **Action (Deep Teal):** A high-contrast version of the primary green, reserved specifically for primary buttons and critical interactive elements to ensure WCAG AAA accessibility.
- **Neutral (Charcoal):** A soft dark grey for text to provide high contrast without the harshness of pure black.

## Typography
This design system prioritizes legibility above all else. **Lexend** is employed for body text and labels due to its design roots in reading proficiency, making it ideal for tired eyes. **Plus Jakarta Sans** provides a friendly yet modern character for headlines.

Font sizes are intentionally scaled larger than standard applications. The minimum size for core data entry and reading is 18px to ensure information is digestible at a glance, even from a distance or with one-handed phone operation.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile-first PWA delivery. It utilizes a generous 24px outer margin to keep interactive elements away from the bezel, preventing accidental triggers during one-handed use.

The spacing rhythm is built on an 8px base unit. Vertical rhythm is relaxed, with ample "white space" (rendered in Warm Cream) between cards and sections to prevent the interface from feeling cluttered. All primary tap targets are centralized or placed in the "lower-third" thumb zone.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and tonal layering. This design system avoids harsh drop shadows, instead using large-radius, low-opacity (8-12%) shadows tinted with the primary sage or lavender colors.

- **Level 0 (Surface):** The Warm Cream background.
- **Level 1 (Cards):** Raised with a subtle 16px blur shadow to indicate interactivity.
- **Level 2 (Active Modals/Buttons):** Higher elevation with a 32px blur shadow to draw immediate focus.
- **Glassmorphism:** Used sparingly for sticky navigation bars at the bottom of the screen, using a backdrop blur (12px) to maintain context of the content behind it.

## Shapes
The shape language is defined by **Pill-shaped** aesthetics. High corner radii communicate safety and friendliness. 

- **Standard Elements:** 16px (1rem) radius.
- **Buttons & Chips:** Fully rounded (pill) edges.
- **Cards:** 24px (1.5rem) or 32px (2rem) radius depending on the container size.
- **Selection Indicators:** Use soft, blob-like organic shapes rather than perfect circles to maintain a hand-crafted, approachable feel.

## Components

### Buttons
Primary action buttons are **Extra-Large (56px height)** with full-width spans where possible. They use the high-contrast Action Color with white or cream text. Secondary buttons use a thick 2px stroke or a soft tinted background.

### Cards & Trackers
Cards are the primary container for data. Each card should feature a large line icon and a bold "Last activity" timestamp. Use Lavender for "Sleep" cards, Sage for "Feeding," and Cream for "Diaper."

### Chips
Used for quick tagging (e.g., "Left side," "Right side," "Bottle"). Chips are pill-shaped, using a 48px height to remain easily tappable.

### Form Inputs
Inputs use large text and floating labels. The hit area for checkboxes and radio buttons is expanded to include the entire row, preventing the need for precise tapping.

### Iconography
Icons must be simple, consistent weight (2px stroke), and non-abstract. 
- **Feeding:** A stylized bottle or breast icon.
- **Sleep:** A crescent moon with a soft "Z."
- **Diaper:** A simplified diaper outline.
- **Bath:** A droplet or small tub icon.

### Quick-Action FAB
A large, floating "Plus" button is anchored to the bottom-right or bottom-center, providing immediate access to the four primary tracking categories via a radial or pop-up menu.