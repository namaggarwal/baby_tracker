# Product Requirements Document (PRD): BabyTrack PWA

## Product Name
BabyTrack PWA (working title)

## Objective
Build a lightweight Progressive Web App (PWA) to track baby activities (feeding, nappies, sleep, bath, etc.) with:
- Fast one-tap logging
- Offline-first functionality
- Automatic sync to Google Sheets when online
- Simple visualization for patterns

## Target Users
- Primary: Parents
- Secondary: Caregivers

## Core Use Cases
- Log feeding quickly (breast/formula)
- Track diaper changes (wet/dirty)
- Track sleep and wake times
- Track bath events
- View daily summary
- Sync data across devices
- Work fully offline

## Key Features
1. **Quick Log Dashboard (Home Screen)**: Single-tap logging with actions for Feed, Potty, Wet diaper, Bath, Sleep start/wake. Needs haptic/toast feedback.
2. **Feeding Module**: Inputs for Breast milk (Size S/M/L/XL) or Formula (Quantity in ml).
3. **Diaper Tracking**: Wet or Dirty (potty).
4. **Sleep Tracking**: Start/End sleep with auto-duration.
5. **Bath Tracking**: Simple event log.
6. **Timeline View**: Chronological list of all events, filtered by type/date, and editable.
7. **Daily Summary**: Totals for feeds, formula, diapers, and sleep duration.
8. **Settings**: Baby name, default feed size, units (ml), sync status, manual sync.

## UI/UX Requirements
- **One-hand usage**: Designed for parents who might be holding a baby.
- **Minimal taps**: ≤2 taps per log.
- **Large buttons**: Sleep-deprived friendly.
- **Color Palette**: Gentle, calming tones.
- **Accessibility**: High contrast for readability during night feeds.

## Tech Stack (Recommended)
- React + Vite (PWA mode)
- Service Worker (Workbox)
- IndexedDB (Dexie.js)
- Google Apps Script (as API layer for Google Sheets)