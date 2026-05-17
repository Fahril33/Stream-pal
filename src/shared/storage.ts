import { DEFAULT_SETTINGS } from "./defaults";
import type { ExtensionSettings } from "./types";

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local);
}

async function getLocal<T = any>(key: string): Promise<T | undefined> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(key);
    return result?.[key] as T | undefined;
  }
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

async function setLocal(key: string, value: unknown): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [key]: value });
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

async function removeLocal(key: string): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.remove(key);
    return;
  }
  window.localStorage.removeItem(key);
}

export async function getSettings(): Promise<ExtensionSettings> {
  const saved =
    (await getLocal<Partial<ExtensionSettings>>("ve_settings")) || {};
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await setLocal("ve_settings", settings);
}

export async function getDomainState(hostname: string): Promise<boolean> {
  const key = `ve_domain_${hostname}`;
  const v = await getLocal<boolean>(key);
  return v ?? true;
}

export async function setDomainState(
  hostname: string,
  enabled: boolean,
): Promise<void> {
  const key = `ve_domain_${hostname}`;
  await setLocal(key, enabled);
}

export async function removeDomainState(hostname: string): Promise<void> {
  const key = `ve_domain_${hostname}`;
  await removeLocal(key);
}

export async function getAllDomainStates(): Promise<Record<string, boolean>> {
  if (hasChromeStorage()) {
    const all = await chrome.storage.local.get(null);
    const entries = Object.entries(all).filter(([k]) =>
      k.startsWith("ve_domain_"),
    );
    return Object.fromEntries(
      entries.map(([k, v]) => [k.replace("ve_domain_", ""), Boolean(v)]),
    );
  }

  const out: Record<string, boolean> = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k || !k.startsWith("ve_domain_")) continue;
    const host = k.replace("ve_domain_", "");
    const raw = window.localStorage.getItem(k);
    if (raw == null) continue;
    try {
      out[host] = Boolean(JSON.parse(raw));
    } catch {
      out[host] = true;
    }
  }
  return out;
}

export async function getOptionsBg(): Promise<string | undefined> {
  return getLocal<string>("ve_options_bg");
}

export async function setOptionsBg(dataUrl: string): Promise<void> {
  await setLocal("ve_options_bg", dataUrl);
}

export async function clearOptionsBg(): Promise<void> {
  await removeLocal("ve_options_bg");
}

export async function getOptionsBgNoon(): Promise<string | undefined> {
  return getLocal<string>("ve_options_bg_noon");
}
export async function setOptionsBgNoon(dataUrl: string): Promise<void> {
  await setLocal("ve_options_bg_noon", dataUrl);
}
export async function clearOptionsBgNoon(): Promise<void> {
  await removeLocal("ve_options_bg_noon");
}

export async function getOptionsBgNight(): Promise<string | undefined> {
  return getLocal<string>("ve_options_bg_night");
}
export async function setOptionsBgNight(dataUrl: string): Promise<void> {
  await setLocal("ve_options_bg_night", dataUrl);
}
export async function clearOptionsBgNight(): Promise<void> {
  await removeLocal("ve_options_bg_night");
}

export async function getUiMode(): Promise<"noon" | "night"> {
  const v = await getLocal<string>("ve_ui_mode");
  return v === "night" ? "night" : "noon";
}
export async function setUiMode(mode: "noon" | "night"): Promise<void> {
  await setLocal("ve_ui_mode", mode);
}

export async function getLanguage(): Promise<"id" | "en"> {
  const v = await getLocal<string>("ve_lang");
  return v === "en" ? "en" : "id";
}

export async function setLanguage(lang: "id" | "en"): Promise<void> {
  await setLocal("ve_lang", lang);
}

export async function getHeroName(): Promise<string> {
  const v = await getLocal<string>("ve_hero_name");
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : "Streamer";
}

export async function setHeroName(name: string): Promise<void> {
  const next = (name || "").trim().slice(0, 32);
  await setLocal("ve_hero_name", next.length > 0 ? next : "Streamer");
}

export type CustomLinkType = "movie" | "musik" | "tools";
export type ThumbnailType = "default" | "link";

export type CustomLink = {
  id: string;
  title: string;
  url: string;
  image?: string;
  imageDataUrl?: string;
  description?: string;
  siteName?: string;
  type: CustomLinkType;
  thumbnailType: ThumbnailType;
};

function normalizeCustomLinkType(type: unknown): CustomLinkType {
  if (type === "film") return "movie";
  if (type === "movie" || type === "musik" || type === "tools") return type;
  return "movie";
}

