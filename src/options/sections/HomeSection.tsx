import React from "react";
import type { CustomLink, CustomLinkType, TodoWatchItem } from "../../shared/storage";
import type { Tx } from "../types";

export type HomeSectionProps = {
  lang: "id" | "en";
  tx: Tx;
  now: Date;
  timeGreeting: string;
  heroName: string;
  editingHeroName: boolean;
  setEditingHeroName: React.Dispatch<React.SetStateAction<boolean>>;
  heroNameDraft: string;
  setHeroNameDraft: React.Dispatch<React.SetStateAction<string>>;
  commitHeroName: (raw: string) => void;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: "card" | "list";
  setViewModeState: React.Dispatch<React.SetStateAction<"card" | "list">>;
  setLinkViewMode: (mode: "card" | "list") => Promise<void>;
  groupedLinks: Record<CustomLinkType, CustomLink[]>;
  sites: CustomLink[];
  linkTypeLabel: (type: CustomLinkType) => string;
  getFaviconUrl: (url: string) => string;
  LinkThumb: React.FC<{ link: CustomLink }>;
  openEditModal: (link: CustomLink, e: React.MouseEvent) => void;
  handleDeleteLink: (id: string, e: React.MouseEvent) => void;
  linkDataMenuOpen: boolean;
  setLinkDataMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  exportLinks: () => void;
  openLinkImportPicker: () => void;
  linkDataMenuRef: React.RefObject<HTMLDivElement>;
  linkImportInputRef: React.RefObject<HTMLInputElement>;
  handleLinkImportFile: (file: File | null) => void;
  linkImportError: string | null;
  todoDraft: string;
  setTodoDraft: React.Dispatch<React.SetStateAction<string>>;
  addTodo: () => void;
  todoMenuOpen: boolean;
  setTodoMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  exportTodos: () => void;
  openTodoImportPicker: () => void;
  todoMenuRef: React.RefObject<HTMLDivElement>;
  todoImportInputRef: React.RefObject<HTMLInputElement>;
  handleTodoImportFile: (file: File | null) => void;
  todoImportError: string | null;
  pendingTodos: TodoWatchItem[];
  doneTodos: TodoWatchItem[];
  todoAnimateId: string | null;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
};

