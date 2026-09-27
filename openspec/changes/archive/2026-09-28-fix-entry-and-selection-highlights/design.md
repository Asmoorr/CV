# Design

## Context

See `proposal.md` for motivation and the spec deltas for the observable behavior. The entry component moves focus to `ENTER` when it becomes ready; the button currently applies its hover fill to `:focus-visible` as well. Global `::selection` uses the cyan accent, while footer separators use the subdued `--rule` token, so the screenshot alone does not identify which paint source creates the cyan line.

## Goals / Non-Goals

**Goals:**

- Keep the ready button visually idle on initial focus while retaining a clear keyboard focus indicator.
- Identify the source of the cyan line and correct that source without removing normal text selection.
- Keep changes local to the existing entry and page styling.

**Non-Goals:**

- Change when the entry overlay appears, its focus-management sequence, or its transition behavior.
- Disable text selection across the page or redesign the footer.

## Decisions

### Keep focus styling separate from hover styling

The `ENTER` fill and text-color change will be driven by pointer hover. `:focus-visible` will keep a distinct outline and will not reuse that filled appearance, including when focus is assigned programmatically as the button becomes ready. This preserves keyboard visibility without making the button look pre-activated. Removing automatic focus was considered, but would change the established entry focus flow and is unnecessary to meet the visual requirement.

### Diagnose the cyan line before changing its styling

Reproduce the footer view with and without an active text selection and inspect the rendered selection range and computed separator styles. If selected content paints beyond its text, adjust selection/decorative selection styling narrowly while keeping selectable content intact. If the line is a separator or another element, correct that element's styling instead. A page-wide `user-select: none` rule is excluded because it would prevent useful text selection and could mask the actual source.

### Verify both pointer and keyboard states

Review the ready entry screen at rest, on pointer hover, and with keyboard focus, then check actual text selection and the footer with selection cleared. Keep the existing accent outline, reduced-motion behavior, and footer layout.

## Risks / Trade-offs

- **A global selection rule affects content outside the footer** → Preserve the existing selection behavior for real text and scope any fix to the confirmed source.
- **Removing the fill from `:focus-visible` changes the keyboard appearance** → Keep a high-contrast outline and verify it remains visible against the entry scene.
- **The screenshot may capture a transient browser selection** → Reproduce the line interactively and confirm it disappears or remains after clearing selection before editing styles.

## Migration Plan

No data or dependency migration is needed. The change is reversible through the affected CSS rules; no session state or persisted content changes.
