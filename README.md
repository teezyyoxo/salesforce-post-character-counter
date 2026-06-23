# Salesforce Post Character Counter
Lightweight Chrome extension that injects a configurable character counter into Salesforce "Post" WYSIWYG editors. The counter appears near the editor toolbar and updates in real time.
<img width="1712" height="475" alt="bettershot_1782231473911" src="https://github.com/user-attachments/assets/b4f44ce4-fba5-4f26-9d68-61824810f514" />

## Features
- Displays count by default (e.g. 0/10000)
- Optional percentage display (0%)
- Color thresholds (yellow → orange → red) with configurable percents and colors
<img width="509" height="73" alt="bettershot_1782231513983" src="https://github.com/user-attachments/assets/6ae5029c-9c34-4973-b8ec-d86a5b0bd9e0" />
<img width="509" height="71" alt="bettershot_1782231543261" src="https://github.com/user-attachments/assets/e6bd2662-121c-4c52-806d-e265e6aeceec" />
<img width="509" height="115" alt="bettershot_1782231598043" src="https://github.com/user-attachments/assets/8d2ae44e-1e55-413d-9d30-5921575b99d1" />

- Alignment options (left / center / right) via options page
<img width="1172" height="607" alt="bettershot_1782231776244" src="https://github.com/user-attachments/assets/26ea65cf-8a2d-4731-9cab-0c50a020625e" />

- Attempts to detect per-editor maxlength; fallback to configured default limit

## Installation (developer)
1. Clone this repo
2. Open Chrome and go to chrome://extensions
3. Enable "Developer mode"
4. Click "Load unpacked" and select this repository folder

## To update the extension (when applicable)
1. Clone the repo again, or run a `git pull` within the folder.
2. Open Chrome and go to chrome://extensions.
3. Click "Update" at the top left corner of the page, or click the refresh button on the extension's tile.

## Usage
- Open Salesforce where you compose a Post. The counter will appear near the editor toolbar.
- Open Options (right-click extension → Options or open chrome://extensions → Details → Extension options) to set limit, alignment, percentage mode, and colors.

## Developer notes
- Content script uses heuristics to find contenteditable areas and nearby toolbar elements. If the extension can't locate the right spot for your Salesforce layout, use the options to set a sensible limit and try reloading the page.
- Feel free to file any bugs or problems as an Issue and I will get to it... eventually.

## Files
- `manifest.json` — extension manifest
- `content-script.js` — logic that detects editors and injects counter
- `options.html`, `options.js`, `options.css` — settings UI stored in `chrome.storage.sync`

## License
MIT

## Roadmap

Planned enhancements and longer-term tasks.
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
- Recent work completed: detection heuristics, host presets loading, options UI overhaul (live preview, color swatches, dark mode), and locking behavior when a preset is detected (although for Salesforce, at the time of writing, it is currently preset at 10,000 characters)
- Remaining priority work: add tests (TD-001d) and expand the host presets list (TD-002).

## Test harness (developers only)

- A minimal test harness is included at `test/find_limit_test.html` to validate `findLimit()` detection logic against common DOM scenarios.
- To run locally, open the file in your browser (e.g., `open test/find_limit_test.html` on macOS) and click "Run detection" — results will print in the Results pane.
- The test page contains examples for: `data-limit`, `maxlength`, nearby `textarea[maxlength]`, and a no-hint fallback.