export function HomeSection(props: HomeSectionProps) {
  const {
    lang, tx, now, timeGreeting, heroName, editingHeroName, setEditingHeroName, heroNameDraft,
    setHeroNameDraft, commitHeroName, query, setQuery, setShowAddModal, viewMode, setViewModeState,
    setLinkViewMode, groupedLinks, sites, linkTypeLabel, getFaviconUrl, LinkThumb, openEditModal, handleDeleteLink,
    linkDataMenuOpen, setLinkDataMenuOpen, exportLinks, openLinkImportPicker, linkDataMenuRef, linkImportInputRef,
    handleLinkImportFile, linkImportError,
    todoDraft, setTodoDraft, addTodo, todoMenuOpen, setTodoMenuOpen, exportTodos, openTodoImportPicker,
    todoMenuRef, todoImportInputRef, handleTodoImportFile, todoImportError, pendingTodos, doneTodos, todoAnimateId,
    toggleTodo, removeTodo,
  } = props;
  return (
    
                <>
                  <div className="hero glass">
                    <div className="hero-grid">
                      <div className="hero-left">
                        <h2 className="hero-title">
                          {timeGreeting},{" "}
                          {editingHeroName ? (
                            <input
                              className="hero-name-input"
                              value={heroNameDraft}
                              onChange={(e) => setHeroNameDraft(e.target.value)}
                              onBlur={() => commitHeroName(heroNameDraft)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitHeroName(heroNameDraft);
                                if (e.key === "Escape") {
                                  setHeroNameDraft(heroName);
                                  setEditingHeroName(false);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <button
                              type="button"
                              className="hero-name-btn"
                              onClick={() => setEditingHeroName(true)}
                              title={tx("Klik untuk ganti nama", "Click to edit name")}
                              aria-label={tx("Edit nama", "Edit name")}
                            >
                              {heroName}
                            </button>
                          )}
                          !
                        </h2>
                        <p className="hero-subtitle">
                          {lang === "en"
                            ? "Enjoy your MeTime. Add site to your list and customize your experience."
                            : "Nikmati MeTime kamu. Tambahkan situs ke daftar dan sesuaikan pengalamanmu."}
                        </p>
                      </div>
                      <div className="hero-right">
                        <div className="clock glass">
                          <div className="clock-time">
                            {now.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="clock-date">
                            {now.toLocaleDateString([], {
                              weekday: "long",
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="content-grid">
                    <section className="panel-8">
                      <div
                        className="panel-head"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: '16px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <input
                            className="search-input"
                            placeholder={tx("Cari situs…", "Search sites…")}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              width: '100%', 
                              padding: '8px 12px', 
                              fontSize: '1.1rem', 
                              fontWeight: 700, 
                              color: 'var(--text)',
                              outline: 'none',
                              boxShadow: 'none'
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="panel-icon-btn"
                            onClick={() => setShowAddModal(true)}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                          <button
                            className="panel-icon-btn"
                            onClick={() => {
                              const next =
                                viewMode === "card" ? "list" : "card";
                              setViewModeState(next);
                              void setLinkViewMode(next);
                            }}
                            title={
                              viewMode === "card"
                                ? tx("Ganti ke tampilan list", "Switch to list view")
                                : tx("Ganti ke tampilan kartu", "Switch to card view")
                            }
                          >
                            {viewMode === "card" ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="8" y1="6" x2="21" y2="6" />
                                <line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" />
                                <line x1="3" y1="12" x2="3.01" y2="12" />
                                <line x1="3" y1="18" x2="3.01" y2="18" />
                              </svg>
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                              </svg>
                            )}
                          </button>

                          <div className="todo-actions" ref={linkDataMenuRef}>
                            <button
                              type="button"
                              className="panel-icon-btn"
                              onClick={() => setLinkDataMenuOpen((v) => !v)}
                              aria-label={tx("Opsi data link", "Link data options")}
                              title={tx("Opsi data link", "Link data options")}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>

                            {linkDataMenuOpen && (
                              <div className="todo-menu" role="menu" aria-label={tx("Menu data link", "Link data menu")}>
                                <button
                                  type="button"
                                  className="todo-menu-item"
                                  onClick={() => {
                                    setLinkDataMenuOpen(false);
                                    exportLinks();
                                  }}
                                >
                                  {tx("Export data link", "Export data link")}
                                </button>
                                <button
                                  type="button"
                                  className="todo-menu-item"
                                  onClick={openLinkImportPicker}
                                >
                                  {tx("Import data link", "Import data link")}
                                </button>
                              </div>
                            )}

                            <input
                              ref={linkImportInputRef}
                              type="file"
                              accept="application/json,.json"
                              style={{ display: "none" }}
                              onChange={(e) =>
                                handleLinkImportFile(e.target.files?.[0] ?? null)
                              }
                            />
                          </div>
                        </div>
                      </div>
                      {linkImportError && (
                        <div
                          className="empty-state glass"
                          style={{ marginTop: 10, padding: "12px 14px" }}
                        >
                          {linkImportError}
                        </div>
                      )}
                      <div
                        className={
                          viewMode === "card" ? "site-grid" : "site-list-view"
                        }
                      >
                        {Object.entries(groupedLinks).map(([type, items]) => (
                          <React.Fragment key={type}>
                            {items.length > 0 && (
                              <div className="category-header" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                                <span style={{ 
                                  textTransform: 'uppercase', 
                                  fontWeight: 800, 
                                  fontSize: '0.7rem', 
                                  letterSpacing: '1px',
                                  color: '#1a1f36',
                                  background: 'rgba(255, 255, 255, 0.15)', 
                                  backdropFilter: 'blur(12px)', 
                                  padding: '4px 14px', 
                                  borderRadius: '20px', 
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                }}>{linkTypeLabel(type as CustomLinkType)}</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--text)', opacity: 0.1 }} />
                              </div>
                            )}
                            {items.map((s) => (
                              <a
                                key={s.id}
                            className={
                              viewMode === "card"
                                ? "site-card glass"
                                : "list-link-item glass"
                            }
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {viewMode === "card" ? (
                              <>
                                <div
                                  className="site-card-thumb"
                                >
                                  <LinkThumb link={s} />
                                  <img
                                    className="site-card-favicon"
                                    src={getFaviconUrl(s.url)}
                                    alt=""
                                  />
                                </div>
                                <div className="site-card-meta">
                                  <div className="site-card-title">
                                    {s.title}
                                  </div>
                                  <div className="site-card-url-row">
                                    <div className="site-card-url">
                                      {new URL(s.url).hostname.replace(
                                        "www.",
                                        "",
                                      )}
                                    </div>
                                    {typeof s.siteName === "string" &&
                                    s.siteName.trim().length > 0 ? (
                                      <div className="site-card-site">
                                        {s.siteName.trim()}
                                      </div>
                                    ) : null}
                                  </div>
                                  {typeof s.description === "string" &&
                                  s.description.trim().length > 0 ? (
                                    <div className="site-card-desc">
                                      {s.description.trim()}
                                    </div>
                                  ) : null}
                                </div>
                              </>
                            ) : (
                              <div className="list-link-layout">
                                <div className="list-link-info">
                                  <div className="list-link-title">
                                    {s.title}
                                  </div>
                                  <div className="list-link-url">{s.url}</div>
                                </div>
                                <div className="list-link-actions">
                                  <button
                                    className="list-action-btn"
                                    onClick={(e) => openEditModal(s, e)}
                                    title="Edit"
                                  >
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    className="list-action-btn list-action-btn--danger"
                                    onClick={(e) => handleDeleteLink(s.id, e)}
                                    title="Delete"
                                  >
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </a>
                        ))}
                      </React.Fragment>
                    ))}
                        {sites.length === 0 && (
                          <div className="empty-state glass">
                            {tx("Belum ada situs yang ditambahkan.", "No sites added yet.")}
                          </div>
                        )}
                      </div>
                    </section>

                    <aside className="panel-4">
                      <div className="panel-head">
                        <div className="todo-add todo-add--head">
                          <input
                            className="search-input" 
                            placeholder={tx("Tambah Tontonan...", "Add a watchlist...")}
                            value={todoDraft}
                            onChange={(e) => setTodoDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addTodo();
                            }}
                          />
                          <div className="todo-actions" ref={todoMenuRef}>
                            <button
                              className="btn todo-split-btn"
                              style={{
                                background: "var(--accent)",
                                color: "#fff",
                                border: "none",
                              }}
                              onClick={addTodo}
                              disabled={!todoDraft.trim()}
                            >
                              {tx("Tambah", "Add")}
                            </button>
                            <button
                              type="button"
                              className="btn todo-split-caret"
                              style={{
                                background: "var(--accent)",
                                color: "#fff",
                                border: "none",
                              }}
                              aria-haspopup="menu"
                              aria-expanded={todoMenuOpen}
                              title={tx("Import / Export", "Import / Export")}
                              onClick={() => setTodoMenuOpen((v) => !v)}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>
                            {todoMenuOpen && (
                              <div className="todo-menu" role="menu">
                                <button
                                  type="button"
                                  className="todo-menu-item"
                                  role="menuitem"
                                  onClick={() => {
                                    setTodoMenuOpen(false);
                                    exportTodos();
                                  }}
                                >
                                  {tx("Export ToDo List", "Export ToDo List")}
                                </button>
                                <button
                                  type="button"
                                  className="todo-menu-item"
                                  role="menuitem"
                                  onClick={openTodoImportPicker}
                                >
                                  {tx("Import ToDo List", "Import ToDo List")}
                                </button>
                              </div>
                            )}
                          </div>
                        </div> 
                      </div>
                      <input
                        ref={todoImportInputRef}
                        type="file"
                        accept="application/json,.json"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          handleTodoImportFile(e.target.files?.[0] || null)
                        }
                      />
                      {todoImportError && (
                        <div
                          className="empty-state glass"
                          style={{ marginTop: 10, padding: "12px 14px" }}
                        >
                          {todoImportError}
                        </div>
                      )}
                      <div className="todo-sections">
                        <div className="todo-card glass">
                          <div className="todo-card-head">
                            <div className="todo-card-title">
                              {tx("Belum Selesai", "Pending")}
                            </div>
                            <div className="todo-card-meta">{pendingTodos.length}</div>
                          </div>
                          {pendingTodos.length === 0 ? (
                            <div className="empty-state" style={{ marginTop: 10 }}>
                              {tx("Belum ada todo.", "No todos yet.")}
                            </div>
                          ) : (
                            <div className="todo-checklist-scroll">
                              <div className="todo-checklist">
                                {pendingTodos.map((t) => {
                                  const inputId = `todo_${t.id}`;
                                  return (
                                    <React.Fragment key={t.id}>
                                      <input
                                        type="checkbox"
                                        id={inputId}
                                        checked={t.done}
                                        data-animate={
                                          todoAnimateId === t.id ? "1" : undefined
                                        }
                                        onChange={() => toggleTodo(t.id)}
                                      />
                                      <label htmlFor={inputId}>{t.text}</label>
                                      <button
                                        type="button"
                                        className="todo-remove"
                                        onClick={() => removeTodo(t.id)}
                                        aria-label={tx("Hapus todo", "Remove todo")}
                                        title={tx("Hapus", "Remove")}
                                      >
                                        ✕
                                      </button>
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {doneTodos.length > 0 && (
                          <div className="todo-card glass">
                            <div className="todo-card-head">
                              <div className="todo-card-title">
                                {tx("Selesai", "Done")}
                              </div>
                              <div className="todo-card-meta">{doneTodos.length}</div>
                            </div>
                            <div className="todo-checklist-scroll">
                              <div className="todo-checklist">
                                {doneTodos.map((t) => {
                                  const inputId = `todo_${t.id}`;
                                  return (
                                    <React.Fragment key={t.id}>
                                      <input
                                        type="checkbox"
                                        id={inputId}
                                        checked={t.done}
                                        data-animate={
                                          todoAnimateId === t.id ? "1" : undefined
                                        }
                                        onChange={() => toggleTodo(t.id)}
                                      />
                                      <label htmlFor={inputId}>{t.text}</label>
                                      <button
                                        type="button"
                                        className="todo-remove"
                                        onClick={() => removeTodo(t.id)}
                                        aria-label={tx("Hapus todo", "Remove todo")}
                                        title={tx("Hapus", "Remove")}
                                      >
                                        ✕
                                      </button>
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </aside>
                  </div>
                </>
  );
}

