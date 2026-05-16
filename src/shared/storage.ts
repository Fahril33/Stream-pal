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

export type CustomLinkType = "film" | "musik" | "tools";
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
export async function getCustomLinks(): Promise<CustomLink[]> {
  const v = await getLocal<CustomLink[]>("ve_custom_links_v2");
  if (Array.isArray(v) && v.length > 0) return v;
  return [
    { id: "1", title: "Z1.idlixku.com", url: "https://z1.idlixku.com/", type: "film", thumbnailType: "default" },
    { id: "2", title: "Ngefilm.ink", url: "https://ngefilm.ink/", type: "film", thumbnailType: "default" },
    { id: "3", title: "D21.team", url: "https://d21.team/", type: "film", thumbnailType: "default" },
    { id: "4", title: "Rebahinxxxi3.beauty", url: "https://rebahinxxxi3.beauty/", type: "film", thumbnailType: "link" },
    { id: "5", title: "Pahe.ink", url: "https://pahe.ink/", type: "film", thumbnailType: "link" },
    { id: "6", title: "Cineby.sc", url: "https://cineby.sc/", type: "film", thumbnailType: "link" },
    { id: "7", title: "Yomi.to", url: "https://yomi.to/", type: "film", thumbnailType: "link" },
    { id: "8", title: "Anikuro.to", url: "https://anikuro.to/", type: "film", thumbnailType: "link" },
    { id: "9", title: "Streamxtv.tech", url: "https://streamxtv.tech/", type: "film", thumbnailType: "link" },
    { id: "10", title: "Dl.opensubtitles.com", url: "https://dl.opensubtitles.com/", type: "tools", thumbnailType: "link" },
  ];
}
export async function saveCustomLinks(links: CustomLink[]): Promise<void> {
  await setLocal("ve_custom_links_v2", links);
}

export async function getLinkViewMode(): Promise<"card" | "list"> {
  const v = await getLocal<string>("ve_link_view_mode");
  return v === "list" ? "list" : "card";
}
export async function setLinkViewMode(mode: "card" | "list"): Promise<void> {
  await setLocal("ve_link_view_mode", mode);
}
