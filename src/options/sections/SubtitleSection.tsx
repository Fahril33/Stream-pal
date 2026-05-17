import React from "react";
import type { Tx } from "../types";
import type { ExtensionSettings } from "../../shared/types";

export type SubtitleSectionProps = {
  lang: "id" | "en";
  tx: Tx;
  settings: ExtensionSettings;
  patch: (partial: Partial<ExtensionSettings>) => void;
};

export function SubtitleSection(props: SubtitleSectionProps) {
  const { lang, tx, settings, patch } = props;
  return (
    
                <section className="section active">
                  <div className="section-header">
                    <h2>{lang === "en" ? "Subtitle Appearance" : "Tampilan Subtitle"}</h2>
                  </div>

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>{tx("Ukuran Font", "Font Size")}</h3>
                      </div>
                      <div className="range-wrap">
                        <input
                          className="range-input"
                          type="range"
                          min={12}
                          max={48}
                          value={settings.subFontSize}
                          onChange={(e) =>
                            patch({ subFontSize: Number(e.target.value) })
                          }
                        />
                        <span className="range-value">
                          {settings.subFontSize}px
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>{tx("Warna Font", "Font Color")}</h3>
                      </div>
                      <div className="color-pick">
                        <input
                          className="color-input"
                          type="color"
                          value={settings.subFontColor}
                          onChange={(e) =>
                            patch({ subFontColor: e.target.value })
                          }
                        />
                        <span className="color-hex">
                          {settings.subFontColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>{tx("Warna Latar", "Background Color")}</h3>
                      </div>
                      <div className="color-pick">
                        <input
                          className="color-input"
                          type="color"
                          value={settings.subBgColor}
                          onChange={(e) =>
                            patch({ subBgColor: e.target.value })
                          }
                        />
                        <span className="color-hex">{settings.subBgColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>{tx("Opacity Latar", "Background Opacity")}</h3>
                      </div>
                      <div className="range-wrap">
                        <input
                          className="range-input"
                          type="range"
                          min={0}
                          max={100}
                          value={settings.subBgOpacity}
                          onChange={(e) =>
                            patch({ subBgOpacity: Number(e.target.value) })
                          }
                        />
                        <span className="range-value">
                          {settings.subBgOpacity}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>{tx("Bayangan Teks", "Text Shadow")}</h3>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={settings.subTextShadow !== false}
                          onChange={(e) =>
                            patch({ subTextShadow: e.target.checked })
                          }
                        />
                        <span className="toggle-track">
                          <span className="toggle-thumb" />
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="card card--preview">
                    <h3>{tx("Pratinjau", "Preview")}</h3>
                    <div className="subtitle-preview">
                      <div className="preview-video-bg" />
                      <div
                        className="preview-sub"
                        style={{ bottom: (settings.subBottom || 12) + "%" }}
                      >
                        <span
                          style={{
                            fontSize: (settings.subFontSize || 22) + "px",
                            color: settings.subFontColor || "#ffffff",
                            background: (() => {
                              const hex = (
                                settings.subBgColor || "#000000"
                              ).replace("#", "");
                              const r = parseInt(hex.substring(0, 2), 16) || 0;
                              const g = parseInt(hex.substring(2, 4), 16) || 0;
                              const b = parseInt(hex.substring(4, 6), 16) || 0;
                              return `rgba(${r}, ${g}, ${b}, ${settings.subBgOpacity / 100})`;
                            })(),
                            textShadow: settings.subTextShadow
                              ? "0 0 4px rgba(0,0,0,0.9), 0 1px 6px rgba(0,0,0,0.7)"
                              : "none",
                          }}
                        >
                          {tx(
                            "Ini contoh teks subtitle untuk pratinjau.",
                            "This is a subtitle preview line.",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
  );
}

