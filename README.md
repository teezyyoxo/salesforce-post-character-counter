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
| TD-001 | Detect site character limit | Parse the editor DOM (attributes, maxlength, or site-specific rules) and use the actual per-site limit instead of a broad default. Hardcode known Salesforce limit and fall back to parsing when available. | High | Planned |
| TD-002 | Per-site presets | Maintain a small mapping of site hostnames → editor selectors and limits so the extension works out-of-the-box on multiple sites (Salesforce, internal apps). | Medium | Planned |
| TD-003 | Theming & compact display | Add slimmer, theme-aware styles and an option for compact display (icon-only or small badge). | Low | Planned |

If you'd like, I can break TD-001 into implementation sub-tasks and schedule them into milestones.
