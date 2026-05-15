import { DEFAULT_SETTINGS } from './defaults';
import type { ExtensionSettings } from './types';

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get('ve_settings');
  return { ...DEFAULT_SETTINGS, ...(result.ve_settings || {}) };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({ ve_settings: settings });
}

export async function getDomainState(hostname: string): Promise<boolean> {
  const key = `ve_domain_${hostname}`;
  const result = await chrome.storage.local.get(key);
  return result[key] ?? true;
}

export async function setDomainState(hostname: string, enabled: boolean): Promise<void> {
  const key = `ve_domain_${hostname}`;
  await chrome.storage.local.set({ [key]: enabled });
}

export async function getAllDomainStates(): Promise<Record<string, boolean>> {
  const all = await chrome.storage.local.get(null);
  const entries = Object.entries(all).filter(([k]) => k.startsWith('ve_domain_'));
  return Object.fromEntries(entries.map(([k, v]) => [k.replace('ve_domain_', ''), Boolean(v)]));
}
