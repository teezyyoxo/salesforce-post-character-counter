const DEFAULT_SETTINGS = {
  limit: 10000,
  alignment: 'right',
  showPercentage: false,
  thresholds: { yellow: 75, orange: 90, red: 100 },
  colors: { default: '#666666', yellow: '#f1c40f', orange: '#e67e22', red: '#e74c3c' }
};

function by(id){return document.getElementById(id)}

function load() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
    const s = Object.assign({}, DEFAULT_SETTINGS, items);
    by('limit').value = s.limit;
    by('alignment').value = s.alignment;
    by('showPercentage').checked = s.showPercentage;
    by('th-yellow').value = s.thresholds.yellow;
    by('th-orange').value = s.thresholds.orange;
    by('th-red').value = s.thresholds.red;
    by('col-default').value = s.colors.default;
    by('col-yellow').value = s.colors.yellow;
    by('col-orange').value = s.colors.orange;
    by('col-red').value = s.colors.red;
    updatePreviewFromSettings(s);
    // check for detected preset and update UI
    updateDetectedPresetUI();
  });
}

function updateDetectedPresetUI(){
  const notice = by('presetNotice');
  const limitInput = by('limit');
  if (!notice || !limitInput) return;
  chrome.storage.sync.get(['detectedPreset'], (res) => {
    const d = res && res.detectedPreset;
    if (d && d.preset) {
      notice.style.display = 'block';
      notice.textContent = `Using site preset (${d.preset}) — limit locked at ${d.limit}.`; 
      limitInput.disabled = true;
      limitInput.title = 'Locked by detected site preset';
    } else {
      notice.style.display = 'none';
      notice.textContent = '';
      limitInput.disabled = false;
      limitInput.title = '';
    }
  });
}

function save() {
  const s = {
    limit: parseInt(by('limit').value, 10) || DEFAULT_SETTINGS.limit,
    alignment: by('alignment').value,
    showPercentage: by('showPercentage').checked,
    thresholds: {
      yellow: parseInt(by('th-yellow').value,10) || DEFAULT_SETTINGS.thresholds.yellow,
      orange: parseInt(by('th-orange').value,10) || DEFAULT_SETTINGS.thresholds.orange,
      red: parseInt(by('th-red').value,10) || DEFAULT_SETTINGS.thresholds.red
    },
    colors: {
      default: by('col-default').value || DEFAULT_SETTINGS.colors.default,
      yellow: by('col-yellow').value || DEFAULT_SETTINGS.colors.yellow,
      orange: by('col-orange').value || DEFAULT_SETTINGS.colors.orange,
      red: by('col-red').value || DEFAULT_SETTINGS.colors.red
    }
  };
  chrome.storage.sync.set(s, () => {
    const b = by('save');
    b.textContent = 'Saved';
    setTimeout(()=> b.textContent = 'Save', 1200);
    updatePreviewFromSettings(s);
  });
}

function restoreDefaults(){
  chrome.storage.sync.set(DEFAULT_SETTINGS, load);
}

let previewCounter = null;
let previewSettings = null;

function updatePreviewCounter(text) {
  if (!previewCounter || !previewSettings) return;
  const s = previewSettings;
  const count = (text || '').replace(/\u200B|\uFEFF/g, '').replace(/\r\n?/g, '\n').length;
  const pct = s.limit > 0 ? Math.round((count / s.limit) * 100) : 0;
  if (s.showPercentage) previewCounter.textContent = `${pct}%`;
  else previewCounter.textContent = `${count}/${s.limit}`;
  // color logic
  let color = s.colors.default;
  if (pct >= s.thresholds.red) color = s.colors.red;
  else if (pct >= s.thresholds.orange) color = s.colors.orange;
  else if (pct >= s.thresholds.yellow) color = s.colors.yellow;
  previewCounter.style.color = color;
}

