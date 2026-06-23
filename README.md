# Salesforce Post Character Counter

Lightweight Chrome extension that injects a configurable character counter into Salesforce "Post" WYSIWYG editors. The counter appears near the editor toolbar and updates in real time.

Features
- Displays count by default (e.g. 0/10000)
- Optional percentage display (0%)
- Color thresholds (yellow → orange → red) with configurable percents and colors
- Alignment options (far left / center / far right)
- Attempts to detect per-editor maxlength; fallback to configured default limit

Installation (developer)
1. Open Chrome and go to chrome://extensions
2. Enable "Developer mode"
3. Click "Load unpacked" and select this repository folder

Usage
- Open Salesforce where you compose a Post. The counter will appear near the editor toolbar.
- Open Options (right-click extension → Options or open chrome://extensions → Details → Extension options) to set limit, alignment, percentage mode, and colors.

Developer notes
- Content script uses heuristics to find contenteditable areas and nearby toolbar elements. If the extension can't locate the right spot for your Salesforce layout, use the options to set a sensible limit and try reloading the page.

Files
- `manifest.json` — extension manifest
- `content-script.js` — logic that detects editors and injects counter
- `options.html`, `options.js`, `options.css` — settings UI stored in `chrome.storage.sync`

License
MIT

## Roadmap

Planned enhancements and longer-term tasks. Each item has a simple identifier (TD-xxx) for tracking.
| ID | Title | Description | Priority | Status |
|---:|:------|:------------|:--------:|:------|
| TD-001 | Detect site character limit (umbrella) | Ensure the extension detects the actual per-site editor limit instead of relying only on a global default. Broken into subtasks below. | High | In progress |
| TD-001a | Gather known Salesforce limit | Record and document known limits for Salesforce/Lightning editors and cluster-host patterns. | High | Completed |
| TD-001b | DOM parsing for maxlength/attributes | Parse editor, toolbar, and nearby inputs for maxlength, data-* attributes, ARIA values and other hints. | High | Completed |
| TD-001c | Host presets mapping | Provide a small `presets.json` mapping hostnames → selectors → limits and load it at runtime. | High | Completed |
| TD-001e | Lock limit when preset detected | When a host preset is detected, mark the option as locked and surface the preset source in Options UI. | Medium | Completed |
| TD-001d | Tests & verification harness | Add unit tests and a small verification page/harness to validate `findLimit()` across example DOM snippets. | High | Planned |

| TD-002 | Per-site presets (extend) | Expand `presets.json` with additional hosts and provide an import/export UI for site presets. | Medium | Planned |
| TD-003 | Theming & options UI polish | Finish dark-mode support, color swatches, live preview, and compact display options in the Options page. | Low | Mostly completed |

Notes:
- Recent work completed: detection heuristics, host presets loading, Options UI overhaul (live preview, color swatches, dark mode), and locking behavior when a preset is detected.
- Remaining priority work: add tests (TD-001d) and expand the host presets list (TD-002).
