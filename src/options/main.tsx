import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./options.css";
import { DEFAULT_SETTINGS } from "../shared/defaults";
import type { ExtensionSettings, LinkMetadata } from "../shared/types";
import { broadcastSettings } from "../shared/messaging";
import {
  clearOptionsBg,
  clearOptionsBgNoon,
  clearOptionsBgNight,
  getAllDomainStates,
  getOptionsBg,
  getOptionsBgNoon,
  getOptionsBgNight,
  getSettings,
  getUiMode,
  getLanguage,
  getHeroName,
  removeDomainState,
  setDomainState,
  saveSettings,
  setLanguage,
  setHeroName,
  setOptionsBg,
  setOptionsBgNoon,
  setOptionsBgNight,
  setUiMode as saveUiMode,
  getCustomLinks,
  saveCustomLinks,
  getLinkViewMode,
  setLinkViewMode,
  getTodoWatchlist,
  saveTodoWatchlist,
  type CustomLink,
  type CustomLinkType,
  type ThumbnailType,
  type TodoWatchItem,
} from "../shared/storage";
import type { SectionKey } from "./sectionKey";
import { LeftPanel, type NavItem } from "./components/LeftPanel";
import { HomeSection } from "./sections/HomeSection";
import { GeneralSection } from "./sections/GeneralSection";
import { SubtitleSection } from "./sections/SubtitleSection";
import { AdblockSection } from "./sections/AdblockSection";
import { DomainsSection } from "./sections/DomainsSection";
import { ShortcutsSection } from "./sections/ShortcutsSection";
import { AboutSection } from "./sections/AboutSection";

