import React, { useEffect, useMemo, useState } from "react";
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
  removeDomainState,
  saveSettings,
  setOptionsBg,
  setOptionsBgNoon,
  setOptionsBgNight,
  setUiMode as saveUiMode,
  getCustomLinks,
  saveCustomLinks,
  getLinkViewMode,
  setLinkViewMode,
  type CustomLink,
  type CustomLinkType,
  type ThumbnailType,
} from "../shared/storage";

type SectionKey =
  | "home"
  | "general"
  | "subtitle"
  | "adblock"
  | "domains"
  | "shortcuts"
  | "about";

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

function MeTimeLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 200"
      width="100%"
      height="100%"
      aria-label="MeTime"
    >
      <defs>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap');
          .logo-text {
            font-family: 'Nunito', sans-serif;
            font-size: 150px;
            font-weight: 900;
            letter-spacing: -2px;
          }
        `}</style>
        <linearGradient id="metimeGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2563eb" />
          <stop offset="0.45" stop-color="#a855f7" />
          <stop offset="1" stop-color="#06b6d4" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="logo-text"
        fill="url(#metimeGradient)"
      >
        MeTime
      </text>
    </svg>
  );
}

function App() {
  const [section, setSection] = useState<SectionKey>("home");
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [domains, setDomains] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [uiMode, setUiModeState] = useState<"noon" | "night">("noon");
  const [now, setNow] = useState(() => new Date());
  const [noonBgUrl, setNoonBgUrl] = useState<string>("/backgrounds/bg.jpg");
  const [nightBgUrl, setNightBgUrl] = useState<string>(
    "/backgrounds/bg-night.png",
  );
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [viewMode, setViewModeState] = useState<"card" | "list">("card");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkDescription, setNewLinkDescription] = useState("");
  const [newLinkType, setNewLinkType] = useState<CustomLinkType>("film");
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

    const [idx, setIdx] = useState(0);
    const src = candidates[idx] || "";

    useEffect(() => setIdx(0), [candidates.join("|")]);

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

  const navItems = useMemo(
    () =>
      [
        { key: "home" as const, label: "Home", icon: <IconHome /> },
        { key: "general" as const, label: "General", icon: <IconSettings /> },
        {
          key: "subtitle" as const,
          label: "Subtitle",
          icon: <IconSubtitles />,
        },
        { key: "adblock" as const, label: "Ad Block", icon: <IconShield /> },
        { key: "domains" as const, label: "Domains", icon: <IconGlobe /> },
        {
          key: "shortcuts" as const,
          label: "Shortcuts",
          icon: <IconKeyboard />,
        },
        { key: "about" as const, label: "About", icon: <IconInfo /> },
      ] as const,
    [],
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

  useEffect(() => {
    void (async () => {
      setSettings(await getSettings());
      void refreshDomains();

      const mode = await getUiMode();
      setUiModeState(mode);

      const noonBg = await getOptionsBgNoon();
      if (typeof noonBg === "string" && noonBg.length > 0) setNoonBgUrl(noonBg);
      const nightBg = await getOptionsBgNight();
      if (typeof nightBg === "string" && nightBg.length > 0)
        setNightBgUrl(nightBg);

      const links = await getCustomLinks();
      setCustomLinks(links);

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

  const save = (next: ExtensionSettings) => {
    setSettings(next);
    void (async () => {
      await saveSettings(next);
      await broadcastSettings(next);
    })();
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
    setNewLinkType("film");
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
    e.preventDefault();
    e.stopPropagation();
    setEditingLink(link);
    setNewLinkUrl(link.url);
    setNewLinkTitle(link.title);
    setNewLinkDescription(link.description || "");
    setNewLinkType(link.type || "film");
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
    setNewLinkType("film");
    setNewLinkThumbnailType("link");

    setModalPreview("");
  };

  const groupedLinks = useMemo(() => {
    const groups: Record<CustomLinkType, CustomLink[]> = {
      film: [],
      musik: [],
      tools: [],
    };
    sites.forEach((link) => {
      const type = link.type || "film";
      if (groups[type]) groups[type].push(link);
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
              <button
                className="mode-toggle-btn"
                onClick={toggleMode}
                aria-label={`Switch to ${uiMode === "noon" ? "night" : "noon"} mode`}
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
              <span className="version-badge">v2.0.0</span>
            </div>
          </aside>

          <section className="right-panel" aria-label="Content">
            <main className="viewport">
              {section === "home" && (
                <>
                  <div className="hero glass">
                    <div className="hero-grid">
                      <div className="hero-left">
                        <h2 className="hero-title">Hi, Streamer!</h2>
                        <p className="hero-subtitle">
                          Enjoy your MeTime. Add site to your list and customize
                          your experience.
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
                            placeholder="Search sites…"
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
                                ? "Switch to list view"
                                : "Switch to card view"
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
                        </div>
                      </div>
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
                                  color: '#fff', 
                                  background: 'rgba(255, 255, 255, 0.15)', 
                                  backdropFilter: 'blur(12px)', 
                                  padding: '4px 14px', 
                                  borderRadius: '20px', 
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                }}>{type}</span>
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
                            No sites added yet.
                          </div>
                        )}
                      </div>
                    </section>

                    <aside className="panel-4">
                      <div className="panel-head">
                        <h3>Todo Watchlist</h3>
                        <p>Pasif dulu, belum berfungsi.</p>
                      </div>
                      <div className="todo-list">
                        {[
                          "Try new movie list",
                          "Tune subtitle style",
                          "Review blocked domains",
                        ].map((t) => (
                          <div key={t} className="todo glass">
                            <div className="todo-dot" aria-hidden="true" />
                            <div className="todo-text">{t}</div>
                          </div>
                        ))}
                      </div>
                    </aside>
                  </div>
                </>
              )}

              {section === "general" && (
                <section className="section active">
                  <div className="section-header">
                    <h2>General Settings</h2>
                  </div>
                  {[
                    ["Global Enable", "globalEnabled"],
                    ["Show Floating Panel", "showPanel"],
                    ["Auto-detect Video", "autoDetect"],
                    ["Auto-Pause on Tab Switch", "autoPause"],
                    ["Bypass Site Auto-Pause", "bypassSiteAutoPause"],
                  ].map(([label, key]) => (
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
                        <h3>Panel Opacity</h3>
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
                        <h3>Noon Background</h3>
                        <p>Background gambar untuk mode Noon (siang).</p>
                      </div>
                      <div className="bg-controls">
                        <label className="btn btn--ghost bg-file">
                          Import Image
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
                          Reset Default
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
                        <h3>Night Background</h3>
                        <p>Background gambar untuk mode Night (malam).</p>
                      </div>
                      <div className="bg-controls">
                        <label className="btn btn--ghost bg-file">
                          Import Image
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
                          Reset Default
                        </button>
                      </div>
                    </div>
                    <div
                      className="bg-preview"
                      style={{ backgroundImage: `url("${nightBgUrl}")` }}
                    />
                  </div>
                </section>
              )}

              {section === "subtitle" && (
                <section className="section active">
                  <div className="section-header">
                    <h2>Subtitle Appearance</h2>
                  </div>

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>Font Size</h3>
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
                        <h3>Font Color</h3>
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
                        <h3>Background Color</h3>
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
                        <h3>Background Opacity</h3>
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
                        <h3>Text Shadow</h3>
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
                    <h3>Preview</h3>
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
                          This is a subtitle preview line.
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {section === "adblock" && (
                <section className="section active">
                  <div className="section-header">
                    <h2>Ad Redirect Blocker</h2>
                  </div>

                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>Enable Anti-Redirect</h3>
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
                        <h3>Block Outside Iframes</h3>
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
                        <h3>Blocked Domains</h3>
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
                      Reset to Default
                    </button>
                  </div>
                </section>
              )}

              {section === "domains" && (
                <section className="section active">
                  <div className="section-header">
                    <h2>Per-Site Settings</h2>
                  </div>
                  <div className="card">
                    <div className="domain-list">
                      {domainRows.length === 0 ? (
                        <div className="domain-empty">
                          No domain-specific settings saved yet.
                        </div>
                      ) : (
                        domainRows.map(([host, enabled]) => (
                          <div className="domain-row" key={host}>
                            <span className="domain-name">{host}</span>
                            <div className="domain-actions">
                              <span
                                className={`domain-status ${enabled ? "on" : "off"}`}
                              >
                                {enabled ? "Enabled" : "Disabled"}
                              </span>
                              <button
                                className="domain-delete"
                                onClick={() =>
                                  void removeDomainState(host).then(
                                    refreshDomains,
                                  )
                                }
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              )}

              {section === "shortcuts" && (
                <section className="section active">
                  <div className="section-header">
                    <h2>Keyboard Shortcuts</h2>
                  </div>
                  <div className="card">
                    <div className="shortcut-row">
                      <span className="shortcut-label">Seek −5 seconds</span>
                      <kbd className="kbd">←</kbd>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-label">Seek +5 seconds</span>
                      <kbd className="kbd">→</kbd>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-label">Seek −1 minute</span>
                      <kbd className="kbd">Shift + ←</kbd>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-label">Seek +1 minute</span>
                      <kbd className="kbd">Shift + →</kbd>
                    </div>
                    <div className="shortcut-row">
                      <span className="shortcut-label">Toggle Subtitles</span>
                      <kbd className="kbd">S</kbd>
                    </div>
                  </div>
                  <div className="card">
                    <div className="setting-row">
                      <div className="setting-info">
                        <h3>Enable Keyboard Shortcuts</h3>
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
              )}

              {section === "about" && (
                <section className="section active">
                  <div className="section-header">
                    <h2>About</h2>
                  </div>
                  <div className="card about-card">
                    <h3>Video Enhancer</h3>
                    <p className="about-version">
                      Version 2.0.0 · React + TypeScript
                    </p>
                  </div>
                </section>
              )}
            </main>
          </section>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content glass"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Add New Link</h3>
            <div className="modal-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {modalPreview ? (
                <img
                  src={modalPreview}
                  alt="Site preview"
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
                  {newLinkUrl.length > 7 ? "Loading preview..." : "Image Preview"}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                className="search-input"
                style={{ width: "100%" }}
                placeholder="https://example.com"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                autoFocus
              />
              <input
                className="search-input"
                style={{ width: "100%" }}
                placeholder="Site Title (optional)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
              />
              <textarea
                className="search-input"
                style={{ width: "100%", height: "60px", resize: "none", padding: '8px 12px', fontFamily: 'inherit' }}
                placeholder="Description"
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
                  <option value="film">Film</option>
                  <option value="musik">Musik</option>
                  <option value="tools">Tools</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '0 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                   <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Thumb:</span>
                   <button 
                     onClick={() => setNewLinkThumbnailType('link')}
                     style={{ background: newLinkThumbnailType === 'link' ? 'var(--accent)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                   >Link</button>
                   <button 
                     onClick={() => setNewLinkThumbnailType('default')}
                     style={{ background: newLinkThumbnailType === 'default' ? 'var(--accent)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                   >Default</button>
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
                  Cancel
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
                  Add Link
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
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Edit Link</h3>
            <div className="modal-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {modalPreview ? (
                <img
                  src={modalPreview}
                  alt="Site preview"
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
                  {newLinkUrl.length > 7 ? "Loading preview..." : "Image Preview"}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                className="search-input"
                style={{ width: "100%" }}
                placeholder="https://example.com"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                autoFocus
              />
              <input
                className="search-input"
                style={{ width: "100%" }}
                placeholder="Site Title (optional)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
              />
              <textarea
                className="search-input"
                style={{ width: "100%", height: "60px", resize: "none", padding: '8px 12px', fontFamily: 'inherit' }}
                placeholder="Description"
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
                  <option value="film">Film</option>
                  <option value="musik">Musik</option>
                  <option value="tools">Tools</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '0 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                   <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Thumb:</span>
                   <button 
                     onClick={() => setNewLinkThumbnailType('link')}
                     style={{ background: newLinkThumbnailType === 'link' ? 'var(--accent)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                   >Link</button>
                   <button 
                     onClick={() => setNewLinkThumbnailType('default')}
                     style={{ background: newLinkThumbnailType === 'default' ? 'var(--accent)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                   >Default</button>
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
                  Cancel
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
                  Save Changes
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
