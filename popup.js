/* ============================================================
   Video Enhancer – Popup Script
   ============================================================ */

(function () {
  const domainText = document.getElementById('domainText');
  const toggleEl = document.getElementById('toggleEnabled');
  const toggleAutoPause = document.getElementById('toggleAutoPause');
  const toggleAntiRedirect = document.getElementById('toggleAntiRedirect');
  const toggleShowPanel = document.getElementById('toggleShowPanel');
  const statusText = document.getElementById('statusText');

  let currentHostname = '';
  let globalSettings = {};

  function updateStatus(enabled) {
    if (enabled) {
      statusText.innerHTML = 'Status: <span class="on">Active</span>';
    } else {
      statusText.innerHTML = 'Status: <span class="off">Disabled</span>';
    }
  }

  // Get the active tab's hostname
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.url) {
      domainText.textContent = 'No active page';
      toggleEl.disabled = true;
      return;
    }

    try {
      const url = new URL(tabs[0].url);
      currentHostname = url.hostname;
      domainText.textContent = currentHostname;
    } catch (_) {
      domainText.textContent = 'Invalid URL';
      toggleEl.disabled = true;
      return;
    }

    // Fetch current state
    chrome.runtime.sendMessage(
      { type: 'VE_GET_STATE', hostname: currentHostname },
      (response) => {
        if (chrome.runtime.lastError) return;
        const enabled = response?.enabled ?? true;
        toggleEl.checked = enabled;
        updateStatus(enabled);
      }
    );

    // Fetch global settings
    chrome.storage.local.get('ve_settings', (result) => {
      globalSettings = result.ve_settings || {};
      toggleAutoPause.checked = globalSettings.autoPause ?? false;
      toggleAntiRedirect.checked = globalSettings.antiRedirect ?? true;
      toggleShowPanel.checked = globalSettings.showPanel ?? true;
    });
  });

  function updateGlobalSetting(key, value) {
    globalSettings[key] = value;
    chrome.storage.local.set({ ve_settings: globalSettings }, () => {
      // Broadcast settings update to all tabs
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'VE_SETTINGS_UPDATED',
            settings: globalSettings,
          }).catch(() => {});
        }
      });
    });
  }

  // Domain toggle handler
  toggleEl.addEventListener('change', () => {
    const enabled = toggleEl.checked;
    updateStatus(enabled);
    chrome.runtime.sendMessage({
      type: 'VE_SET_STATE',
      hostname: currentHostname,
      enabled,
    });
  });

  // Global toggle handlers
  toggleAutoPause.addEventListener('change', () => {
    updateGlobalSetting('autoPause', toggleAutoPause.checked);
  });
  toggleAntiRedirect.addEventListener('change', () => {
    updateGlobalSetting('antiRedirect', toggleAntiRedirect.checked);
  });
  toggleShowPanel.addEventListener('change', () => {
    updateGlobalSetting('showPanel', toggleShowPanel.checked);
  });

  // Open Settings page
  const settingsBtn = document.getElementById('openSettings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
})();
