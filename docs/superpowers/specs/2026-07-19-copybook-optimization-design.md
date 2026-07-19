# 2026-07-19 Copybook Generator Optimization Design

## Goal
Optimize the existing static copybook generator site for UI clarity, mobile usability, print quality, and export stability, while keeping all current features and offline usage intact.

## Scope
- Improve layout and information hierarchy in the control panel and preview area.
- Improve mobile layout, touch usability, and preview visibility.
- Improve print output and PDF export reliability.
- Improve state feedback for page count, capacity, and validation.

## Out of Scope
- Backend services or cloud storage.
- New font licensing or remote font hosting.
- Major third-party dependency upgrades beyond what is needed for export quality.

## Architecture
- Keep the current static frontend structure with `index.html` and modular JS modules under `js/`.
- Move UI composition responsibility into clearer render groupings inside `app.js`.
- Extract repeated panel and preview behaviors into small reusable render helpers.
- Keep existing data functions in `js/content.js`, `js/grid.js`, `js/features.js`, `js/export.js`, and `js/utils.js`, but tighten their internal reuse from `app.js`.

## Desktop Layout
- Use a side-by-side layout with a fixed-width left control panel and a scrollable right preview area.
- Control panel width should be stable and not cause preview reflow on minor changes.
- Group controls by user intent:
  - quick setup: mode, template, grid, colors, export
  - content: text input, random chars, mode-specific controls
  - style: stroke level, guide, preset styles, stroke width
  - layout: paper, rows, cols, cell size, font size, gaps, margins, header, tail fill
- Add collapsible advanced sections for low-frequency controls.
- Preserve scroll position in preview when settings change.

## Mobile Layout
- Switch to a vertical layout with preview-first presentation.
- Provide a collapsible settings panel so users can quickly toggle controls without losing preview context.
- Keep export actions accessible without excessive scrolling.
- Avoid horizontal overflow in the preview and control panel on small screens.

## Preview Experience
- Show live feedback including:
  - total pages
  - used cells versus total capacity
  - warnings for very large outputs
- Maintain readable page preview sizing for common phone and tablet widths.
- Keep existing grid rendering logic, but ensure preview scaling is predictable across screen sizes.

## Print Behavior
- Add dedicated print styles that:
  - hide controls, preview chrome, and non-print UI
  - remove preview shadows and scaling transforms
  - preserve headers and pagination behavior
- Ensure print preview matches exported output as closely as possible.

## Export Behavior
- Prefer a more stable export path over the current html2pdf single-step flow.
- Recommended approach:
  - render each `.page` into high-quality images
  - combine into a single PDF with correct page dimensions
- Keep a fallback for environments where image-to-PDF libraries are unavailable.
- Maintain existing filenames and expected PDF page size behavior for A4/A5 portrait/landscape.

## Validation and Feedback
- Keep existing validation, but surface errors closer to the relevant control.
- Disable export actions only when input is invalid or pages are empty.
- Show clearer guidance when fonts or grid presets change behavior unexpectedly.

## Accessibility
- Preserve Chinese labels and accessible structure.
- Ensure new collapsible sections and mobile controls remain keyboard reachable and screen-reader friendly.

## Testing
- Add or update browser-level checks in `tests.html` for:
  - pagination behavior for multi-sentence and article modes
  - preview page count and capacity warnings
  - print style visibility rules
- Keep tests lightweight and runnable without a backend.

## Implementation Order
1. Layout and grouping refactor in the UI
2. Mobile responsiveness and print styles
3. Export pipeline improvement
4. Validation, feedback, and test updates

## Risks and Mitigations
- Large `app.js` edits may introduce regressions: mitigate by keeping behavior changes small and reviewing pagination and export paths first.
- Browser print variance remains possible: mitigate by testing in Chrome/Edge and simplifying print CSS.
- External screenshot/PDF libraries may differ by environment: mitigate with a graceful fallback export path.
