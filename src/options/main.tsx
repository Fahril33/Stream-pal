import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './options.css';
import { DEFAULT_SETTINGS } from '../shared/defaults';
import type { ExtensionSettings } from '../shared/types';
import { broadcastSettings } from '../shared/messaging';
import { getAllDomainStates } from '../shared/storage';

type SectionKey = 'home' | 'general' | 'subtitle' | 'adblock' | 'domains' | 'shortcuts' | 'about';

function App() {
  const [section, setSection] = useState<SectionKey>('home');
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [domains, setDomains] = useState<Record<string, boolean>>({});

  useEffect(() => {
    chrome.storage.local.get('ve_settings', (result) => {
      setSettings({ ...DEFAULT_SETTINGS, ...(result.ve_settings || {}) });
    });
    void refreshDomains();
  }, []);

  const save = (next: ExtensionSettings) => {
    setSettings(next);
    chrome.storage.local.set({ ve_settings: next }, () => {
      void broadcastSettings(next);
    });
  };

  const patch = (partial: Partial<ExtensionSettings>) => save({ ...settings, ...partial });

  async function refreshDomains() {
    setDomains(await getAllDomainStates());
  }

  const domainRows = useMemo(() => Object.entries(domains).sort(([a], [b]) => a.localeCompare(b)), [domains]);

  return (
    <>
      <div className="ambient-blob blob-1" /><div className="ambient-blob blob-2" /><div className="ambient-blob blob-3" />
      <div className="app">
        <aside className="sidebar" id="sidebar">
          <div className="sidebar-brand"><span>Video Enhancer</span></div>
          <nav className="sidebar-nav">
            {(['home', 'general', 'subtitle', 'adblock', 'domains', 'shortcuts', 'about'] as SectionKey[]).map((k) => (
              <button key={k} className={`nav-item ${section === k ? 'active' : ''}`} onClick={() => setSection(k)}>{k[0].toUpperCase() + k.slice(1)}</button>
            ))}
          </nav>
          <div className="sidebar-footer"><span className="version-badge">v2.0.0</span></div>
        </aside>

        <main className="main">
          {section === 'home' && (
            <section className="section active" id="section-home">
              <div className="section-header"><h2>Home</h2><p>Shortcut cepat ke portal hiburan favorit dan rekomendasi tontonan.</p></div>
              <div className="card home-hero"><div className="home-hero__badge">Entertainment Hub</div><h3>Buka Hiburan Lebih Cepat</h3><p>Pilih gateway film atau konten hiburan dari satu tempat.</p></div>
              <div className="card"><div className="home-grid-title"><h3>Film Gateway</h3><p>Portal web film populer.</p></div><div className="home-links-grid">
                <a className="home-link-card" href="https://idlix.asia/" target="_blank" rel="noreferrer"><span className="home-link-card__name">Idlix</span><span className="home-link-card__url">idlix.asia</span></a>
                <a className="home-link-card" href="https://ngefilm21.sbs/" target="_blank" rel="noreferrer"><span className="home-link-card__name">Ngefilm</span><span className="home-link-card__url">ngefilm21.sbs</span></a>
                <a className="home-link-card" href="https://rebahin.bond/" target="_blank" rel="noreferrer"><span className="home-link-card__name">Rebahin</span><span className="home-link-card__url">rebahin.bond</span></a>
              </div></div>
            </section>
          )}

          {section === 'general' && (
            <section className="section active"><div className="section-header"><h2>General Settings</h2></div>
              {[
                ['Global Enable', 'globalEnabled'], ['Show Floating Panel', 'showPanel'], ['Auto-detect Video', 'autoDetect'], ['Auto-Pause on Tab Switch', 'autoPause'], ['Bypass Site Auto-Pause', 'bypassSiteAutoPause'],
              ].map(([label, key]) => (
                <div className="card" key={key}><div className="setting-row"><div className="setting-info"><h3>{label}</h3></div><label className="toggle"><input type="checkbox" checked={Boolean(settings[key as keyof ExtensionSettings])} onChange={(e) => patch({ [key]: e.target.checked } as Partial<ExtensionSettings>)} /><span className="toggle-track"><span className="toggle-thumb" /></span></label></div></div>
              ))}
              <div className="card"><div className="setting-row"><div className="setting-info"><h3>Panel Opacity</h3></div><div className="range-wrap"><input className="range-input" type="range" min={30} max={100} value={settings.panelOpacity} onChange={(e) => patch({ panelOpacity: Number(e.target.value) })} /><span className="range-value">{settings.panelOpacity}%</span></div></div></div>
            </section>
          )}

          {section === 'subtitle' && (
            <section className="section active"><div className="section-header"><h2>Subtitle Appearance</h2></div>
              <div className="card"><div className="setting-row"><div className="setting-info"><h3>Font Size</h3></div><div className="range-wrap"><input className="range-input" type="range" min={12} max={48} value={settings.subFontSize} onChange={(e) => patch({ subFontSize: Number(e.target.value) })} /><span className="range-value">{settings.subFontSize}px</span></div></div></div>
              <div className="card"><div className="setting-row"><div className="setting-info"><h3>Font Color</h3></div><div className="color-pick"><input className="color-input" type="color" value={settings.subFontColor} onChange={(e) => patch({ subFontColor: e.target.value })} /><span className="color-hex">{settings.subFontColor}</span></div></div></div>
              <div className="card"><div className="setting-row"><div className="setting-info"><h3>Background Color</h3></div><div className="color-pick"><input className="color-input" type="color" value={settings.subBgColor} onChange={(e) => patch({ subBgColor: e.target.value })} /><span className="color-hex">{settings.subBgColor}</span></div></div></div>
              <div className="card"><div className="setting-row"><div className="setting-info"><h3>Background Opacity</h3></div><div className="range-wrap"><input className="range-input" type="range" min={0} max={100} value={settings.subBgOpacity} onChange={(e) => patch({ subBgOpacity: Number(e.target.value) })} /><span className="range-value">{settings.subBgOpacity}%</span></div></div></div>
              <div className="card"><div className="setting-row"><div className="setting-info"><h3>Text Shadow</h3></div><label className="toggle"><input type="checkbox" checked={settings.subTextShadow} onChange={(e) => patch({ subTextShadow: e.target.checked })} /><span className="toggle-track"><span className="toggle-thumb" /></span></label></div></div>
              <div className="card"><div className="setting-row"><div className="setting-info"><h3>Position from Bottom</h3></div><div className="range-wrap"><input className="range-input" type="range" min={2} max={40} value={settings.subBottom} onChange={(e) => patch({ subBottom: Number(e.target.value) })} /><span className="range-value">{settings.subBottom}%</span></div></div></div>
              <div className="card card--preview">
                <h3>Preview</h3>
                <div className="subtitle-preview">
                  <div className="preview-video-bg" />
                  <div className="preview-sub" style={{ bottom: `${settings.subBottom}%` }}>
                    <span
                      style={{
                        fontSize: `${Math.min(settings.subFontSize, 24)}px`,
                        color: settings.subFontColor,
                        background: (() => {
                          const hex = settings.subBgColor.replace('#', '');
                          const r = parseInt(hex.substring(0, 2), 16) || 0;
                          const g = parseInt(hex.substring(2, 4), 16) || 0;
                          const b = parseInt(hex.substring(4, 6), 16) || 0;
                          return `rgba(${r}, ${g}, ${b}, ${settings.subBgOpacity / 100})`;
                        })(),
                        textShadow: settings.subTextShadow ? '0 0 4px rgba(0,0,0,0.9), 0 1px 6px rgba(0,0,0,0.7)' : 'none',
                      }}
                    >
                      This is a subtitle preview line.
                    </span>
                  </div>
                </div>
              </div>
              <div className="card"><div className="setting-row"><div className="setting-info"><h3>Lyrics Offset</h3><p>Adjust timing synchronisation (seconds)</p></div><div className="range-wrap"><input className="range-input" type="range" min={-10} max={10} step={0.1} value={settings.lyricsOffset} onChange={(e) => patch({ lyricsOffset: Number(e.target.value) })} /><span className="range-value">{settings.lyricsOffset > 0 ? '+' : ''}{settings.lyricsOffset}s</span></div></div></div>
            </section>
          )}

          {section === 'adblock' && (
            <section className="section active"><div className="section-header"><h2>Ad Redirect Blocker</h2></div>
              <div className="card"><div className="setting-row"><div className="setting-info"><h3>Enable Anti-Redirect</h3></div><label className="toggle"><input type="checkbox" checked={settings.antiRedirect} onChange={(e) => patch({ antiRedirect: e.target.checked })} /><span className="toggle-track"><span className="toggle-thumb" /></span></label></div></div>
              <div className="card"><div className="setting-row"><div className="setting-info"><h3>Block Outside Iframes</h3></div><label className="toggle"><input type="checkbox" checked={settings.blockOutsideIframes} onChange={(e) => patch({ blockOutsideIframes: e.target.checked })} /><span className="toggle-track"><span className="toggle-thumb" /></span></label></div></div>
              <div className="card"><div className="setting-row vertical"><div className="setting-info" style={{ marginBottom: 12 }}><h3>Blocked Domains</h3></div><textarea className="textarea" rows={12} value={settings.adDomains.join('\n')} onChange={(e) => patch({ adDomains: e.target.value.split('\n').map((d) => d.trim()).filter(Boolean) })} /></div></div>
              <div className="btn-row"><button className="btn btn--ghost" onClick={() => patch({ adDomains: DEFAULT_SETTINGS.adDomains })}>Reset to Default</button></div>
            </section>
          )}

          {section === 'domains' && (
            <section className="section active"><div className="section-header"><h2>Per-Site Settings</h2></div><div className="card"><div className="domain-list">{domainRows.length === 0 ? <div className="domain-empty">No domain-specific settings saved yet.</div> : domainRows.map(([host, enabled]) => (
              <div className="domain-row" key={host}><span className="domain-name">{host}</span><div className="domain-actions"><span className={`domain-status ${enabled ? 'on' : 'off'}`}>{enabled ? 'Enabled' : 'Disabled'}</span><button className="domain-delete" onClick={() => chrome.storage.local.remove(`ve_domain_${host}`, refreshDomains)}>Remove</button></div></div>
            ))}</div></div></section>
          )}

          {section === 'shortcuts' && <section className="section active"><div className="section-header"><h2>Keyboard Shortcuts</h2></div><div className="card"><div className="shortcut-row"><span className="shortcut-label">Seek −5 seconds</span><kbd className="kbd">←</kbd></div><div className="shortcut-row"><span className="shortcut-label">Seek +5 seconds</span><kbd className="kbd">→</kbd></div><div className="shortcut-row"><span className="shortcut-label">Seek −1 minute</span><kbd className="kbd">Shift + ←</kbd></div><div className="shortcut-row"><span className="shortcut-label">Seek +1 minute</span><kbd className="kbd">Shift + →</kbd></div><div className="shortcut-row"><span className="shortcut-label">Toggle Subtitles</span><kbd className="kbd">S</kbd></div></div><div className="card"><div className="setting-row"><div className="setting-info"><h3>Enable Keyboard Shortcuts</h3></div><label className="toggle"><input type="checkbox" checked={settings.enableShortcuts} onChange={(e) => patch({ enableShortcuts: e.target.checked })} /><span className="toggle-track"><span className="toggle-thumb" /></span></label></div></div></section>}
          {section === 'about' && <section className="section active"><div className="section-header"><h2>About</h2></div><div className="card about-card"><h3>Video Enhancer</h3><p className="about-version">Version 2.0.0 · React + TypeScript</p></div></section>}
        </main>
      </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
