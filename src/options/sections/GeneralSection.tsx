import React from "react";
import type { Tx } from "../types";
import type { ExtensionSettings } from "../../shared/types";

export type GeneralSectionProps = {
  lang: "id" | "en";
  tx: Tx;
  settings: ExtensionSettings;
  patch: (partial: Partial<ExtensionSettings>) => void;
  noonBgUrl: string;
  nightBgUrl: string;
  importBgFromFile: (file: File | null, target: "noon" | "night") => void;
  resetBgToDefault: (target: "noon" | "night") => void;
};

export function GeneralSection(props: GeneralSectionProps) {
  const { lang, tx, settings, patch, noonBgUrl, nightBgUrl, importBgFromFile, resetBgToDefault } = props;
  return (
    
                <section className="section active">
                  <div className="section-header">
                    <h2>{lang === "en" ? "General Settings" : "Pengaturan Umum"}</h2>
                  </div>
                  {[
                    ["globalEnabled", tx("Aktifkan Global", "Global Enable")],
                    ["autoDetect", tx("Deteksi Video Otomatis", "Auto-detect Video")],
                    ["autoPause", tx("Auto-Pause Saat Pindah Tab", "Auto-Pause on Tab Switch")],
                    ["bypassSiteAutoPause", tx("Bypass Auto-Pause Situs", "Bypass Site Auto-Pause")],
                  ].map(([key, label]) => (
                    <div className="card" key={key}>
                      <div className="setting-row">
                        <div className="setting-info">
                          <h3>{label}</h3>
                        </div>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={Boolean(
                              settings[key as keyof ExtensionSettings],
                            )}
                            onChange={(e) =>
                              patch({
                                [key]: e.target.checked,
                              } as Partial<ExtensionSettings>)
                            }
                          />
                          <span className="toggle-track">
                            <span className="toggle-thumb" />
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>{tx("Tampilkan Panel Melayang", "Show Floating Panel")}</h3>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={Boolean(settings.showPanel)}
                          onChange={(e) => patch({ showPanel: e.target.checked })}
                        />
                        <span className="toggle-track">
                          <span className="toggle-thumb" />
                        </span>
                      </label>
                    </div>

                    {settings.showPanel && (
                      <div
                        className="setting-subgroup"
                        aria-label={tx("Pengaturan panel", "Panel settings")}
                      >
                        <div className="card">
                          <div className="setting-row">
                            <div className="setting-info">
                              <h3>{tx("Opacity Panel", "Panel Opacity")}</h3>
                            </div>
                            <div className="range-wrap">
                              <input
                                className="range-input"
                                type="range"
                                min={30}
                                max={100}
                                value={settings.panelOpacity}
                                onChange={(e) =>
                                  patch({ panelOpacity: Number(e.target.value) })
                                }
                              />
                              <span className="range-value">
                                {settings.panelOpacity}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="card">
                          <div className="setting-row">
                            <div className="setting-info">
                              <h3>{tx("Panel Preview", "Panel Preview")}</h3>
                              <p>
                                {tx(
                                  "Jika aktif, panel terkunci (selalu tampil) secara default.",
                                  "When enabled, the panel starts locked (always visible) by default.",
                                )}
                              </p>
                            </div>
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={Boolean(settings.panelPreview)}
                                onChange={(e) =>
                                  patch({ panelPreview: e.target.checked })
                                }
                              />
                              <span className="toggle-track">
                                <span className="toggle-thumb" />
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="card">
                          <div className="setting-row">
                            <div className="setting-info">
                              <h3>
                                {tx(
                                  "Enable Picture-in-Picture",
                                  "Enable Picture-in-Picture",
                                )}
                              </h3>
                            </div>
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={Boolean(settings.enablePictureInPicture)}
                                onChange={(e) =>
                                  patch({ enablePictureInPicture: e.target.checked })
                                }
                              />
                              <span className="toggle-track">
                                <span className="toggle-thumb" />
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="card">
                          <div className="setting-row">
                            <div className="setting-info">
                              <h3>
                                {tx(
                                  "Enable External Subtitle",
                                  "Enable External Subtitle",
                                )}
                              </h3>
                            </div>
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={Boolean(settings.enableExternalSubtitle)}
                                onChange={(e) =>
                                  patch({ enableExternalSubtitle: e.target.checked })
                                }
                              />
                              <span className="toggle-track">
                                <span className="toggle-thumb" />
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="card">
                          <div className="setting-row">
                            <div className="setting-info">
                              <h3>{tx("Enable Jump", "Enable Jump")}</h3>
                              <p>
                                {tx(
                                  "Tampilkan tombol +/− untuk loncat waktu.",
                                  "Show +/− buttons to jump the current time.",
                                )}
                              </p>
                            </div>
                            <label className="toggle">
                              <input
                                type="checkbox"
                                checked={Boolean(settings.enableJump)}
                                onChange={(e) =>
                                  patch({ enableJump: e.target.checked })
                                }
                              />
                              <span className="toggle-track">
                                <span className="toggle-thumb" />
                              </span>
                            </label>
                          </div>

                          {settings.enableJump && (
                            <div className="setting-subgroup">
                              <div className="card">
                                <div className="setting-row">
                                  <div className="setting-info">
                                    <h3>
                                      {tx(
                                        "Jump kecil (detik)",
                                        "Small jump (seconds)",
                                      )}
                                    </h3>
                                  </div>
                                  <div className="range-wrap" style={{ gap: 10 }}>
                                    <input
                                      className="setting-number"
                                      type="number"
                                      min={1}
                                      max={120}
                                      value={settings.jumpSmallSeconds}
                                      onChange={(e) =>
                                        patch({
                                          jumpSmallSeconds: Number(e.target.value),
                                        })
                                      }
                                      style={{ width: 110 }}
                                    />
                                    <span className="range-value">s</span>
                                  </div>
                                </div>
                              </div>

                              <div className="card">
                                <div className="setting-row">
                                  <div className="setting-info">
                                    <h3>
                                      {tx(
                                        "Jump besar (detik)",
                                        "Large jump (seconds)",
                                      )}
                                    </h3>
                                  </div>
                                  <div className="range-wrap" style={{ gap: 10 }}>
                                    <input
                                      className="setting-number"
                                      type="number"
                                      min={5}
                                      max={600}
                                      value={settings.jumpLargeSeconds}
                                      onChange={(e) =>
                                        patch({
                                          jumpLargeSeconds: Number(e.target.value),
                                        })
                                      }
                                      style={{ width: 110 }}
                                    />
                                    <span className="range-value">s</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>{tx("Background Siang", "Noon Background")}</h3>
                        <p>
                          {tx(
                            "Background gambar untuk mode Noon (siang).",
                            "Background image for Noon mode.",
                          )}
                        </p>
                      </div>
                      <div className="bg-controls">
                        <label className="btn btn--ghost bg-file">
                          {tx("Import Gambar", "Import Image")}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              importBgFromFile(
                                e.target.files?.[0] || null,
                                "noon",
                              )
                            }
                          />
                        </label>
                        <button
                          className="btn btn--ghost"
                          onClick={() => resetBgToDefault("noon")}
                        >
                          {tx("Reset Default", "Reset Default")}
                        </button>
                      </div>
                    </div>
                    <div
                      className="bg-preview"
                      style={{ backgroundImage: `url("${noonBgUrl}")` }}
                    />
                  </div>

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>{tx("Background Malam", "Night Background")}</h3>
                        <p>
                          {tx(
                            "Background gambar untuk mode Night (malam).",
                            "Background image for Night mode.",
                          )}
                        </p>
                      </div>
                      <div className="bg-controls">
                        <label className="btn btn--ghost bg-file">
                          {tx("Import Gambar", "Import Image")}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              importBgFromFile(
                                e.target.files?.[0] || null,
                                "night",
                              )
                            }
                          />
                        </label>
                        <button
                          className="btn btn--ghost"
                          onClick={() => resetBgToDefault("night")}
                        >
                          {tx("Reset Default", "Reset Default")}
                        </button>
                      </div>
                    </div>
                    <div
                      className="bg-preview"
                      style={{ backgroundImage: `url("${nightBgUrl}")` }}
                    />
                  </div>
                </section>
  );
}

