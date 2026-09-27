# Tasks

## 1. Lenis dependency and root integration

- [x] 1.1 Add and pin the compatible stable `lenis` dependency, update the lockfile, and include the recommended Lenis CSS in the global style layer; verify package installation and stylesheet resolution.
- [x] 1.2 Add one persistent root integration in the locale layout using `ReactLenis` and automatic RAF; verify the instance initializes once across `/ru` and `/en` navigation and does not introduce a page wrapper or custom scrollbar.
- [x] 1.3 Configure wheel smoothing, native touch behavior, reduced-motion handling, and public filtering for pinch-to-zoom and horizontal-dominant gestures; verify these inputs remain native and small trackpad deltas remain proportional in Playwright.

## 2. Entry overlay and nested scrolling

- [x] 2.1 Connect the Lenis lifecycle to `EntryExperience`; keep the engine stopped through `loading`, `ready`, and `opening`, then start it for `entered` and `bypassed`; verify initial session, returning session, and blocked wheel input while the overlay is active.
- [x] 2.2 Mark only the open mobile navigation panel as a nested scroll region and preserve its native overflow behavior; verify wheel input scrolls the panel when it can move and does not make the underlying document move, while input outside the panel still scrolls the page.

## 3. Anchors and programmatic navigation

- [x] 3.1 Enable fragment navigation through the shared Lenis instance and retain a single fixed-header offset source; verify `#main`, section anchors, `#top`, skip-link focus, and target placement below the header without double offset.
- [x] 3.2 Migrate `BackToTop` to the shared Lenis API, preserving smooth motion, the `#top` URL, and focus transfer to `#main`; verify the reduced-motion path jumps immediately without scrolling again on focus.
- [x] 3.3 Migrate `LocaleTransition` and `EntryExperience` to distinct immediate top-reset commands through the shared instance; remove `smooth-scroll:reset` dispatches and verify entry remains locked until complete, while locale changes from top/down/stale-hash end at `scrollY === 0` without residual motion.

## 4. Remove the previous controller and verify integration

- [x] 4.1 Remove the manual wheel controller, its mount from the page, old `data-smooth-scroll*` state, and `.is-wheel-scrolling` CSS; verify only one wheel-smoothing mechanism remains and no runtime caller dispatches `smooth-scroll:reset`.
- [x] 4.2 Replace Playwright assertions on private controller state with checks of actual scroll position and settled behavior; verify wheel, small trackpad-like deltas, direction reversal, document boundaries, horizontal/zoom gestures, nested menu scroll, anchors, entry overlay, `BackToTop`, locale transitions, keyboard focus, and reduced-motion.
- [x] 4.3 Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and the relevant Playwright suite; resolve any RU/EN or desktop/mobile regressions.
