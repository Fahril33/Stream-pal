/* ============================================================
   Video Enhancer – Options Page Logic
   ============================================================
   Manages settings persistence via chrome.storage.local and
   provides live preview for subtitle styling.
   ============================================================ */

(function () {
  'use strict';

  // ---- Default Settings ----
  const DEFAULTS = {
    globalEnabled: true,
    showPanel: true,
    autoDetect: true,
    autoPause: false,
    bypassSiteAutoPause: false,
    panelOpacity: 72,
    subFontSize: 22,
    subFontColor: '#ffffff',
    subBgColor: '#000000',
    subBgOpacity: 70,
    subTextShadow: true,
    subBottom: 12,
    antiRedirect: true,
    blockOutsideIframes: true,
    enableShortcuts: true,
    adDomains: [
      'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
      'adclick.g.doubleclick.net', 'adservice.google.com',
      'ads.yahoo.com', 'ad.doubleclick.net',
      'popads.net', 'popcash.net', 'propellerads.com',
      'adcash.com', 'adsterra.com', 'admaven.com',
      'trafficjunky.com', 'exoclick.com', 'juicyads.com',
      'clickadu.com', 'hilltopads.com', 'evadav.com',
      'pushground.com', 'richpush.com', 'megapush.com',
      'ad-maven.com', 'adnium.com', 'tsyndicate.com',
      'revenuehits.com', 'bidvertiser.com',
      'track.', 'click.', 'rdr.', 'redirect.',
    ],
  };

  // ---- DOM Refs ----
  const els = {
    globalEnabled: document.getElementById('globalEnabled'),
    showPanel: document.getElementById('showPanel'),
    autoDetect: document.getElementById('autoDetect'),
    autoPause: document.getElementById('autoPause'),
    bypassSiteAutoPause: document.getElementById('bypassSiteAutoPause'),
    panelOpacity: document.getElementById('panelOpacity'),
    panelOpacityVal: document.getElementById('panelOpacityVal'),
    subFontSize: document.getElementById('subFontSize'),
    subFontSizeVal: document.getElementById('subFontSizeVal'),
    subFontColor: document.getElementById('subFontColor'),
    subFontColorHex: document.getElementById('subFontColorHex'),
    subBgColor: document.getElementById('subBgColor'),
    subBgColorHex: document.getElementById('subBgColorHex'),
    subBgOpacity: document.getElementById('subBgOpacity'),
    subBgOpacityVal: document.getElementById('subBgOpacityVal'),
    subTextShadow: document.getElementById('subTextShadow'),
    subBottom: document.getElementById('subBottom'),
    subBottomVal: document.getElementById('subBottomVal'),
    antiRedirect: document.getElementById('antiRedirect'),
    blockOutsideIframes: document.getElementById('blockOutsideIframes'),
    enableShortcuts: document.getElementById('enableShortcuts'),
    adDomains: document.getElementById('adDomains'),
    resetAdDomains: document.getElementById('resetAdDomains'),
    domainList: document.getElementById('domainList'),
    previewSub: document.getElementById('previewSub'),
    previewSubText: document.getElementById('previewSubText'),
    saveToast: document.getElementById('saveToast'),
  };

  // ---- Navigation ----
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      navItems.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
      const target = document.getElementById('section-' + btn.dataset.section);
      if (target) {
        target.classList.remove('active');
        // Trigger reflow for animation
        void target.offsetWidth;
        target.classList.add('active');
      }
    });
  });

  // ---- Load Settings ----
  function loadSettings() {
    chrome.storage.local.get('ve_settings', (result) => {
      const settings = { ...DEFAULTS, ...(result.ve_settings || {}) };

      els.globalEnabled.checked = settings.globalEnabled;
      els.showPanel.checked = settings.showPanel;
      els.autoDetect.checked = settings.autoDetect;
      els.autoPause.checked = settings.autoPause;
      els.bypassSiteAutoPause.checked = settings.bypassSiteAutoPause;
      els.panelOpacity.value = settings.panelOpacity;
      els.panelOpacityVal.textContent = settings.panelOpacity + '%';
      els.subFontSize.value = settings.subFontSize;
      els.subFontSizeVal.textContent = settings.subFontSize + 'px';
      els.subFontColor.value = settings.subFontColor;
      els.subFontColorHex.textContent = settings.subFontColor;
      els.subBgColor.value = settings.subBgColor;
      els.subBgColorHex.textContent = settings.subBgColor;
      els.subBgOpacity.value = settings.subBgOpacity;
      els.subBgOpacityVal.textContent = settings.subBgOpacity + '%';
      els.subTextShadow.checked = settings.subTextShadow;
      els.subBottom.value = settings.subBottom;
      els.subBottomVal.textContent = settings.subBottom + '%';
      els.antiRedirect.checked = settings.antiRedirect;
      els.blockOutsideIframes.checked = settings.blockOutsideIframes;
      els.enableShortcuts.checked = settings.enableShortcuts;

      // Ad domains
      const domains = Array.isArray(settings.adDomains) ? settings.adDomains : DEFAULTS.adDomains;
      els.adDomains.value = domains.join('\n');

      updatePreview(settings);
      loadDomainList();
    });
  }

  // ---- Save Settings (debounced) ----
  let saveTimer = null;
  function saveSettings() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const settings = {
        globalEnabled: els.globalEnabled.checked,
        showPanel: els.showPanel.checked,
        autoDetect: els.autoDetect.checked,
        autoPause: els.autoPause.checked,
        bypassSiteAutoPause: els.bypassSiteAutoPause.checked,
        panelOpacity: parseInt(els.panelOpacity.value, 10),
        subFontSize: parseInt(els.subFontSize.value, 10),
        subFontColor: els.subFontColor.value,
        subBgColor: els.subBgColor.value,
        subBgOpacity: parseInt(els.subBgOpacity.value, 10),
        subTextShadow: els.subTextShadow.checked,
        subBottom: parseInt(els.subBottom.value, 10),
        antiRedirect: els.antiRedirect.checked,
        blockOutsideIframes: els.blockOutsideIframes.checked,
        enableShortcuts: els.enableShortcuts.checked,
        adDomains: els.adDomains.value
          .split('\n')
          .map((d) => d.trim())
          .filter(Boolean),
      };

      chrome.storage.local.set({ ve_settings: settings }, () => {
        showSaveToast();
        // Broadcast to all tabs
        broadcastSettings(settings);
      });
    }, 300);
  }

  function broadcastSettings(settings) {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'VE_SETTINGS_UPDATED',
          settings,
        }).catch(() => {});
      }
    });
  }

  // ---- Save Toast ----
  let toastTimer = null;
  function showSaveToast() {
    clearTimeout(toastTimer);
    els.saveToast.classList.add('show');
    toastTimer = setTimeout(() => {
      els.saveToast.classList.remove('show');
    }, 2500);
  }

  // ---- Live Subtitle Preview ----
  function updatePreview(s) {
    const settings = s || {
      subFontSize: parseInt(els.subFontSize.value, 10),
      subFontColor: els.subFontColor.value,
      subBgColor: els.subBgColor.value,
      subBgOpacity: parseInt(els.subBgOpacity.value, 10),
      subTextShadow: els.subTextShadow.checked,
      subBottom: parseInt(els.subBottom.value, 10),
    };

    const subText = els.previewSubText;
    const subWrap = els.previewSub;

    subText.style.fontSize = Math.min(settings.subFontSize, 24) + 'px';
    subText.style.color = settings.subFontColor;

    // Parse hex to rgb for alpha
    const hex = settings.subBgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    subText.style.background = `rgba(${r}, ${g}, ${b}, ${settings.subBgOpacity / 100})`;

    if (settings.subTextShadow) {
      subText.style.textShadow = '0 0 4px rgba(0,0,0,0.9), 0 1px 6px rgba(0,0,0,0.7)';
    } else {
      subText.style.textShadow = 'none';
    }

    subWrap.style.bottom = settings.subBottom + '%';
  }

  // ---- Domain List ----
  function loadDomainList() {
    chrome.storage.local.get(null, (all) => {
      const domainKeys = Object.keys(all).filter((k) => k.startsWith('ve_domain_'));
      const container = els.domainList;

      if (domainKeys.length === 0) {
        container.innerHTML = '<div class="domain-empty">No domain-specific settings saved yet.</div>';
        return;
      }

      container.innerHTML = '';
      domainKeys
        .sort()
        .forEach((key) => {
          const hostname = key.replace('ve_domain_', '');
          const enabled = all[key];
          const row = document.createElement('div');
          row.className = 'domain-row';
          row.innerHTML = `
            <span class="domain-name">${escapeHtml(hostname)}</span>
            <div class="domain-actions">
              <span class="domain-status ${enabled ? 'on' : 'off'}">${enabled ? 'Enabled' : 'Disabled'}</span>
              <button class="domain-delete" data-key="${key}" title="Remove">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          `;
          container.appendChild(row);
        });

      // Delete handlers
      container.querySelectorAll('.domain-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.key;
          chrome.storage.local.remove(key, () => {
            loadDomainList();
            showSaveToast();
          });
        });
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Event Listeners ----

  // Toggles
  ['globalEnabled', 'showPanel', 'autoDetect', 'autoPause', 'bypassSiteAutoPause', 'subTextShadow', 'antiRedirect', 'blockOutsideIframes', 'enableShortcuts'].forEach((id) => {
    els[id].addEventListener('change', () => {
      saveSettings();
      if (['subTextShadow'].includes(id)) updatePreview();
    });
  });

  // Range sliders
  const rangeMap = {
    panelOpacity: { valEl: 'panelOpacityVal', suffix: '%' },
    subFontSize: { valEl: 'subFontSizeVal', suffix: 'px' },
    subBgOpacity: { valEl: 'subBgOpacityVal', suffix: '%' },
    subBottom: { valEl: 'subBottomVal', suffix: '%' },
  };
  Object.entries(rangeMap).forEach(([id, cfg]) => {
    els[id].addEventListener('input', () => {
      els[cfg.valEl].textContent = els[id].value + cfg.suffix;
      updatePreview();
      saveSettings();
    });
  });

  // Color pickers
  els.subFontColor.addEventListener('input', () => {
    els.subFontColorHex.textContent = els.subFontColor.value;
    updatePreview();
    saveSettings();
  });
  els.subBgColor.addEventListener('input', () => {
    els.subBgColorHex.textContent = els.subBgColor.value;
    updatePreview();
    saveSettings();
  });

  // Ad domains textarea (save on blur)
  els.adDomains.addEventListener('blur', saveSettings);

  // Reset ad domains
  els.resetAdDomains.addEventListener('click', () => {
    els.adDomains.value = DEFAULTS.adDomains.join('\n');
    saveSettings();
  });

  // ---- Init ----
  loadSettings();

})();
