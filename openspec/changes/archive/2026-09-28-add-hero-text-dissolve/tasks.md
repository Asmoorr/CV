# Tasks

Уточнение после первоначальной реализации: направление изменено на положительный Z (вылет к зрителю). CTA, статус, город и оба круга включены как целые элементы. Это заменяет исходные указания negative Z/retreat ниже; entry transition и семантика ссылок сохранены.

## 1. Hero structure and semantic word layer

- [x] 1.1 Create a small client-side Hero text component that tokenizes localized greeting, name, role, and summary into stable inline-block words while preserving spaces, punctuation, server-rendered text, and accessible names; verify with TypeScript and RU/EN DOM assertions.
- [x] 1.2 Integrate the word layer into `Hero.tsx` without converting the whole Hero to a client component, keep CTA and metadata outside word-level transforms, and preserve the existing entry-state contract; verify entry overlay tests and keyboard navigation remain green.
- [x] 1.3 Restructure Hero layout into an extended scroll range with a one-viewport sticky-stage, keep `HeroField` sized to the visual stage, and move clipping away from the structural sticky container; verify no horizontal overflow and stable section geometry at desktop, tablet, and mobile sizes.

## 2. Scroll-linked retreat motion

- [x] 2.1 Add deterministic per-word retreat profiles and perspective styling with negative Z, bounded X/Y offsets, `rotateX`, opacity, and responsive mobile limits; verify repeated renders produce identical profiles and the initial no-motion state is fully readable.
- [x] 2.2 Connect Hero progress to the existing Lenis `useLenis` callback, update only transform/opacity refs without React state or a second animation loop, and clamp progress at both Hero boundaries; verify the effect follows wheel/trackpad scroll and does not change the scroll target.
- [x] 2.3 Keep entry transition, Hero dissolve, CTA interaction, and metadata visibility separate; block dissolve while the entry layer is loading/opening and preserve focusable CTA behavior throughout the active Hero range; verify entry, reverse-scroll, focus, and direction-change scenarios.
- [x] 2.4 Implement live `prefers-reduced-motion` handling so the Hero immediately returns to a static visible state and does not apply 3D movement; verify reduced-motion behavior in browser tests for both locales.

## 3. Motion verification and regression coverage

- [x] 3.1 Extend Playwright behavior coverage for Hero progress at top, middle, and bottom positions, reverse scrolling, entry lock, reduced motion, RU/EN content, and document-width constraints; verify the new scenarios pass with the production server.
- [x] 3.2 Add or update visual snapshots for deterministic Hero states across desktop, tablet, and mobile viewports, including the midpoint retreat composition; verify snapshots remain stable across repeated test runs.
- [x] 3.3 Run the complete typecheck, lint, unit, production build, and visual test commands; verify existing Lenis, entry overlay, navigation, and section reveal behavior has no regressions.
