# Accessibility

Accessibility is the point of this project, not a checklist added at the
end. This document maps every accessibility feature to the WCAG 2.1
success criterion it addresses, and to where it lives in the code.

## Keyboard navigation

- Every interactive control (tabs, buttons, sliders, checkboxes, selects,
  text inputs) is a native HTML element (`<button>`, `<input>`,
  `<select>`), so it is focusable and operable by keyboard by default, with
  no custom `tabindex`/`role` gymnastics needed.
  → WCAG 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value).
- Sentence editing has keyboard shortcuts in addition to on-screen buttons:
  `Backspace` deletes the last character, `Shift+Backspace` clears the
  whole sentence, `Space` appends a space. Implemented in
  `frontend/src/components/Umusho.jsx`, guarded so the shortcuts don't fire
  while focus is inside a text input/select/button (to avoid double-firing
  or breaking normal typing/activation elsewhere in the app).
  → WCAG 2.1.1 (Keyboard), 2.1.4 (Character Key Shortcuts) -- single-character
  shortcuts (`Space`) require no modifier only where they can't conflict
  with assistive-technology input, and the app doesn't rely on
  single-character shortcuts as the *only* way to trigger an action (every
  shortcut has an equivalent on-screen button).
- Visible focus outlines are enforced globally (`:focus-visible` in
  `frontend/src/index.css`) rather than suppressed, and use a
  high-contrast accent color with an offset so the focus ring is never
  clipped by a control's own border.
  → WCAG 2.4.7 (Focus Visible).

## Semantic structure and ARIA

- Mode switching (Translate / Practice / Teach a sign / Settings) uses the
  ARIA tabs pattern (`role="tablist"`/`"tab"`/`"tabpanel"`,
  `aria-selected`, `aria-controls`) in `frontend/src/App.jsx`, so screen
  reader users get the same "which mode am I in, what are my options"
  structure sighted users get from the tab bar.
  → WCAG 4.1.2 (Name, Role, Value), 1.3.1 (Info and Relationships).
- The sentence display uses `role="textbox"` with `aria-readonly="true"`
  and an explicit `aria-label`, so it's announced as the editable-looking
  content region it visually represents, not silently skipped.
  → WCAG 4.1.2, 1.3.1.
- Status/error banners use `role="alert"` for errors (camera denied,
  camera unavailable, hand-tracking failure) and `role="status"` for
  non-urgent info (connecting, no hand detected yet), so assistive
  technology announces errors immediately without needing focus to move
  there. Implemented in `frontend/src/components/IsimoIbhena.jsx`.
  → WCAG 4.1.3 (Status Messages).
- A dedicated visually-hidden live region (`frontend/src/components/Isimemezelo.jsx`,
  `aria-live="polite"`) announces every letter typed, space added,
  backspace, sentence cleared, and "speaking: ..." event -- the exact set
  of state changes the prompt requires to be announced -- without
  interrupting whatever the screen reader is currently reading.
  → WCAG 4.1.3 (Status Messages).
- Practice Mode's "Correct!" feedback is inside an `aria-live="polite"`
  region (`frontend/src/components/Ukuzijwayeza.jsx`) so streak progress is
  announced without requiring the user to look at the screen.
  → WCAG 4.1.3.

## Color and contrast

- No status is conveyed by color alone: every status banner pairs its
  color with a text glyph (`[!]` for errors, `[i]` for info, `[+]` for
  success) and a full sentence of text, and every letter's correctness in
  Practice Mode is stated in words ("Correct!"), not just a green
  highlight.
  → WCAG 1.4.1 (Use of Color).
- The default theme uses light text on a dark background with a
  contrast ratio comfortably above the WCAG AA minimum (4.5:1 for body
  text).
  → WCAG 1.4.3 (Contrast, Minimum).
- A **High-contrast theme** toggle (Settings → "High-contrast theme") swaps
  the entire palette to pure black/white/near-pure accent colors, targeting
  WCAG AAA's stricter 7:1 contrast ratio for body text.
  Implemented as a `data-umehluko="ophezulu"` attribute on `<html>`
  (`frontend/src/App.jsx`) driving CSS custom-property overrides in
  `frontend/src/index.css`. Button, input, and select surface colors use
  dedicated `--uxhumano-inkinobho-*` variables kept independent from the
  border/divider color, specifically so a theme swap can never collapse a
  control's background and text onto the same value and make the label
  unreadable.
  → WCAG 1.4.6 (Contrast, Enhanced -- AAA).

## Motion

- A **Reduced motion** toggle (Settings → "Reduced motion") sets
  `data-ukunyakaza="ncipha"` on `<html>`, which collapses all CSS
  animation/transition durations to near-zero
  (`frontend/src/index.css`). This is a user-facing toggle in addition to
  (not a replacement for) respecting the OS-level
  `prefers-reduced-motion` media query, since some users want to opt into
  reduced motion per-app rather than system-wide.
  → WCAG 2.3.3 (Animation from Interactions).

## Adjustable everything

Every value in the Settings panel (`frontend/src/components/Izilungiselelo.jsx`)
is meant to accommodate a different need, not just a preference:

| Setting | Who it's for |
|---|---|
| Hold duration (frames) | Users with tremor or limited fine motor control can raise it for a more forgiving, deliberate hold; users who sign quickly can lower it to type faster. |
| Confidence threshold | Trade-off between speed (lower) and typos (higher) as camera/lighting conditions vary. |
| Text size | Low-vision users. |
| High-contrast theme | Low-vision users, and anyone in poor lighting. |
| Reduced motion | Users with vestibular disorders or motion sensitivity. |
| Signing hand / mirror view | Left- vs. right-handed signers, and personal preference for how the mirrored camera view matches their own movements. |
| Speech rate + voice | Users who process synthesized speech better slower/faster, or prefer a specific voice. |

Settings persist to `localStorage` (`frontend/src/hooks/useIzilungiselelo.js`)
so they survive a reload -- a user shouldn't have to re-configure
accessibility needs every session.
→ WCAG 1.4.4 (Resize Text), 1.4.8 (Visual Presentation), 2.2.1 (Timing
Adjustable, in spirit -- the hold duration is the app's only inherent
timing requirement, and it's fully user-controlled).

## Graceful degradation

- If camera permission is denied, no camera exists, or hand tracking fails
  to start, a clear `role="alert"` message explains what happened and (for
  permission denial) what to do about it -- the app never silently shows a
  black box. See `frontend/src/hooks/useIkhamera.js` and
  `frontend/src/components/Ikhamera.jsx`.
- If the backend WebSocket is unreachable, hand tracking and the skeleton
  overlay keep working (they never depended on the backend), and a visible
  banner explains that letter recognition specifically is paused and is
  retrying automatically (`frontend/src/hooks/useIxhumanisi.js`,
  reconnect with exponential backoff). Nothing crashes; the app degrades to
  "camera works, translation paused" rather than an unresponsive page.

## Honesty as an accessibility principle

Practice Mode's handshape reference is a plain-English description plus a
simple five-bar "which fingers are curled" indicator
(`frontend/src/components/Ukuzijwayeza.jsx`), not a photo. This was a
deliberate choice: a text description is itself screen-reader accessible
(via the bar chart's `aria-label`), and it avoids implying a level of
photographic/anatomical accuracy the synthetic-data-trained model doesn't
actually have. See the Honest Framing section of the README.
