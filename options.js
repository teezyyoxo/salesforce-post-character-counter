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
  });
}

function restoreDefaults(){
  chrome.storage.sync.set(DEFAULT_SETTINGS, load);
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  by('save').addEventListener('click', save);
  by('restore').addEventListener('click', restoreDefaults);
});
