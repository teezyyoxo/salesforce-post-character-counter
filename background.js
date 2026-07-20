// Extension context: load extension-owned resources without relying on the
// Salesforce page's fetch/CORS context.
let presetsPromise;

function loadPresets() {
  if (!presetsPromise) {
    presetsPromise = fetch(chrome.runtime.getURL('presets.json'))
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status} while loading presets.json`);
        return response.json();
      })
      .then((data) => (data && Array.isArray(data.presets) ? data.presets : []))
      .catch((error) => {
        console.warn('sf-char-counter: failed to load presets.json', error);
        return [];
      });
  }
  return presetsPromise;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'loadPresets') return undefined;

  loadPresets().then((presets) => sendResponse({ presets }));
  return true;
});
