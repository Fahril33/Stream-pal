import { broadcastDomainState } from '../shared/messaging';
import { getDomainState, setDomainState } from '../shared/storage';
import type { LinkMetadata, RuntimeMessage } from '../shared/types';

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  if (message.type === 'VE_GET_STATE') {
    getDomainState(message.hostname).then((enabled) => sendResponse({ enabled }));
    return true;
  }

  if (message.type === 'VE_SET_STATE') {
    setDomainState(message.hostname, message.enabled)
      .then(() => broadcastDomainState(message.hostname, message.enabled))
      .then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === 'VE_FETCH_OG') {
    const normalizeUrl = (raw: string): string => {
      const t = (raw || '').trim();
      if (!t) return '';
      return t.startsWith('http://') || t.startsWith('https://') ? t : `https://${t}`;
    };

    const absoluteFrom = (baseUrl: string, maybeRelative: string): string => {
      const v = (maybeRelative || '').trim();
      if (!v) return '';
      try {
        return new URL(v, baseUrl).href;
      } catch {
        return '';
      }
    };

    const getMeta = (html: string, key: string): string => {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const patterns = [
        new RegExp(`<meta[^>]*property=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${escaped}["'][^>]*>`, 'i'),
        new RegExp(`<meta[^>]*name=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${escaped}["'][^>]*>`, 'i'),
      ];
      for (const re of patterns) {
        const m = html.match(re);
        if (m && m[1]) return m[1].trim();
      }
      return '';
    };

    const getTitle = (html: string): string => {
      const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return m && m[1] ? m[1].trim() : '';
    };

    const fetchAsDataUrl = async (imageUrl: string): Promise<string> => {
      try {
        if (!imageUrl) return '';
        const res = await fetch(imageUrl);
        if (!res.ok) return '';
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (!ct.startsWith('image/')) return '';
        const lenHeader = res.headers.get('content-length');
        const maxBytes = 2_000_000;
        if (lenHeader) {
          const n = Number(lenHeader);
          if (Number.isFinite(n) && n > maxBytes) return '';
        }
        const buf = await res.arrayBuffer();
        if (buf.byteLength > maxBytes) return '';
        const bytes = new Uint8Array(buf);
        let bin = '';
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i] as number);
        const b64 = btoa(bin);
        return `data:${ct};base64,${b64}`;
      } catch {
        return '';
      }
    };

    const url = normalizeUrl(message.url);
    if (!url) {
      sendResponse({ url: '', hostname: '', title: '', description: '', image: '', imageDataUrl: '', siteName: '' } satisfies LinkMetadata);
      return true;
    }

    fetch(url)
      .then((res) => res.text())
      .then(async (html) => {
        const hostname = (() => {
          try {
            return new URL(url).hostname;
          } catch {
            return '';
          }
        })();

        const ogTitle = getMeta(html, 'og:title');
        const twTitle = getMeta(html, 'twitter:title');
        const title = ogTitle || twTitle || getTitle(html) || hostname || url;

        const ogDesc = getMeta(html, 'og:description');
        const twDesc = getMeta(html, 'twitter:description');
        const desc = ogDesc || twDesc || getMeta(html, 'description') || '';

        const ogSite = getMeta(html, 'og:site_name');
        const siteName = ogSite || hostname;

        const ogImage = getMeta(html, 'og:image');
        const twImage = getMeta(html, 'twitter:image');
        const image = absoluteFrom(url, ogImage || twImage);
        const imageDataUrl = image ? await fetchAsDataUrl(image) : '';

        sendResponse({ url, hostname, title, description: desc, image, imageDataUrl, siteName } satisfies LinkMetadata);
      })
      .catch(() =>
        sendResponse({ url, hostname: '', title: '', description: '', image: '', imageDataUrl: '', siteName: '' } satisfies LinkMetadata),
      );
    return true;
  }

  return false;
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Video Enhancer] Extension installed / updated.');
});
