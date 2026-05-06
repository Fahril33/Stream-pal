/* ============================================================
   Video Enhancer – Background Service Worker (Manifest V3)
   ============================================================
   Handles:
   - Per-domain toggle state (enabled / disabled)
   - Message relay between popup and content scripts
   ============================================================ */

// Default state for new domains
const DEFAULT_ENABLED = true;

/**
 * Get the enabled state for a given hostname.
 * @param {string} hostname
 * @returns {Promise<boolean>}
 */
async function isDomainEnabled(hostname) {
  const key = `ve_domain_${hostname}`;
  const result = await chrome.storage.local.get(key);
  return result[key] !== undefined ? result[key] : DEFAULT_ENABLED;
}

/**
 * Set the enabled state for a given hostname.
 * @param {string} hostname
 * @param {boolean} enabled
 */
async function setDomainEnabled(hostname, enabled) {
  const key = `ve_domain_${hostname}`;
  await chrome.storage.local.set({ [key]: enabled });
}

// ---- Message Handling ----
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'VE_GET_STATE') {
    isDomainEnabled(message.hostname).then((enabled) => {
      sendResponse({ enabled });
    });
    return true; // async response
  }

  if (message.type === 'VE_SET_STATE') {
    setDomainEnabled(message.hostname, message.enabled).then(() => {
      // Notify all tabs on this hostname
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          try {
            const url = new URL(tab.url || '');
            if (url.hostname === message.hostname) {
              chrome.tabs.sendMessage(tab.id, {
                type: 'VE_STATE_CHANGED',
                enabled: message.enabled,
              }).catch(() => {/* tab may not have content script */});
            }
          } catch (_) {/* ignore invalid URLs */}
        }
      });
      sendResponse({ ok: true });
    });
    return true;
  }

  return false;
});

// ---- On Install ----
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Video Enhancer] Extension installed / updated.');
});
