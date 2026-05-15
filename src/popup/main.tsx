import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';
import { DEFAULT_SETTINGS } from '../shared/defaults';
import type { ExtensionSettings } from '../shared/types';
import { broadcastSettings } from '../shared/messaging';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function PopupApp() {
  const [hostname, setHostname] = useState('—');
  const [domainEnabled, setDomainEnabled] = useState(true);
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [canToggleDomain, setCanToggleDomain] = useState(true);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeUrl = tabs[0]?.url;
      if (!activeUrl) {
        setHostname('No active page');
        setCanToggleDomain(false);
        return;
      }
      try {
        const url = new URL(activeUrl);
        setHostname(url.hostname);

        chrome.runtime.sendMessage({ type: 'VE_GET_STATE', hostname: url.hostname }, (response) => {
          if (!chrome.runtime.lastError) setDomainEnabled(response?.enabled ?? true);
        });
      } catch {
        setHostname('Invalid URL');
        setCanToggleDomain(false);
      }
    });

    chrome.storage.local.get('ve_settings', (result) => {
      setSettings({ ...DEFAULT_SETTINGS, ...(result.ve_settings || {}) });
    });
  }, []);

  const status = useMemo(() => (domainEnabled ? 'Active' : 'Disabled'), [domainEnabled]);

  const updateGlobal = (patch: Partial<ExtensionSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    chrome.storage.local.set({ ve_settings: next }, () => {
      broadcastSettings(next);
    });
  };

  const onDomainToggle = (enabled: boolean) => {
    setDomainEnabled(enabled);
    chrome.runtime.sendMessage({ type: 'VE_SET_STATE', hostname, enabled });
  };

  return (
    <div className="popup-root">
      <div className="popup-header">
        <h1>Video Enhancer</h1>
      </div>

      <div className="popup-domain">{hostname}</div>

      <div className="toggle-row domain-toggle">
        <span className="toggle-label">Enable on this site</span>
        <Toggle checked={domainEnabled} onChange={onDomainToggle} />
      </div>

      <div className="status-text">
        Status: <span className={domainEnabled ? 'on' : 'off'}>{status}</span>
      </div>

      <div className="divider" />

      <div className="toggle-row">
        <span className="toggle-label">Auto-Pause on Tab Switch</span>
        <Toggle checked={settings.autoPause} onChange={(v) => updateGlobal({ autoPause: v })} />
      </div>

      <div className="toggle-row">
        <span className="toggle-label">Anti-Redirect & Ads</span>
        <Toggle checked={settings.antiRedirect} onChange={(v) => updateGlobal({ antiRedirect: v })} />
      </div>

      <div className="toggle-row">
        <span className="toggle-label">Show Floating Panel</span>
        <Toggle checked={settings.showPanel} onChange={(v) => updateGlobal({ showPanel: v })} />
      </div>

      <button
        className="settings-btn"
        disabled={!canToggleDomain && hostname !== 'Invalid URL'}
        onClick={() => chrome.runtime.openOptionsPage()}
      >
        Settings
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<PopupApp />);