function updatePreviewFromSettings(s) {
  previewSettings = s;
  const toolbar = by('toolbarPreview');
  toolbar.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'sf-post-char-counter';
  el.style.fontSize = '12px';
  el.style.padding = '4px 8px';
  el.style.borderRadius = '4px';
  el.style.color = s.colors.default;
  el.style.background = 'transparent';
  el.style.display = 'inline-block';
  el.style.minWidth = '64px';
  // alignment
  if (s.alignment === 'right') el.style.marginLeft = 'auto';
  else if (s.alignment === 'center') el.style.margin = '0 auto';
  else el.style.marginLeft = '';
  previewCounter = el;
  toolbar.appendChild(el);

  // initialize preview editor updater
  const editor = by('editorPreview');
  if (editor) {
    // clear placeholder on first focus
    const placeholder = 'Type here to preview...';
    const onFocus = () => {
      if (editor.textContent === placeholder) editor.textContent = '';
      updatePreviewCounter(editor.textContent);
    };
    const onBlur = () => {
      if (!editor.textContent || editor.textContent.trim() === '') editor.textContent = placeholder;
      updatePreviewCounter(editor.textContent);
    };
    const onInput = () => updatePreviewCounter(editor.textContent);
    editor.removeEventListener('focus', onFocus);
    editor.removeEventListener('blur', onBlur);
    editor.removeEventListener('input', onInput);
    editor.addEventListener('focus', onFocus);
    editor.addEventListener('blur', onBlur);
    editor.addEventListener('input', onInput);
  }
  // seed counter
  updatePreviewCounter('');
}

function wirePreviewInputs(){
  const inputs = ['limit','alignment','showPercentage','th-yellow','th-orange','th-red','col-default','col-yellow','col-orange','col-red'];
  inputs.forEach(id => {
    const node = by(id);
    if (!node) return;
    node.addEventListener('input', () => {
      const s = {
        limit: parseInt(by('limit').value,10) || DEFAULT_SETTINGS.limit,
        alignment: by('alignment').value,
        showPercentage: by('showPercentage').checked,
        thresholds: { yellow: parseInt(by('th-yellow').value,10)||DEFAULT_SETTINGS.thresholds.yellow, orange: parseInt(by('th-orange').value,10)||DEFAULT_SETTINGS.thresholds.orange, red: parseInt(by('th-red').value,10)||DEFAULT_SETTINGS.thresholds.red },
        colors: { default: by('col-default').value||DEFAULT_SETTINGS.colors.default, yellow: by('col-yellow').value||DEFAULT_SETTINGS.colors.yellow, orange: by('col-orange').value||DEFAULT_SETTINGS.colors.orange, red: by('col-red').value||DEFAULT_SETTINGS.colors.red }
      };
      updatePreviewFromSettings(s);
    });
  });
}

function updateColorInputsDisplay(){
  // color inputs now use native swatches styled in CSS; ensure change events update preview
  const colorIds = ['col-default','col-yellow','col-orange','col-red'];
  colorIds.forEach(id => {
    const el = by(id);
    if (!el) return;
    el.addEventListener('input', () => {
      // let other listeners handle updating preview
    });
  });
}

function initDarkMode(){
  const el = by('darkModeToggle');
  if (!el) return;
  // use chrome.storage.sync to persist dark mode across devices
  try {
    chrome.storage && chrome.storage.sync && chrome.storage.sync.get({ optionsDark: false }, (res) => {
      const enabled = !!res.optionsDark;
      document.body.classList.toggle('dark', enabled);
      el.checked = enabled;
    });
    el.addEventListener('change', () => {
      const on = !!el.checked;
      document.body.classList.toggle('dark', on);
      try { chrome.storage.sync.set({ optionsDark: on }); } catch (e) { localStorage.setItem('optionsDark', on ? '1' : '0'); }
    });
  } catch (e) {
    // fallback
    const enabled = localStorage.getItem('optionsDark') === '1';
    document.body.classList.toggle('dark', enabled);
    el.checked = enabled;
    el.addEventListener('change', () => {
      const on = el.checked;
      document.body.classList.toggle('dark', on);
      localStorage.setItem('optionsDark', on ? '1' : '0');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  by('save').addEventListener('click', save);
  by('restore').addEventListener('click', restoreDefaults);
  wirePreviewInputs();
  updateColorInputsDisplay();
  initDarkMode();
});
