# Tasks

## 1. Fix the entry button focus appearance

- [x] 1.1 Separate the `ENTER` hover fill from its keyboard focus indicator; verify the ready button stays visually idle when it receives automatic focus, while keyboard focus remains visible and hover still works.

## 2. Remove the unintended cyan stripe

- [x] 2.1 Reproduce the footer view with text selection active and cleared, inspect the selection range and computed divider styles, and record which element or style paints the cyan stripe: it was the global `:focus-visible` outline on `main`, not text selection or the footer border.
- [x] 2.2 Correct only the confirmed stripe source while preserving ordinary text selection; verify selected text remains legible and no cyan band remains in empty areas or separators after clearing selection.

## 3. Review the combined behavior

- [x] 3.1 Review the entry and footer at desktop and mobile widths, including pointer hover, keyboard focus, and reduced-motion mode; confirm the entry flow and footer layout remain intact. Reduced-motion rules remain unchanged; both fixes add only static focus styling.
