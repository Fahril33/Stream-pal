import React from "react";
import type { Tx } from "../types";

export type DomainsSectionProps = {
  lang: "id" | "en";
  tx: Tx;
  domainRows: Array<[string, boolean]>;
  setDomainState: (hostname: string, enabled: boolean) => void;
  removeDomainState: (hostname: string) => Promise<void>;
  refreshDomains: () => Promise<void>;
};

export function DomainsSection(props: DomainsSectionProps) {
  const { lang, tx, domainRows, setDomainState, removeDomainState, refreshDomains } = props;
  return (
    
                <section className="section active">
                  <div className="section-header">
                    <h2>{lang === "en" ? "Per-Site Settings" : "Pengaturan Per Situs"}</h2>
                  </div>
                  <div className="card">
                    <div className="domain-list">
                      {domainRows.length === 0 ? (
                        <div className="domain-empty">
                          {tx(
                            "Belum ada pengaturan khusus domain yang tersimpan.",
                            "No domain-specific settings saved yet.",
                          )}
                        </div>
                      ) : (
                        domainRows.map(([host, enabled]) => (
                          <div className="domain-row" key={host}>
                            <span className="domain-name">{host}</span>
                            <div className="domain-actions">
                              <span
                                className={`domain-status ${enabled ? "on" : "off"}`}
                              >
                                {enabled
                                  ? tx("Aktif", "Enabled")
                                  : tx("Nonaktif", "Disabled")}
                              </span>
                              <button
                                className="domain-delete"
                                onClick={() =>
                                  void removeDomainState(host).then(
                                    refreshDomains,
                                  )
                                }
                              >
                                {tx("Hapus", "Remove")}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </section>
  );
}