function IconHome() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10.5 12 4l8 6.5V20a2 2 0 0 1-2 2h-4v-6H10v6H6a2 2 0 0 1-2-2v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 7h8M6 17h12M6 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15 7v0M10 12v0M14 17v0"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSubtitles() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 11h4M7 14h7M13 11h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3 20 7v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V7l8-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M2 12h20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 2c2.6 2.8 4 6.1 4 10s-1.4 7.2-4 10c-2.6-2.8-4-6.1-4-10s1.4-7.2 4-10Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconKeyboard() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 8h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01M7 15h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 11v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 7h.01"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function App() {
  const [section, setSection] = useState<SectionKey>("home");
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [domains, setDomains] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [uiMode, setUiModeState] = useState<"noon" | "night">("noon");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [heroName, setHeroNameState] = useState("Streamer");
  const [editingHeroName, setEditingHeroName] = useState(false);
  const [heroNameDraft, setHeroNameDraft] = useState("Streamer");
  const [now, setNow] = useState(() => new Date());
  const [noonBgUrl, setNoonBgUrl] = useState<string>("/backgrounds/bg.jpg");
  const [nightBgUrl, setNightBgUrl] = useState<string>(
    "/backgrounds/bg-night.png",
  );
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [viewMode, setViewModeState] = useState<"card" | "list">("card");
  const [todoItems, setTodoItems] = useState<TodoWatchItem[]>([]);
  const [todoDraft, setTodoDraft] = useState("");
  const [todoMenuOpen, setTodoMenuOpen] = useState(false);
  const [linkDataMenuOpen, setLinkDataMenuOpen] = useState(false);
  const [todoImportModalOpen, setTodoImportModalOpen] = useState(false);
  const [todoImportFileName, setTodoImportFileName] = useState("");
  const [todoImportError, setTodoImportError] = useState<string | null>(null);
  const [linkImportError, setLinkImportError] = useState<string | null>(null);
  const [linkImportModalOpen, setLinkImportModalOpen] = useState(false);
  const [linkImportFileName, setLinkImportFileName] = useState("");
  const [todoAnimateId, setTodoAnimateId] = useState<string | null>(null);
  const [linkImportPreview, setLinkImportPreview] = useState<{
    items: CustomLink[];
    rawCount: number;
    newCount: number;
    dupCount: number;
  } | null>(null);
  const [todoImportPreview, setTodoImportPreview] = useState<{
    items: TodoWatchItem[];
    rawCount: number;
    pendingCount: number;
    doneCount: number;
  } | null>(null);
  const todoMenuRef = useRef<HTMLDivElement | null>(null);
  const todoImportInputRef = useRef<HTMLInputElement | null>(null);
  const linkDataMenuRef = useRef<HTMLDivElement | null>(null);
  const linkImportInputRef = useRef<HTMLInputElement | null>(null);
  const todoAnimateTimerRef = useRef<number | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkDescription, setNewLinkDescription] = useState("");
  const [newLinkType, setNewLinkType] = useState<CustomLinkType>("movie");
  const [newLinkThumbnailType, setNewLinkThumbnailType] = useState<ThumbnailType>("link");
  const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
  const [modalPreview, setModalPreview] = useState("");

  const normalizeUrl = (rawUrl: string): string => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : "https://" + trimmed;
  };

  const getScreenshotPreviewUrl = (rawUrl: string): string => {
    const url = normalizeUrl(rawUrl);
    if (!url) return "";
    return `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=800`;
  };

  const getLinkThumbUrl = (link: CustomLink): string => {
    const dataUrl =
      typeof link.imageDataUrl === "string" ? link.imageDataUrl.trim() : "";
    if (dataUrl) return dataUrl;
    const img = typeof link.image === "string" ? link.image.trim() : "";
    return img.length > 0 ? img : getScreenshotPreviewUrl(link.url);
  };

  const LinkThumb = ({ link }: { link: CustomLink }) => {
    const candidates = useMemo(() => {
      if (link.thumbnailType === "default") {
        return ["/backgrounds/movie-clip.png"];
      }
      const list = [
        typeof link.imageDataUrl === "string" ? link.imageDataUrl.trim() : "",
        typeof link.image === "string" ? link.image.trim() : "",
        getScreenshotPreviewUrl(link.url),
      ].filter((v) => v.length > 0);
      return list;
    }, [link.imageDataUrl, link.image, link.url, link.thumbnailType]);

    const [prevCandidates, setPrevCandidates] = useState(candidates.join("|"));
    const [idx, setIdx] = useState(0);

    const currentCandidatesStr = candidates.join("|");
    if (prevCandidates !== currentCandidatesStr) {
      setPrevCandidates(currentCandidatesStr);
      setIdx(0);
    }

    const src = candidates[idx] || "";

    if (!src) {
      return (
        <div className="site-card-thumb-placeholder" aria-hidden="true">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
      );
    }

    return (
      <img
        className={`site-card-thumb-img ${link.thumbnailType === 'default' ? 'is-default' : ''}`}
        src={src}
        alt=""
        loading="lazy"
        onError={() => {
          if (idx + 1 < candidates.length) setIdx(idx + 1);
          else setIdx(candidates.length);
        }}
      />
    );
  };

  const splitImageValue = (
    value: string,
  ): { imageDataUrl?: string; image?: string } => {
    const v = (value || "").trim();
    if (!v) return {};
    if (v.startsWith("data:")) return { imageDataUrl: v };
    return { image: v };
  };

  const fetchLinkMeta = async (url: string): Promise<LinkMetadata> => {
    try {
      const normalizedUrl = normalizeUrl(url);
      if (!normalizedUrl) {
        return {
          url: "",
          hostname: "",
          title: "",
          description: "",
          image: "",
          imageDataUrl: "",
          siteName: "",
        };
      }
      const res = await chrome.runtime.sendMessage({
        type: "VE_FETCH_OG",
        url: normalizedUrl,
      });
      return {
        url: typeof res?.url === "string" ? res.url : normalizedUrl,
        hostname: typeof res?.hostname === "string" ? res.hostname : "",
        title: typeof res?.title === "string" ? res.title : "",
        description: typeof res?.description === "string" ? res.description : "",
        image: typeof res?.image === "string" ? res.image.trim() : "",
        imageDataUrl:
          typeof res?.imageDataUrl === "string" ? res.imageDataUrl.trim() : "",
        siteName: typeof res?.siteName === "string" ? res.siteName : "",
      };
    } catch {
      return {
        url: "",
        hostname: "",
        title: "",
        description: "",
        image: "",
        imageDataUrl: "",
        siteName: "",
      };
    }
  };

  const fetchPreviewMeta = async (
    url: string,
  ): Promise<{
    title: string;
    description: string;
    siteName: string;
    hostname: string;
    image: string;
    imageDataUrl: string;
    imageUrl: string;
  }> => {
    const meta = await fetchLinkMeta(url);
    const hostname = (meta.hostname || "").trim();
    const title = (meta.title || "").trim();
    const description = (meta.description || "").trim();
    const siteName = (meta.siteName || "").trim();
    const imageDataUrl = (meta.imageDataUrl || "").trim();
    const imageUrl = (meta.image || "").trim();
    const image =
      imageDataUrl || imageUrl || getScreenshotPreviewUrl(url);
    return { title, description, siteName, hostname, image, imageDataUrl, imageUrl };
  };

  const getFaviconUrl = (url: string) => {
    try {
      return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=64`;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!showAddModal && !editingLink) {
      setModalPreview("");
      return;
    }
    const url = newLinkUrl.trim();
    if (url.length < 8) {
      setModalPreview("");
      return;
    }
    const timer = setTimeout(() => {
      void fetchPreviewMeta(url).then((meta) => setModalPreview(meta.image));
    }, 600);
    return () => clearTimeout(timer);
  }, [newLinkUrl, showAddModal, editingLink]);

  const viewportBgUrl = uiMode === "noon" ? noonBgUrl : nightBgUrl;

  const navItems = useMemo<NavItem[]>(
    () => [
      { key: "home", label: lang === "en" ? "Home" : "Home", icon: <IconHome /> },
      {
        key: "general",
        label: lang === "en" ? "General" : "Umum",
        icon: <IconSettings />,
      },
      { key: "subtitle", label: "Subtitle", icon: <IconSubtitles /> },
      {
        key: "adblock",
        label: lang === "en" ? "Ad Block" : "Blok Iklan",
        icon: <IconShield />,
      },
      {
        key: "domains",
        label: lang === "en" ? "Domains" : "Domain",
        icon: <IconGlobe />,
      },
      {
        key: "shortcuts",
        label: lang === "en" ? "Shortcuts" : "Shortcut",
        icon: <IconKeyboard />,
      },
      { key: "about", label: lang === "en" ? "About" : "Tentang", icon: <IconInfo /> },
    ],
    [lang],
  );

  const sites = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? customLinks.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.url.toLowerCase().includes(q),
        )
      : customLinks;
  }, [query, customLinks]);

  const pendingTodos = useMemo(() => {
    const list = todoItems.filter((t) => !t.done);
    list.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    return list;
  }, [todoItems]);

  const doneTodos = useMemo(() => {
    const list = todoItems.filter((t) => t.done);
    // Urutkan berdasarkan yang paling baru selesai (updatedAt saat toggle).
    list.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    return list;
  }, [todoItems]);

  useEffect(() => {
    void (async () => {
      setSettings(await getSettings());
      void refreshDomains();

      const mode = await getUiMode();
      setUiModeState(mode);

      setLang(await getLanguage());
      const hn = await getHeroName();
      setHeroNameState(hn);
      setHeroNameDraft(hn);

      const noonBg = await getOptionsBgNoon();
      if (typeof noonBg === "string" && noonBg.length > 0) setNoonBgUrl(noonBg);
      const nightBg = await getOptionsBgNight();
      if (typeof nightBg === "string" && nightBg.length > 0)
        setNightBgUrl(nightBg);

      const links = await getCustomLinks();
      setCustomLinks(links);

      setTodoItems(await getTodoWatchlist());

      let needsUpdate = false;
      const updatedLinks = [...links];
      for (let i = 0; i < updatedLinks.length; i++) {
        const link = updatedLinks[i];
        if (!link) continue;
        const existingImg = typeof link.image === "string" ? link.image.trim() : "";
        const existingImgDataUrl =
          typeof link.imageDataUrl === "string" ? link.imageDataUrl.trim() : "";
        const existingDesc =
          typeof link.description === "string" ? link.description.trim() : "";
        const existingSiteName =
          typeof link.siteName === "string" ? link.siteName.trim() : "";
        if (!existingImgDataUrl || (!existingImg && !existingImgDataUrl) || !existingDesc || !existingSiteName) {
          try {
            const normalizedUrl = normalizeUrl(link.url);
            if (!normalizedUrl) continue;
            const meta = await fetchLinkMeta(normalizedUrl);
            const imgUrl = (meta.image || "").trim();
            const imgDataUrl = (meta.imageDataUrl || "").trim();
            const desc = (meta.description || "").trim();
            const siteName = (meta.siteName || "").trim();

            const next: CustomLink = {
              ...link,
              image: imgUrl || link.image,
              imageDataUrl: imgDataUrl || link.imageDataUrl,
              description: desc || link.description,
              siteName: siteName || link.siteName,
            };

            if (
              next.image !== link.image ||
              next.imageDataUrl !== link.imageDataUrl ||
              next.description !== link.description ||
              next.siteName !== link.siteName
            ) {
              updatedLinks[i] = next;
              needsUpdate = true;
            }
          } catch {
             // Silently catch background script messaging errors
          }
        }
      }
      if (needsUpdate) {
        setCustomLinks(updatedLinks);
        void saveCustomLinks(updatedLinks);
      }
      setViewModeState(await getLinkViewMode());
    })();
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!todoMenuOpen) return;
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = todoMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setTodoMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => {
      // TS DOM lib doesn't like matching options object identity; cast to any.
      window.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      } as any);
    };
  }, [todoMenuOpen]);

  useEffect(() => {
    if (!linkDataMenuOpen) return;
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = linkDataMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setLinkDataMenuOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      } as any);
    };
  }, [linkDataMenuOpen]);

  useEffect(() => {
    return () => {
      if (todoAnimateTimerRef.current) {
        window.clearTimeout(todoAnimateTimerRef.current);
        todoAnimateTimerRef.current = null;
      }
    };
  }, []);

  const save = (next: ExtensionSettings) => {
    setSettings(next);
    void (async () => {
      await saveSettings(next);
      await broadcastSettings(next);
    })();
  };

  const persistTodos = (next: TodoWatchItem[]) => {
    setTodoItems(next);
    void saveTodoWatchlist(next);
  };

  const makeTodoId = (): string => {
    try {
      // In MV3 extension pages, `crypto.randomUUID` is available in modern Chromium.
      // Fall back gracefully for older engines.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyCrypto: any = crypto;
      if (typeof anyCrypto?.randomUUID === "function") return anyCrypto.randomUUID();
    } catch {
      // ignore
    }
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  };

  const addTodo = () => {
    const text = todoDraft.trim();
    if (!text) return;
    const nowMs = Date.now();
    const next: TodoWatchItem[] = [
      { id: makeTodoId(), text, done: false, createdAt: nowMs, updatedAt: nowMs },
      ...todoItems,
    ];
    persistTodos(next.slice(0, 100));
    setTodoDraft("");
  };

  const toggleTodo = (id: string) => {
    const nowMs = Date.now();
    const next = todoItems.map((t) =>
      t.id === id ? { ...t, done: !t.done, updatedAt: nowMs } : t,
    );
    const changed = next.find((t) => t.id === id);
    if (changed?.done) {
      setTodoAnimateId(id);
      if (todoAnimateTimerRef.current) {
        window.clearTimeout(todoAnimateTimerRef.current);
      }
      todoAnimateTimerRef.current = window.setTimeout(() => {
        setTodoAnimateId(null);
        todoAnimateTimerRef.current = null;
      }, 700);
    }
    persistTodos(next);
  };

  const removeTodo = (id: string) => {
    persistTodos(todoItems.filter((t) => t.id !== id));
  };

  const normalizeTodoImport = (raw: unknown): TodoWatchItem[] => {
    const nowMs = Date.now();
    const list = Array.isArray(raw) ? raw : [];
    const out: TodoWatchItem[] = [];
    for (const it of list) {
      if (!it || typeof it !== "object") continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyIt: any = it;
      const text =
        typeof anyIt.text === "string"
          ? anyIt.text.trim()
          : String(anyIt.text ?? "").trim();
      if (!text) continue;
      const id =
        typeof anyIt.id === "string" && anyIt.id.trim().length > 0
          ? anyIt.id.trim()
          : makeTodoId();
      const done = Boolean(anyIt.done);
      const createdAt =
        typeof anyIt.createdAt === "number" && Number.isFinite(anyIt.createdAt)
          ? anyIt.createdAt
          : nowMs;
      const updatedAt =
        typeof anyIt.updatedAt === "number" && Number.isFinite(anyIt.updatedAt)
          ? anyIt.updatedAt
          : createdAt;
      out.push({ id, text, done, createdAt, updatedAt });
      if (out.length >= 100) break;
    }
    return out;
  };

  const makeTodoBackupPayload = () => ({
    type: "stream-pal.todo-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    todos: todoItems,
  });

  const normalizeLinkImport = (raw: unknown): CustomLink[] => {
    const list = Array.isArray(raw) ? raw : [];
    const out: CustomLink[] = [];
    for (const it of list) {
      if (!it || typeof it !== "object") continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyIt: any = it;

      let url =
        typeof anyIt.url === "string"
          ? anyIt.url.trim()
          : String(anyIt.url ?? "").trim();
      if (!url) continue;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      let title =
        typeof anyIt.title === "string"
          ? anyIt.title.trim()
          : String(anyIt.title ?? "").trim();
      if (!title) {
        try {
          title = new URL(url).hostname.replace("www.", "");
          title = title.charAt(0).toUpperCase() + title.slice(1);
        } catch {
          title = url;
        }
      }

      const rawType = typeof anyIt.type === "string" ? anyIt.type : undefined;
      const type: CustomLinkType =
        rawType === "film"
          ? "movie"
          : rawType === "movie" || rawType === "musik" || rawType === "tools"
            ? rawType
            : "movie";

      const rawThumbType =
        typeof anyIt.thumbnailType === "string" ? anyIt.thumbnailType : undefined;
      const thumbnailType: ThumbnailType =
        rawThumbType === "default" || rawThumbType === "link"
          ? rawThumbType
          : "link";

      const id =
        typeof anyIt.id === "string" && anyIt.id.trim().length > 0
          ? anyIt.id.trim()
          : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

      const image =
        typeof anyIt.image === "string" ? anyIt.image.trim() : undefined;
      const imageDataUrl =
        typeof anyIt.imageDataUrl === "string"
          ? anyIt.imageDataUrl.trim()
          : undefined;
      const description =
        typeof anyIt.description === "string"
          ? anyIt.description.trim()
          : undefined;
      const siteName =
        typeof anyIt.siteName === "string" ? anyIt.siteName.trim() : undefined;

      out.push({
        id,
        title,
        url,
        type,
        thumbnailType,
        ...(image ? { image } : {}),
        ...(imageDataUrl ? { imageDataUrl } : {}),
        ...(description ? { description } : {}),
        ...(siteName ? { siteName } : {}),
      });

      if (out.length >= 500) break;
    }
    return out;
  };

  const makeLinksBackupPayload = () => ({
    type: "stream-pal.links-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    links: customLinks,
  });

  const normalizeLinkKey = (url: string): string =>
    url.trim().toLowerCase().replace(/\/$/, "");

  const exportLinks = () => {
    const payload = makeLinksBackupPayload();
    const pretty = JSON.stringify(payload, null, 2);
    const blob = new Blob([pretty], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `stream-pal-links-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const openLinkImportPicker = () => {
    setLinkDataMenuOpen(false);
    setLinkImportError(null);
    setLinkImportPreview(null);
    setLinkImportFileName("");
    if (linkImportInputRef.current) linkImportInputRef.current.value = "";
    linkImportInputRef.current?.click();
  };

  const handleLinkImportFile = (file: File | null) => {
    if (!file) return;
    setLinkImportError(null);
    setLinkImportPreview(null);
    setLinkImportFileName(file.name || "");

    const reader = new FileReader();
    reader.onerror = () => {
      setLinkImportError(tx("Gagal membaca file.", "Failed to read file."));
    };
    reader.onload = () => {
      const rawText = typeof reader.result === "string" ? reader.result : "";
      try {
        const parsed = JSON.parse(rawText) as unknown;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyParsed: any = parsed as any;
        const rawLinks = Array.isArray(parsed)
          ? parsed
          : Array.isArray(anyParsed?.links)
            ? anyParsed.links
            : Array.isArray(anyParsed?.customLinks)
              ? anyParsed.customLinks
              : null;

        if (!rawLinks) {
          setLinkImportError(
            tx(
              "Format backup tidak dikenali. Harus berupa array link atau objek dengan properti `links`.",
              "Unrecognized backup format. Expected an array of links or an object with a `links` property.",
            ),
          );
          return;
        }

        const normalized = normalizeLinkImport(rawLinks);
        if (normalized.length === 0) {
          setLinkImportError(
            tx("Tidak ada data link valid.", "No valid link data found."),
          );
          return;
        }

        const existingKeys = new Set(customLinks.map((l) => normalizeLinkKey(normalizeUrl(l.url))));
        const newItems: CustomLink[] = [];
        let dupCount = 0;
        for (const l of normalized) {
          const key = normalizeLinkKey(normalizeUrl(l.url));
          if (existingKeys.has(key)) {
            dupCount++;
            continue;
          }
          existingKeys.add(key);
          newItems.push(l);
        }

        if (newItems.length === 0) {
          setLinkImportError(
            tx(
              "Semua link di file sudah ada. Tidak ada yang di-import.",
              "All links in the file already exist. Nothing to import.",
            ),
          );
          return;
        }

        setLinkImportPreview({
          items: newItems,
          rawCount: rawLinks.length,
          newCount: newItems.length,
          dupCount,
        });
        setLinkImportModalOpen(true);
      } catch {
        setLinkImportError(tx("JSON tidak valid.", "Invalid JSON."));
      }
    };
    reader.readAsText(file);
  };

  const confirmLinkImport = () => {
    if (!linkImportPreview) return;
    const existingKeys = new Set(customLinks.map((l) => normalizeLinkKey(normalizeUrl(l.url))));
    const freshNewItems = linkImportPreview.items.filter((l) => {
      const key = normalizeLinkKey(normalizeUrl(l.url));
      if (existingKeys.has(key)) return false;
      existingKeys.add(key);
      return true;
    });
    if (freshNewItems.length > 0) {
      const merged = [...customLinks, ...freshNewItems];
      setCustomLinks(merged);
      void saveCustomLinks(merged);
    }
    setLinkImportModalOpen(false);
    setLinkImportPreview(null);
    setLinkImportError(null);
    setLinkImportFileName("");
    if (linkImportInputRef.current) linkImportInputRef.current.value = "";
  };

  const exportTodos = () => {
    const payload = makeTodoBackupPayload();
    const pretty = JSON.stringify(payload, null, 2);
    const blob = new Blob([pretty], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `stream-pal-todos-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const openTodoImportPicker = () => {
    setTodoMenuOpen(false);
    setTodoImportError(null);
    setTodoImportPreview(null);
    setTodoImportFileName("");
    if (todoImportInputRef.current) todoImportInputRef.current.value = "";
    todoImportInputRef.current?.click();
  };

  const handleTodoImportFile = (file: File | null) => {
    if (!file) return;
    setTodoImportError(null);
    setTodoImportPreview(null);
    setTodoImportFileName(file.name || "");

    const reader = new FileReader();
    reader.onerror = () => {
      setTodoImportError(tx("Gagal membaca file.", "Failed to read file."));
    };
    reader.onload = () => {
      const rawText = typeof reader.result === "string" ? reader.result : "";
      try {
        const parsed = JSON.parse(rawText) as unknown;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyParsed: any = parsed as any;
        const rawTodos = Array.isArray(parsed)
          ? parsed
          : Array.isArray(anyParsed?.todos)
            ? anyParsed.todos
            : null;
        if (!rawTodos) {
          setTodoImportError(
            tx(
              "Format backup tidak dikenali. Harus berupa array todo atau objek dengan properti `todos`.",
              "Unrecognized backup format. Expected an array of todos or an object with a `todos` property.",
            ),
          );
          return;
        }
        const normalized = normalizeTodoImport(rawTodos);
        const pendingCount = normalized.filter((t) => !t.done).length;
        const doneCount = normalized.length - pendingCount;
        setTodoImportPreview({
          items: normalized,
          rawCount: rawTodos.length,
          pendingCount,
          doneCount,
        });
        setTodoImportModalOpen(true);
      } catch {
        setTodoImportError(tx("JSON tidak valid.", "Invalid JSON."));
      }
    };
    reader.readAsText(file);
  };

  const confirmTodoImport = () => {
    if (!todoImportPreview) return;
    persistTodos(todoImportPreview.items);
    setTodoImportModalOpen(false);
    setTodoImportPreview(null);
    setTodoImportError(null);
    setTodoImportFileName("");
    if (todoImportInputRef.current) todoImportInputRef.current.value = "";
  };

  const patch = (partial: Partial<ExtensionSettings>) =>
    save({ ...settings, ...partial });

  async function refreshDomains() {
    setDomains(await getAllDomainStates());
  }

  const domainRows = useMemo(
    () => Object.entries(domains).sort(([a], [b]) => a.localeCompare(b)),
    [domains],
  );

  const importBgFromFile = (file: File | null, target: "noon" | "night") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      if (target === "noon") {
        setNoonBgUrl(dataUrl);
        void setOptionsBgNoon(dataUrl);
      } else {
        setNightBgUrl(dataUrl);
        void setOptionsBgNight(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetBgToDefault = (target: "noon" | "night") => {
    if (target === "noon") {
      setNoonBgUrl("/backgrounds/bg.jpg");
      void clearOptionsBgNoon();
    } else {
      setNightBgUrl("/backgrounds/bg-night.png");
      void clearOptionsBgNight();
    }
  };

  const toggleMode = () => {
    const next = uiMode === "noon" ? "night" : "noon";
    setUiModeState(next);
    void saveUiMode(next);
  };

  const toggleLang = () => {
    const next = lang === "id" ? "en" : "id";
    setLang(next);
    void setLanguage(next);
  };

  const tx = (idText: string, enText: string): string =>
    lang === "en" ? enText : idText;

  const timeGreeting = useMemo(() => {
    const h = now.getHours();
    // 04-10 pagi, 11-14 siang, 15-18 sore, selebihnya malam.
    const bucket =
      h >= 4 && h <= 10
        ? "morning"
        : h >= 11 && h <= 14
          ? "noon"
          : h >= 15 && h <= 18
            ? "evening"
            : "night";
    if (lang === "en") {
      if (bucket === "morning") return "Good morning";
      if (bucket === "noon") return "Good afternoon";
      if (bucket === "evening") return "Good evening";
      return "Good night";
    }
    if (bucket === "morning") return "Selamat pagi";
    if (bucket === "noon") return "Selamat siang";
    if (bucket === "evening") return "Selamat sore";
    return "Selamat malam";
  }, [now, lang]);

  const commitHeroName = (raw: string) => {
    const next = (raw || "").trim().slice(0, 32);
    const finalName = next.length > 0 ? next : "Streamer";
    setHeroNameState(finalName);
    setHeroNameDraft(finalName);
    setEditingHeroName(false);
    void setHeroName(finalName);
  };

  const linkTypeLabel = (type: CustomLinkType): string => {
    if (type === "movie") return tx("Movie", "Movie");
    if (type === "musik") return tx("Musik", "Music");
    return tx("Tools", "Tools");
  };

  const handleAddLink = async () => {
    let url = newLinkUrl.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    let title = newLinkTitle.trim();
    // Test comment

    const meta = await fetchPreviewMeta(url);

    if (!title) {
      const candidate = meta.title || meta.siteName || meta.hostname;
      if (candidate) title = candidate;
      else {
        try {
          const urlObj = new URL(url);
          title = urlObj.hostname.replace("www.", "");
          title = title.charAt(0).toUpperCase() + title.slice(1);
        } catch {
          title = url;
        }
      }
    }

    const selectedImage = (modalPreview || meta.image).trim();
    const split = splitImageValue(selectedImage);

    const newLink: CustomLink = {
      id: Date.now().toString(),
      type: newLinkType,
      thumbnailType: newLinkThumbnailType,
      title,
      url,
      ...(split.imageDataUrl ? { imageDataUrl: split.imageDataUrl } : {}),
      ...(split.image ? { image: split.image } : {}),
      ...(meta.imageUrl && split.imageDataUrl ? { image: meta.imageUrl } : {}),
      ...(newLinkDescription.trim() ? { description: newLinkDescription.trim() } : (meta.description ? { description: meta.description } : {})),
      ...(meta.siteName ? { siteName: meta.siteName } : {}),
    };
    const updated = [...customLinks, newLink];
    setCustomLinks(updated);
    void saveCustomLinks(updated);
    setShowAddModal(false);
    setNewLinkUrl("");
    setNewLinkTitle("");
    setNewLinkDescription("");
    setNewLinkType("movie");
    setNewLinkThumbnailType("link");
    setModalPreview("");
  };

  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = customLinks.filter((l) => l.id !== id);
    setCustomLinks(updated);
    void saveCustomLinks(updated);
  };

  const openEditModal = (link: CustomLink, e: React.MouseEvent) => {
    // Initialize preview immediately with the existing thumbnail
    const initialPreview = link.imageDataUrl || link.image || getScreenshotPreviewUrl(link.url);
    setModalPreview(initialPreview);
    e.preventDefault();
    e.stopPropagation();
    setEditingLink(link);
    setNewLinkUrl(link.url);
    setNewLinkTitle(link.title);
    setNewLinkDescription(link.description || "");
    setNewLinkType((link.type as unknown as string) === "film" ? "movie" : (link.type || "movie"));
    setNewLinkThumbnailType(link.thumbnailType || "link");
  };

  const handleEditLink = async () => {
    if (!editingLink) return;
    let url = newLinkUrl.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    let title = newLinkTitle.trim();
    if (!title) {
      try {
        title = new URL(url).hostname.replace("www.", "");
        title = title.charAt(0).toUpperCase() + title.slice(1);
      } catch {
        title = url;
      }
    }
    let image = editingLink.image;
    let imageDataUrl = editingLink.imageDataUrl;
    let description = editingLink.description;
    let siteName = editingLink.siteName;
    if (url !== editingLink.url) {
      const meta = await fetchPreviewMeta(url);
      const selectedImage = (modalPreview || meta.image).trim();
      const split = splitImageValue(selectedImage);
      image = split.imageDataUrl ? meta.imageUrl || editingLink.image : split.image;
      imageDataUrl = split.imageDataUrl;
      description = meta.description || undefined;
      siteName = meta.siteName || undefined;
    }
    const updated = customLinks.map((l) =>
      l.id === editingLink.id
        ? { 
            ...l, 
            title, 
            url, 
            image, 
            imageDataUrl, 
            description: newLinkDescription.trim(), 
            siteName,
            type: newLinkType,
            thumbnailType: newLinkThumbnailType
          }
        : l,
    );
    setCustomLinks(updated);
    void saveCustomLinks(updated);
    setEditingLink(null);
    setNewLinkUrl("");
    setNewLinkTitle("");
    setNewLinkDescription("");
    setNewLinkType("movie");
    setNewLinkThumbnailType("link");

    setModalPreview("");
  };

  const groupedLinks = useMemo(() => {
    const groups: Record<CustomLinkType, CustomLink[]> = {
      movie: [],
      musik: [],
      tools: [],
    };
    sites.forEach((link) => {
      const type: CustomLinkType = link.type || "movie";
      groups[type].push(link);
    });
    return groups;
  }, [sites]);

  return (
    <>
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />

      <div
        className="app"
        data-mode={uiMode}
        style={{ backgroundImage: `url("${viewportBgUrl}")` }}
      >
        <div className="shell">
          <LeftPanel
            section={section}
            setSection={setSection}
            navItems={navItems}
            lang={lang}
            uiMode={uiMode}
            tx={tx}
            toggleLang={toggleLang}
            toggleMode={toggleMode}
          />

          <section className="right-panel" aria-label="Content">
            <main className="viewport">
              {section === "home" && (
                <HomeSection
                  lang={lang}
                  tx={tx}
                  now={now}
                  timeGreeting={timeGreeting}
                  heroName={heroName}
                  editingHeroName={editingHeroName}
                  setEditingHeroName={setEditingHeroName}
                  heroNameDraft={heroNameDraft}
                  setHeroNameDraft={setHeroNameDraft}
                  commitHeroName={commitHeroName}
                  query={query}
                  setQuery={setQuery}
                  setShowAddModal={setShowAddModal}
                  viewMode={viewMode}
                  setViewModeState={setViewModeState}
                  setLinkViewMode={setLinkViewMode}
                  groupedLinks={groupedLinks}
                  sites={sites}
                  linkTypeLabel={linkTypeLabel}
                  getFaviconUrl={getFaviconUrl}
                  LinkThumb={LinkThumb}
                  openEditModal={openEditModal}
                  handleDeleteLink={handleDeleteLink}
                  linkDataMenuOpen={linkDataMenuOpen}
                  setLinkDataMenuOpen={setLinkDataMenuOpen}
                  exportLinks={exportLinks}
                  openLinkImportPicker={openLinkImportPicker}
                  linkDataMenuRef={linkDataMenuRef}
                  linkImportInputRef={linkImportInputRef}
                  handleLinkImportFile={handleLinkImportFile}
                  linkImportError={linkImportError}
                  todoDraft={todoDraft}
                  setTodoDraft={setTodoDraft}
                  addTodo={addTodo}
                  todoMenuOpen={todoMenuOpen}
                  setTodoMenuOpen={setTodoMenuOpen}
                  exportTodos={exportTodos}
                  openTodoImportPicker={openTodoImportPicker}
                  todoMenuRef={todoMenuRef}
                  todoImportInputRef={todoImportInputRef}
                  handleTodoImportFile={handleTodoImportFile}
                  todoImportError={todoImportError}
                  pendingTodos={pendingTodos}
                  doneTodos={doneTodos}
                  todoAnimateId={todoAnimateId}
                  toggleTodo={toggleTodo}
                  removeTodo={removeTodo}
                />
              )}

              {section === "general" && (
                <GeneralSection
                  lang={lang}
                  tx={tx}
                  settings={settings}
                  patch={patch}
                  noonBgUrl={noonBgUrl}
                  nightBgUrl={nightBgUrl}
                  importBgFromFile={importBgFromFile}
                  resetBgToDefault={resetBgToDefault}
                />
              )}

              {section === "subtitle" && (
                <SubtitleSection lang={lang} tx={tx} settings={settings} patch={patch} />
              )}

              {section === "adblock" && (
                <AdblockSection lang={lang} tx={tx} settings={settings} patch={patch} />
              )}

              {section === "domains" && (
                <DomainsSection
                  lang={lang}
                  tx={tx}
                  domainRows={domainRows}
                  setDomainState={setDomainState}
                  removeDomainState={removeDomainState}
                  refreshDomains={refreshDomains}
                />
              )}

              {section === "shortcuts" && (
                <ShortcutsSection lang={lang} tx={tx} settings={settings} patch={patch} />
              )}

              {section === "about" && (
                <AboutSection lang={lang} />
              )}
            </main>
          </section>
        </div>
      </div>

      {todoImportModalOpen && todoImportPreview && (
        <div
          className="modal-overlay"
          onClick={() => {
            setTodoImportModalOpen(false);
            setTodoImportPreview(null);
            setTodoImportError(null);
            setTodoImportFileName("");
            if (todoImportInputRef.current)
              todoImportInputRef.current.value = "";
          }}
        >
          <div
            className="modal-content glass"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>
              {tx("Preview Import Todo", "Todo Import Preview")}
            </h3>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              {todoImportFileName && (
                <div style={{ marginBottom: 8 }}>
                  {tx("File:", "File:")} {todoImportFileName}
                </div>
              )}
              <div>
                {tx("Total:", "Total:")} {todoImportPreview.items.length}
                {" Â· "}
                {tx("Pending:", "Pending:")} {todoImportPreview.pendingCount}
                {" Â· "}
                {tx("Done:", "Done:")} {todoImportPreview.doneCount}
              </div>
              {todoImportPreview.rawCount !== todoImportPreview.items.length && (
                <div style={{ marginTop: 6 }}>
                  {tx(
                    `Catatan: ${todoImportPreview.rawCount} item ditemukan, ${todoImportPreview.items.length} valid di-import (maks 100).`,
                    `Note: ${todoImportPreview.rawCount} items found, ${todoImportPreview.items.length} valid items will be imported (max 100).`,
                  )}
                </div>
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <div
                className="todo-import-preview"
                aria-label={tx("Preview item", "Item preview")}
              >
                {todoImportPreview.items.slice(0, 8).map((t) => (
                  <div key={t.id} className="todo-import-row">
                    <span
                      className={`todo-import-pill ${t.done ? "is-done" : "is-pending"}`}
                    >
                      {t.done ? tx("Selesai", "Done") : tx("Pending", "Pending")}
                    </span>
                    <span className="todo-import-text">{t.text}</span>
                  </div>
                ))}
                {todoImportPreview.items.length > 8 && (
                  <div className="todo-import-more">
                    {tx(
                      `â€¦dan ${todoImportPreview.items.length - 8} item lainnya`,
                      `â€¦and ${todoImportPreview.items.length - 8} more`,
                    )}
                  </div>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setTodoImportModalOpen(false);
                  setTodoImportPreview(null);
                  setTodoImportError(null);
                  setTodoImportFileName("");
                  if (todoImportInputRef.current)
                    todoImportInputRef.current.value = "";
                }}
              >
                {tx("Batal", "Cancel")}
              </button>
              <button
                className="btn"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                }}
                onClick={confirmTodoImport}
                disabled={todoImportPreview.items.length === 0}
                title={
                  todoImportPreview.items.length === 0
                    ? tx("Tidak ada data valid.", "No valid data.")
                    : undefined
                }
              >
                {tx("Import", "Import")}
              </button>
            </div>
          </div>
        </div>
      )}

      {linkImportModalOpen && linkImportPreview && (
        <div
          className="modal-overlay"
          onClick={() => {
            setLinkImportModalOpen(false);
            setLinkImportPreview(null);
            setLinkImportError(null);
            setLinkImportFileName("");
            if (linkImportInputRef.current) linkImportInputRef.current.value = "";
          }}
        >
          <div
            className="modal-content glass"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>
              {tx("Preview Import Link", "Link Import Preview")}
            </h3>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              {linkImportFileName && (
                <div style={{ marginBottom: 8 }}>
                  {tx("File:", "File:")} {linkImportFileName}
                </div>
              )}
              <div>
                {tx("Akan ditambahkan:", "Will add:")} {linkImportPreview.newCount}
                {" Â· "}
                {tx("Duplikat (skip):", "Duplicates (skipped):")}{" "}
                {linkImportPreview.dupCount}
              </div>
              {linkImportPreview.rawCount !== linkImportPreview.newCount + linkImportPreview.dupCount && (
                <div style={{ marginTop: 6 }}>
                  {tx(
                    `Catatan: ${linkImportPreview.rawCount} item ditemukan, ${linkImportPreview.newCount} akan di-import, sisanya di-skip (invalid/duplikat).`,
                    `Note: ${linkImportPreview.rawCount} items found, ${linkImportPreview.newCount} will be imported, the rest are skipped (invalid/duplicates).`,
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <div
                className="todo-import-preview"
                aria-label={tx("Preview link", "Link preview")}
              >
                {linkImportPreview.items.slice(0, 8).map((l) => (
                  <div key={l.id} className="todo-import-row">
                    <span
                      className="todo-import-pill is-pending"
                      title={tx("Akan ditambahkan", "Will be added")}
                    >
                      {tx("Baru", "New")}
                    </span>
                    <span className="todo-import-text">
                      {l.title}
                      <span style={{ display: "block", fontWeight: 600, opacity: 0.85 }}>
                        {l.url}
                      </span>
                    </span>
                  </div>
                ))}
                {linkImportPreview.items.length > 8 && (
                  <div className="todo-import-more">
                    {tx(
                      `…dan ${linkImportPreview.items.length - 8} item lainnya`,
                      `…and ${linkImportPreview.items.length - 8} more`,
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setLinkImportModalOpen(false);
                  setLinkImportPreview(null);
                  setLinkImportError(null);
                  setLinkImportFileName("");
                  if (linkImportInputRef.current)
                    linkImportInputRef.current.value = "";
                }}
              >
                {tx("Batal", "Cancel")}
              </button>
              <button
                className="btn"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                }}
                onClick={confirmLinkImport}
                disabled={linkImportPreview.items.length === 0}
                title={
                  linkImportPreview.items.length === 0
                    ? tx("Tidak ada data valid.", "No valid data.")
                    : undefined
                }
              >
                {tx("Import", "Import")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content glass"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>
              {tx("Tambah Link Baru", "Add New Link")}
            </h3>
            <div className="modal-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {modalPreview ? (
                <img
                  src={modalPreview}
                  alt={tx("Pratinjau situs", "Site preview")}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('mshots')) {
                      target.src = getScreenshotPreviewUrl(newLinkUrl);
                    } else {
                      target.style.display = "none";
                    }
                  }}
                  style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  {newLinkUrl.length > 7
                    ? tx("Memuat pratinjau...", "Loading preview...")
                    : tx("Pratinjau Gambar", "Image Preview")}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                className="search-input"
                style={{ width: "100%" }}
                placeholder={tx("https://contoh.com", "https://example.com")}
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                autoFocus
              />
              <input
                className="search-input"
                style={{ width: "100%" }}
                placeholder={tx("Judul Situs (opsional)", "Site Title (optional)")}
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
              />
              <textarea
                className="search-input"
                style={{ width: "100%", height: "60px", resize: "none", padding: '8px 12px', fontFamily: 'inherit' }}
                placeholder={tx("Deskripsi", "Description")}
                value={newLinkDescription}
                onChange={(e) => setNewLinkDescription(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <select
                  className="search-input"
                  style={{ flex: 1, padding: '8px 12px' }}
                  value={newLinkType}
                  onChange={(e) => setNewLinkType(e.target.value as CustomLinkType)}
                >
                  <option value="movie">{tx("Movie", "Movie")}</option>
                  <option value="musik">{tx("Musik", "Music")}</option>
                  <option value="tools">{tx("Tools", "Tools")}</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '0 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                   <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                     {tx("Thumbnail:", "Thumb:")}
                   </span>
                   <button 
                     onClick={() => setNewLinkThumbnailType('link')}
                     style={{ background: newLinkThumbnailType === 'link' ? 'var(--accent)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                   >{tx("Link", "Link")}</button>
                   <button 
                     onClick={() => setNewLinkThumbnailType('default')}
                     style={{ background: newLinkThumbnailType === 'default' ? 'var(--accent)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                   >{tx("Default", "Default")}</button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewLinkUrl("");
                    setNewLinkTitle("");
                  }}
                >
                  {tx("Batal", "Cancel")}
                </button>
                <button
                  className="btn"
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                  }}
                  onClick={handleAddLink}
                >
                  {tx("Tambah Link", "Add Link")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingLink && (
        <div
          className="modal-overlay"
          onClick={() => {
            setEditingLink(null);
            setNewLinkUrl("");
            setNewLinkTitle("");
          }}
        >
          <div
            className="modal-content glass"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>
              {tx("Edit Link", "Edit Link")}
            </h3>
            <div className="modal-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {modalPreview ? (
                <img
                  src={modalPreview}
                  alt={tx("Pratinjau situs", "Site preview")}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('mshots')) {
                      target.src = getScreenshotPreviewUrl(newLinkUrl);
                    } else {
                      target.style.display = "none";
                    }
                  }}
                  style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  {newLinkUrl.length > 7
                    ? tx("Memuat pratinjau...", "Loading preview...")
                    : tx("Pratinjau Gambar", "Image Preview")}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                className="search-input"
                style={{ width: "100%" }}
                placeholder={tx("https://contoh.com", "https://example.com")}
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                autoFocus
              />
              <input
                className="search-input"
                style={{ width: "100%" }}
                placeholder={tx("Judul Situs (opsional)", "Site Title (optional)")}
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
              />
              <textarea
                className="search-input"
                style={{ width: "100%", height: "60px", resize: "none", padding: '8px 12px', fontFamily: 'inherit' }}
                placeholder={tx("Deskripsi", "Description")}
                value={newLinkDescription}
                onChange={(e) => setNewLinkDescription(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <select
                  className="search-input"
                  style={{ flex: 1, padding: '8px 12px' }}
                  value={newLinkType}
                  onChange={(e) => setNewLinkType(e.target.value as CustomLinkType)}
                >
                  <option value="movie">{tx("Movie", "Movie")}</option>
                  <option value="musik">{tx("Musik", "Music")}</option>
                  <option value="tools">{tx("Tools", "Tools")}</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '0 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                   <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                     {tx("Thumbnail:", "Thumb:")}
                   </span>
                   <button 
                     onClick={() => setNewLinkThumbnailType('link')}
                     style={{ background: newLinkThumbnailType === 'link' ? 'var(--accent)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                   >{tx("Link", "Link")}</button>
                   <button 
                     onClick={() => setNewLinkThumbnailType('default')}
                     style={{ background: newLinkThumbnailType === 'default' ? 'var(--accent)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                   >{tx("Default", "Default")}</button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <button
                  className="btn btn--ghost"
                  onClick={() => {
                    setEditingLink(null);
                    setNewLinkUrl("");
                    setNewLinkTitle("");
                  }}
                >
                  {tx("Batal", "Cancel")}
                </button>
                <button
                  className="btn"
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                  }}
                  onClick={handleEditLink}
                >
                  {tx("Simpan Perubahan", "Save Changes")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
