
# Changelog

## 0.2.0 - Feature: counter in Edit Post dialog
- Detect and attach counters to every Salesforce rich-text editor, including the dynamically opened **Edit Post** dialog.
- Track editor attachments independently so the main post composer no longer prevents modal editors from receiving a counter.
- Bump extension version to `0.2.0`.

## 0.1.0 - Initial draft
- Scaffolded Chrome extension manifest and content script
- Options UI for alignment, limit, percentage, thresholds and colors
- Heuristic editor detection and counter injection

## 0.1.1 - Dev: options UI link + debug/fallback
- Add `options_ui` to `manifest.json` so Chrome shows the Options link in extension details
- Add debug logging to `content-script.js` for detection diagnostics
- Add a temporary floating counter fallback when a toolbar isn't detected (helps confirm script runs)
- Bump extension version to `0.1.1`

## 0.1.2 - Improve detection for Salesforce editor
- Update `content-script.js` to target Salesforce/Quill editor elements (e.g. `.ql-editor[contenteditable]` and `.slds-rich-text-editor__toolbar`) and attach on focus
- Remove floating fallback (use direct toolbar insertion)
- Bump extension version to `0.1.2`

## 0.1.3 - Fix: guard DOM handlers against non-element targets
- Add element-type checks and try/catch around `focusin` handler to prevent errors when `e.target` is not an Element
- Ensure event listeners are only attached to Element nodes
- Bump extension version to `0.1.3`

## 0.1.4 - Fix: honor specific Salesforce selectors
- Attempt user-provided toolbar and editable selectors first (uses `#outerContainer` selector when present)
- Prefer `.ql-editor` inside the editable container when attaching counter
- More defensive querySelector usage and logging
- Bump extension version to `0.1.4`

## 0.1.5 - Fix: syntax error and top-level try/catch cleanup
- Fix syntax error caused by mismatched try/catch in `content-script.js`
- Wrap IIFE body in single `try { ... } catch (err) { ... }` to avoid parsing errors
- Bump version to `0.1.5`

## 0.1.6 - Fix: accurate initial count and first-character updates
- Normalize editable text (strip zero-width chars and lone newlines) so empty Quill editors report 0 instead of 1
- Use `requestAnimationFrame` to schedule updates after DOM changes so the first character is counted immediately
- Add extra input-related event hooks (`keydown`, `compositionend`) and focus update
- Bump version to `0.1.6`

## 0.1.7 - Feature: limit detection + alignment label fix
- Add `findLimit()` to parse `maxlength`, `data-*` attributes, ARIA attributes, and nearby inputs to detect per-editor limits (TD-001b)
- Add host preset mapping for Salesforce domains (TD-001a) with default limit 10000
- Fix alignment handling so `right` positions the counter on the right
- Rename alignment labels from "Far left/right" to "Left/Right"
- Bump version to `0.1.7`

## 0.1.8 - Feature: host presets (TD-001c)
- Add `presets.json` and load host presets at runtime (via `chrome.runtime.getURL`) to map hostnames to known limits
- Use presets when `findLimit()` cannot find a DOM-provided limit
- Bump version to `0.1.8`

## 0.1.9 - UI: options page refresh
- Overhaul `options.html` with a modern, responsive layout and live preview
- Add styling and instant-update preview via `options.js`
- Bump version to `0.1.9`

## 0.1.10 - Fix: options preview bugs
- Clear preview placeholder on focus and restore on blur
- Update preview counter live while typing and apply threshold color logic
- Bump version to `0.1.10`
- Add a minimal test harness `test/find_limit_test.html` to validate `findLimit()` detection scenarios
- Bump version to `0.1.12`

## 0.1.11 - UI: preview resizing and color swatches
- Add draggable resizer (bottom-left) with enable toggle and reset button for preview area
- Prevent horizontal overflow by wrapping long pasted content in preview
- Show color input swatches on load and update their backgrounds as values change
- Move Live Preview higher on the page for better ergonomics
- Bump version to `0.1.11`

## 0.1.12 - UI: dark mode, preset locking, test harness
- Add dark-mode toggle for Options page and update CSS variables for full coverage
- Remove preview resizer and simplify preview layout (automatic sizing)
- Fix color swatch rendering across browsers and themes
- Implement TD-001e: detect host presets and lock `Character limit` input in Options; persist detection to `chrome.storage.sync`
- Restore consistent preview/settings layout and align preview height with settings panel

## 0.1.13 - Fix: rich-text newline and code block character counting
- Preserve newline characters when counting rich-text editor content so code blocks and multi-line posts match backend submission length.
- Normalize CRLF sequences and avoid undercounting editor text.
- Bump version to `0.1.13`

## 0.1.14 - Patch: restore counter visibility
- Fix counter rendering so the injected toolbar element appears again after the rich-text normalization change.
- Bump version to `0.1.14`

## 0.1.16 - Fix: load presets through the service worker
- Move `presets.json` loading out of the Salesforce content-script page context.
- Return presets through `chrome.runtime.sendMessage` to avoid `Failed to fetch` errors on Force.com `contentDoor` pages.
- Bump version to `0.1.16`

## 0.1.15 - Fix: load runtime presets in content scripts
- Declare `presets.json` as a web-accessible resource for Salesforce and Force.com pages so Chrome content scripts can fetch it successfully.
- Validate the preset fetch response before parsing JSON and retain the existing fallback when loading fails.
- Fix host preset matching to support the `hosts` array used by `presets.json`, while retaining compatibility with the legacy `match` property.
- Bump extension version to `0.1.15`