function normalizeCustomLinks(links: CustomLink[]): CustomLink[] {
  return links.map((l) => ({
    ...l,
    type: normalizeCustomLinkType((l as unknown as { type?: unknown })?.type),
  }));
}
export async function getCustomLinks(): Promise<CustomLink[]> {
  const v = await getLocal<CustomLink[]>("ve_custom_links_v2");
  const defaults: CustomLink[] = [
    {
      id: "1",
      title: "IDLIX",
      url: "https://z1.idlixku.com/",
      type: "movie",
      thumbnailType: "default",
    },
    {
      id: "2",
      title: "NGEFILM",
      url: "https://ngefilm.ink/",
      type: "movie",
      thumbnailType: "default",
    },
    {
      id: "3",
      title: "LAYARKACA21",
      url: "https://d21.team/",
      type: "movie",
      thumbnailType: "default",
    },
    {
      id: "4",
      title: "REBAHIN",
      url: "https://rebahinxxi3.beauty/",
      type: "movie",
      thumbnailType: "link",
    },
    {
      id: "5",
      title: "PAHE",
      url: "https://pahe.ink/",
      type: "movie",
      thumbnailType: "link",
    },
    {
      id: "6",
      title: "CINEBY",
      url: "https://cineby.sc/",
      type: "movie",
      thumbnailType: "link",
    },
    {
      id: "7",
      title: "YOMI",
      url: "https://yomi.to/",
      type: "movie",
      thumbnailType: "link",
    },
    {
      id: "8",
      title: "ANIKURO",
      url: "https://anikuro.to/",
      type: "movie",
      thumbnailType: "link",
    },
    {
      id: "9",
      title: "STREAMXTV",
      url: "https://streamxtv.tech/",
      type: "movie",
      thumbnailType: "link",
    },
    {
      id: "10",
      title: "OPEN SUBTITLE",
      url: "https://dl.opensubtitles.com/",
      type: "tools",
      thumbnailType: "link",
    },
    {
      id: "11",
      title: "TELEGRAM",
      url: "https://web.telegram.org/k/",
      type: "tools",
      thumbnailType: "link",
    },
    {
      id: "12",
      title: "WHATSAPP",
      url: "https://web.whatsapp.com/",
      type: "tools",
      thumbnailType: "link",
    },
    {
      id: "13",
      title: "Spotify",
      url: "https://open.spotify.com/",
      type: "musik",
      thumbnailType: "link",
    },
    {
      id: "14",
      title: "NETFLIX",
      url: "https://www.netflix.com/",
      type: "movie",
      thumbnailType: "link",
    },
    {
      id: "15",
      title: "YouTube Music",
      url: "https://music.youtube.com/",
      type: "musik",
      thumbnailType: "link",
    },
  ];

  if (Array.isArray(v) && v.length > 0) {
    const normalized = normalizeCustomLinks(v);
    
    // Check if any default links are missing in existing list (by URL prefix/match)
    const existingUrls = new Set(
      normalized.map((l) => l.url.trim().toLowerCase().replace(/\/$/, ""))
    );
    
    const missingDefaults = defaults.filter(
      (d) => !existingUrls.has(d.url.trim().toLowerCase().replace(/\/$/, ""))
    );

    if (missingDefaults.length > 0) {
      const merged = [...normalized, ...missingDefaults];
      await saveCustomLinks(merged);
      return merged;
    }
    
    return normalized;
  }

  return defaults;
}
export async function saveCustomLinks(links: CustomLink[]): Promise<void> {
  await setLocal("ve_custom_links_v2", normalizeCustomLinks(links));
}

export async function getLinkViewMode(): Promise<"card" | "list"> {
  const v = await getLocal<string>("ve_link_view_mode");
  return v === "list" ? "list" : "card";
}
export async function setLinkViewMode(mode: "card" | "list"): Promise<void> {
  await setLocal("ve_link_view_mode", mode);
}

const TODO_WATCHLIST_KEY = "ve_todo_watchlist_v1";

export type TodoWatchItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  updatedAt: number;
};

export async function getTodoWatchlist(): Promise<TodoWatchItem[]> {
  const v = await getLocal<TodoWatchItem[]>(TODO_WATCHLIST_KEY);
  return Array.isArray(v) ? v.filter(Boolean) : [];
}

export async function saveTodoWatchlist(items: TodoWatchItem[]): Promise<void> {
  await setLocal(TODO_WATCHLIST_KEY, items);
}
