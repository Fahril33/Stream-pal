import React from "react";
import type { Tx } from "../types";
import type { ExtensionSettings } from "../../shared/types";

export type ShortcutsSectionProps = {
  lang: "id" | "en";
  tx: Tx;
  settings: ExtensionSettings;
  patch: (partial: Partial<ExtensionSettings>) => void;
};

export function ShortcutsSection(props: ShortcutsSectionProps) {
  const { lang, tx, settings, patch } = props;
  return (
    
                <section className="section active">
                  <div className="section-header">
                    <h2>{lang === "en" ? "Keyboard Shortcuts" : "Shortcut Keyboard"}</h2>
                  </div>
                  <div className="card">
                    <div className="shortcut-row">
                      <span className="shortcut-label">
                        {tx("Mundur 5 detik", "Seek âˆ’5 seconds")}
                      </span>
                      <kbd className="kbd">â†</kbd>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-label">
                        {tx("Maju 5 detik", "Seek +5 seconds")}
                      </span>
                      <kbd className="kbd">â†’</kbd>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-label">
                        {tx("Mundur 1 menit", "Seek âˆ’1 minute")}
                      </span>
                      <kbd className="kbd">Shift + â†</kbd>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-label">
                        {tx("Maju 1 menit", "Seek +1 minute")}
                      </span>
                      <kbd className="kbd">Shift + â†’</kbd>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-label">
                        {tx("Tampilkan/Sembunyikan Subtitle", "Toggle Subtitles")}
                      </span>
                      <kbd className="kbd">S</kbd>
                    </div>
                  </div>
                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>{tx("Aktifkan Shortcut Keyboard", "Enable Keyboard Shortcuts")}</h3>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={settings.enableShortcuts}
                          onChange={(e) =>
                            patch({ enableShortcuts: e.target.checked })
                          }
                        />
                        <span className="toggle-track">
                          <span className="toggle-thumb" />
                        </span>
                      </label>
                    </div>
                  </div>
                </section>
  );
}

