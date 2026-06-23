// Content script: injects and updates a character counter for Salesforce Post textboxes
(function () {
  try {
    console.log('sf-char-counter: content script loaded');
    const DEFAULT_LIMIT = 10000;

  const DEFAULT_SETTINGS = {
    limit: DEFAULT_LIMIT,
    alignment: 'right', // 'left' | 'center' | 'right'
    showPercentage: false,
    thresholds: { yellow: 75, orange: 90, red: 100 },
    colors: { default: '#666', yellow: '#f1c40f', orange: '#e67e22', red: '#e74c3c' }
  };

  let settings = Object.assign({}, DEFAULT_SETTINGS);
  let PRESET_LIMITS = [];

  function loadPresets() {
    return new Promise((resolve) => {
      try {
        const url = chrome && chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL('presets.json') : 'presets.json';
        fetch(url).then(r => r.json()).then(data => {
          if (data && Array.isArray(data.presets)) {
            PRESET_LIMITS = data.presets;
          }
          resolve(PRESET_LIMITS);
        }).catch(err => {
          try { console.warn('sf-char-counter: failed to load presets.json', err); } catch (e) {}
          resolve([]);
        });
      } catch (err) {
        try { console.warn('sf-char-counter: loadPresets error', err); } catch (e) {}
        resolve([]);
      }
    });
  }

  function loadSettings() {
    return new Promise((resolve) => {
      if (!chrome || !chrome.storage) {
        resolve(settings);
        return;
      }
      chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
        settings = Object.assign({}, DEFAULT_SETTINGS, items);
        resolve(settings);
      });
    });
  }

  function computeColor(percent) {
    if (percent >= settings.thresholds.red) return settings.colors.red;
    if (percent >= settings.thresholds.orange) return settings.colors.orange;
    if (percent >= settings.thresholds.yellow) return settings.colors.yellow;
    return settings.colors.default;
  }

  function createCounterElement() {
    const el = document.createElement('div');
    el.className = 'sf-post-char-counter';
    el.style.display = 'inline-block';
    el.style.fontSize = '12px';
    el.style.padding = '4px 8px';
    el.style.borderRadius = '4px';
    el.style.color = settings.colors.default;
    el.style.transition = 'color 120ms linear, opacity 120ms linear';
    el.style.opacity = '0.95';
    el.style.userSelect = 'none';
    el.style.cursor = 'default';
    return el;
  }

  function formatCount(count, limit) {
    if (settings.showPercentage && limit > 0) {
      const pct = Math.round((count / limit) * 100);
      return `${pct}%`;
    }
    return `${count}/${limit}`;
  }

  function attachToToolbar(toolbar, editable, limit) {
    if (!toolbar) return null;
    let counter = toolbar.querySelector('.sf-post-char-counter');
    if (!counter) {
      counter = createCounterElement();
      // place to the right of toolbar content
      toolbar.appendChild(counter);
      // alignment
      switch (settings.alignment) {
        case 'left':
          counter.style.marginRight = 'auto';
          break;
        case 'center':
          counter.style.margin = '0 auto';
          break;
        case 'right':
          counter.style.marginLeft = 'auto';
          break;
        default:
          counter.style.marginLeft = '8px';
      }
    }

    function update() {
      const text = (editable && getEditableText(editable)) || '';
      const count = text.length;
      const percent = limit > 0 ? Math.round((count / limit) * 100) : 0;
      counter.textContent = formatCount(count, limit);
      counter.style.color = computeColor(percent);
      if (percent >= settings.thresholds.red) counter.style.fontWeight = '700';
      else counter.style.fontWeight = '400';
    }

    update();
    return { counter, update };
  }

  function getEditableText(el) {
    if (!el) return '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return el.value || '';
    // Normalize contenteditable/Quill content:
    // - strip zero-width and non-printable characters
    // - treat a single empty paragraph (\n or whitespace) as empty
    let text = el.innerText || el.textContent || '';
    // remove zero-width spaces and BOM
    text = text.replace(/\u200B|\uFEFF/g, '');
    // Quill often leaves a lone newline for empty editors
    text = text.replace(/\n/g, '');
    return text.trim();
  }

  function detectToolbarAndEditable() {
    // First try page-specific selectors provided from inspection
    try {
      const toolbarSelector = '#outerContainer > div.slds-form-element.lightningInputRichText.forceChatterMessageBodyInputRichTextEditor > div > div.slds-rich-text-editor__toolbar.slds-shrink-none.slds-rich-text-editor__toolbar_bottom';
      const editableContainerSelector = '#outerContainer > div.slds-form-element.lightningInputRichText.forceChatterMessageBodyInputRichTextEditor > div';
      const toolbarEl = document.querySelector(toolbarSelector);
      const editableParent = document.querySelector(editableContainerSelector);
      if (toolbarEl && editableParent) {
        // prefer the actual ql-editor inside the editableParent
        const editableEl = editableParent.querySelector('.ql-editor') || editableParent.querySelector('[contenteditable="true"]') || editableParent;
        if (editableEl) return { toolbar: toolbarEl, editable: editableEl };
      }
    } catch (err) {
      try { console.warn('sf-char-counter: user selector query failed', err); } catch (e) {}
    }
    // Target Salesforce/Quill editors specifically using observed classes
    const selectors = [
      '.ql-editor[contenteditable="true"][data-placeholder="Share an update..."]',
      '.slds-rich-text-area__content[contenteditable="true"]',
      '.ql-editor[contenteditable="true"]'
    ];
    const editables = Array.from(document.querySelectorAll(selectors.join(',')));
    for (const editable of editables) {
      // prefer a nearby rich-text editor container
      let container = editable.closest('.slds-rich-text-area, .slds-rich-text-editor, .ql-container, section, form');
      if (!container) container = editable.parentElement;
      if (!container) continue;
      // find the toolbar within that container
      const toolbar = container.querySelector('.slds-rich-text-editor__toolbar, .slds-rich-text-editor__toolbar_bottom, [role="toolbar"]');
      if (toolbar) return { toolbar, editable };
      // fallback: look for the nearest toolbar sibling in the parent
      const siblingToolbar = Array.from(container.children).find(n => n && n.getAttribute && (n.getAttribute('role') === 'toolbar' || (n.querySelector && n.querySelector('button'))));
      if (siblingToolbar) return { toolbar: siblingToolbar, editable };
    }
    return null;
  }

  // Try to determine a character limit from the editor or surrounding DOM.
  function findLimit(editable, toolbar) {
    try {
      // 1) check direct maxlength attributes
      const candidates = [];
      if (editable && editable.getAttribute) {
        const m = editable.getAttribute('maxlength') || editable.getAttribute('maxLength');
        if (m) candidates.push(parseInt(m, 10));
        const dm = editable.dataset && (editable.dataset.maxlength || editable.dataset.limit || editable.dataset.maxLength);
        if (dm) candidates.push(parseInt(dm, 10));
      }
      if (toolbar && toolbar.getAttribute) {
        const tm = toolbar.getAttribute('data-maxlength') || toolbar.getAttribute('data-limit');
        if (tm) candidates.push(parseInt(tm, 10));
      }

      // 2) search nearby for inputs/textarea with maxlength
      const nearby = (editable && editable.closest) ? editable.closest('form, section, .slds-rich-text-area, .ql-container') : null;
      if (nearby) {
        const t = nearby.querySelector('textarea[maxlength], input[maxlength]');
        if (t) {
          const attr = t.getAttribute('maxlength');
          if (attr) candidates.push(parseInt(attr, 10));
        }
      }

      // 3) check ARIA or other attributes
      if (editable && editable.getAttribute) {
        const ar = editable.getAttribute('aria-valuemax') || editable.getAttribute('data-aria-max') || editable.getAttribute('data-max');
        if (ar) candidates.push(parseInt(ar, 10));
      }

      // sanitize and pick first sensible candidate
      const valid = candidates.filter(n => Number.isFinite(n) && n > 0);
      if (valid.length) return valid[0];

      // 4) host presets (TD-001a): known limits per host
      const host = location.hostname || '';
      const PRESET_LIMITS = [
        {match: 'salesforce.com', limit: 10000},
        {match: 'force.com', limit: 10000},
        {match: 'lightning.force.com', limit: 10000}
      ];
      for (const p of PRESET_LIMITS) {
        if (host.indexOf(p.match) !== -1) return p.limit;
      }

      return settings.limit || 10000;
    } catch (err) {
      try { console.warn('sf-char-counter: findLimit failed', err); } catch (e) {}
      return settings.limit || 10000;
    }
  }

  function observeAndInject(limit) {
    let attached = null;
    function tryAttach() {
      let found = null;
      try {
        found = detectToolbarAndEditable();
        console.log('sf-char-counter: detectToolbar result', !!found, found && { toolbarTag: found.toolbar && found.toolbar.tagName, editableTag: found.editable && found.editable.tagName });
      } catch (err) {
        try { console.error('sf-char-counter: detectToolbarAndEditable threw', err); } catch (e) {}
      }
      if (found) {
        try {
          if (!(found.toolbar instanceof Element)) throw new Error('toolbar is not an Element');
          if (!(found.editable instanceof Element)) throw new Error('editable is not an Element');
          const computedLimit = findLimit(found.editable, found.toolbar) || limit;
          attached = attachToToolbar(found.toolbar, found.editable, computedLimit);
          if (attached) {
            const events = ['input', 'keyup', 'keydown', 'paste', 'change', 'compositionend'];
            const updater = () => requestAnimationFrame(() => { try { attached.update(); } catch (e) { /* ignore */ } });
            events.forEach(ev => found.editable.addEventListener(ev, updater));
            // also update on focus to reflect placeholder changes
            found.editable.addEventListener('focus', updater);
          }
        } catch (err) {
          try { console.error('sf-char-counter: attach failed', err, 'found=', found); } catch (e) {}
        }
      }
    }

    // Try immediately and also when focus enters editor areas
    tryAttach();
    document.addEventListener('focusin', (e) => {
      try {
        const target = e.target;
        if (target && target.nodeType === Node.ELEMENT_NODE) {
          const el = /** @type {Element} */ (target);
          if (el.matches('.ql-editor[contenteditable="true"], .slds-rich-text-area__content[contenteditable="true"], .ql-editor[contenteditable="true"]')) {
            tryAttach();
          }
        }
      } catch (err) {
        try { console.error('sf-char-counter focusin handler error', err); } catch (e) {}
      }
    });

    // Observe DOM changes to attach when editors are added dynamically
    const mo = new MutationObserver(() => {
      if (!attached) tryAttach();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // Initialize
  Promise.all([loadSettings(), loadPresets()]).then(([s]) => {
    settings = s;
    // Detect limit heuristically: look for maxlength or data-limit on editable
    let limit = settings.limit || DEFAULT_LIMIT;

    // Try to find an editable element with maxlength
    const editableWithMax = document.querySelector('[contenteditable="true"][maxlength], textarea[maxlength], input[maxlength]');
    if (editableWithMax) {
      const attr = editableWithMax.getAttribute('maxlength');
      const parsed = parseInt(attr, 10);
      if (!Number.isNaN(parsed) && parsed > 0) limit = parsed;
    }

    console.log('sf-char-counter: settings loaded', settings, 'using limit', limit);
    observeAndInject(limit);
  });

  // swallow errors to avoid breaking page scripts
} catch (err) {
  try { console.error('sf-char-counter error', err); } catch (e) {}
}

})();
