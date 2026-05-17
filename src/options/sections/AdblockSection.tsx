import React from "react";
import type { Tx } from "../types";
import type { ExtensionSettings } from "../../shared/types";
import { DEFAULT_SETTINGS } from "../../shared/defaults";

export type AdblockSectionProps = {
  lang: "id" | "en";
  tx: Tx;
  settings: ExtensionSettings;
  patch: (partial: Partial<ExtensionSettings>) => void;
};

export function AdblockSection(props: AdblockSectionProps) {
  const { lang, tx, settings, patch } = props;
  return (
    
                <section className="section active">
                  <div className="section-header">
                    <h2>{lang === "en" ? "Ad Redirect Blocker" : "Blok Redirect Iklan"}</h2>
                  </div>

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>{tx("Aktifkan Anti-Redirect", "Enable Anti-Redirect")}</h3>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={settings.antiRedirect}
                          onChange={(e) =>
                            patch({ antiRedirect: e.target.checked })
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
                        <h3>{tx("Blok Iframe di Luar Body", "Block Outside Iframes")}</h3>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={settings.blockOutsideIframes}
                          onChange={(e) =>
                            patch({ blockOutsideIframes: e.target.checked })
                          }
                        />
                        <span className="toggle-track">
                          <span className="toggle-thumb" />
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="card">
                    <div className="setting-row vertical">
                      <div
                        className="setting-info"
                        style={{ marginBottom: 12 }}
                      >
                        <h3>{tx("Domain Terblokir", "Blocked Domains")}</h3>
                      </div>
                      <textarea
                        className="textarea"
                        rows={12}
                        value={settings.adDomains.join("\n")}
                        onChange={(e) =>
                          patch({
                            adDomains: e.target.value
                              .split("\n")
                              .map((d) => d.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="btn-row">
                    <button
                      className="btn btn--ghost"
                      onClick={() =>
                        patch({ adDomains: DEFAULT_SETTINGS.adDomains })
                      }
                    >
                      {tx("Reset ke Default", "Reset to Default")}
                    </button>
                  </div>
                </section>
  );
}

