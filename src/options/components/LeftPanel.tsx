import React from "react";
import type { SectionKey } from "../sectionKey";
import type { Tx } from "../types";
import { MeTimeLogo } from "./MeTimeLogo";

export type NavItem = {
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
};

export function LeftPanel(props: {
  section: SectionKey;
  setSection: (key: SectionKey) => void;
  navItems: NavItem[];
  lang: "id" | "en";
  uiMode: "noon" | "night";
  tx: Tx;
  toggleLang: () => void;
  toggleMode: () => void;
}) {
  const { section, setSection, navItems, lang, uiMode, tx, toggleLang, toggleMode } =
    props;

  return (
    <aside className="left-panel glass" aria-label="Navigation">
      <div className="left-header">
        <div className="logo">
          <div className="logo-mark" aria-hidden="true">
            <MeTimeLogo />
          </div>
        </div>
      </div>

      <nav className="side-nav" aria-label="Settings sections">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`side-nav-item ${section === item.key ? "active" : ""}`}
            onClick={() => setSection(item.key)}
          >
            <span className="side-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="side-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="left-footer">
        <div className="footer-actions">
          <button
            className="mode-toggle-btn lang-toggle-btn"
            onClick={toggleLang}
            aria-label={
              lang === "id"
                ? tx("Ganti bahasa ke English", "Switch language to English")
                : tx("Ganti bahasa ke Indonesia", "Switch language to Indonesian")
            }
            title={lang === "id" ? "EN" : "ID"}
          >
            <span className="lang-pill" aria-hidden="true">
              {lang.toUpperCase()}
            </span>
          </button>
          <button
            className="mode-toggle-btn"
            onClick={toggleMode}
            aria-label={
              uiMode === "noon"
                ? tx("Ganti ke mode Malam", "Switch to night mode")
                : tx("Ganti ke mode Siang", "Switch to noon mode")
            }
          >
            {uiMode === "noon" ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
        <span className="version-badge">v2.0.0</span>
      </div>
    </aside>
  );
}

