import type { ExtensionSettings } from './types';

export async function broadcastSettings(settings: ExtensionSettings): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.tabs?.query) return;
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs.map((tab) =>
      tab.id
        ? chrome.tabs.sendMessage(tab.id, {
            type: 'VE_SETTINGS_UPDATED',
            settings,
          }).catch(() => undefined)
        : Promise.resolve(undefined)
    )
  );
}

export async function broadcastDomainState(hostname: string, enabled: boolean): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.tabs?.query) return;
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs.map((tab) => {
      if (!tab.id || !tab.url) return Promise.resolve(undefined);
      try {
        const url = new URL(tab.url);
        if (url.hostname !== hostname) return Promise.resolve(undefined);
      } catch {
        return Promise.resolve(undefined);
      }
      return chrome.tabs.sendMessage(tab.id, {
        type: 'VE_STATE_CHANGED',
        enabled,
      }).catch(() => undefined);
    })
  );
}
