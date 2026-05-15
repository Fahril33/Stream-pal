// @ts-nocheck
// ================================================================
//  ANTI-REDIRECT, OVERLAY, & JUDOL BLOCKER (Modular)
//  Refactor v3.0 (adapted for Video Enhancer content script bridge)
// ================================================================
//
// Dependencies are provided via `window.__VE_ANTI_REDIRECT_BRIDGE__`:
// - get/set: extensionEnabled
// - get/set: settings
// - toast(message, type)
//
// Public API (global):
// - window.AntiRedirectBlocker.setup()
// - window.AntiRedirectBlocker.teardown()
// - window.AntiRedirectBlocker.isBlockedURL(url)
// - window.AntiRedirectBlocker.isJudolURL(url)
//
(() => {
  'use strict';

  // ================================================================
  // CONFIG
  // ================================================================

  const BLOCKED_SCHEMES = new Set(['javascript:', 'data:', 'blob:', 'about:']);

  const AD_PATTERNS = [
    /doubleclick\.net/i,
    /googlesyndication\.com/i,
    /adservice\.google\./i,
    /pagead2\.googlesyndication/i,
    /amazon-adsystem\.com/i,
    /adnxs\.com/i,
    /rubiconproject\.com/i,
    /openx\.net/i,
    /pubmatic\.com/i,
    /smartadserver\.com/i,
    /outbrain\.com/i,
    /taboola\.com/i,
    /revcontent\.com/i,
    /trafficjunky\.net/i,
    /exoclick\.com/i,
    /juicyads\.com/i,
    /propellerads\.com/i,
    /popcash\.net/i,
    /popads\.net/i,
    /\/aff\//i,
    /\/affiliate\//i,
    /[?&]redirect=/i,
    /[?&]url=https?:/i,
    /[?&]goto=/i,
    /[?&]out=/i,
    /[?&]track=/i,
    /go\.php\?/i,
    /click\.php\?/i,
    /\/redir\?/i,
  ];

  const JUDOL_PATTERNS = [
    /(^|\.)(slot|casino|judi|judol|bet|poker|togel|livecasino|sportsbook)\./i,
    /\/(slot|casino|judi|judol|bet|poker|togel|deposit|withdraw|jackpot|bonus)\b/i,
    /\b(slot|casino|judi|judol|bet|poker|togel|jackpot|bonus|spin|gacor|maxwin|rtp)\b/i,
    /\/(login|register|daftar|deposit|withdraw|member|promo|bonus)\b.*\b(slot|casino|bet|poker|togel)\b/i,
  ];

  const OVERLAY = {
    sizeThreshold: 0.70,
    zThreshold: 1000,
    minTextLength: 8,
  };

  // ================================================================
  // BRIDGE
  // ================================================================

  function getBridge() {
    return window.__VE_ANTI_REDIRECT_BRIDGE__ || null;
  }

  // Fallback state so we can start protecting at document_start even before content.js loads.
  // Once the bridge exists, the bridge becomes the source of truth.
  let fallbackExtensionEnabled = true;
  let fallbackSettings = null;

  (function initFallbackState() {
    try {
      // Load global settings ASAP.
      const c = globalThis.chrome;
      c?.storage?.local?.get?.('ve_settings', (result) => {
        if (c?.runtime?.lastError) return;
        const s = result?.ve_settings;
        if (s && typeof s === 'object') {
          fallbackSettings = s;
          if (s.globalEnabled === false) fallbackExtensionEnabled = false;
        }
      });
    } catch {
      /* ignore */
    }

    try {
      // Load per-domain enabled state ASAP.
      const hostname = location.hostname;
      const c = globalThis.chrome;
      c?.runtime?.sendMessage?.({ type: 'VE_GET_STATE', hostname }, (response) => {
        if (c?.runtime?.lastError) return;
        if (typeof response?.enabled === 'boolean') fallbackExtensionEnabled = response.enabled;
      });
    } catch {
      /* ignore */
    }
  })();

  function getSettings() {
    const bridge = getBridge();
    const s = bridge?.settings;
    if (s && typeof s === 'object') return s;
    return fallbackSettings && typeof fallbackSettings === 'object' ? fallbackSettings : null;
  }

  function isEnabled() {
    const bridge = getBridge();
    const enabled = bridge ? Boolean(bridge.extensionEnabled) : Boolean(fallbackExtensionEnabled);
    const settings = getSettings();
    return enabled && Boolean(settings?.antiRedirect);
  }

  function toast(msg, type = 'success') {
    try {
      const bridge = getBridge();
      bridge?.toast?.(msg, type);
    } catch {
      /* noop */
    }
  }

  // ================================================================
  // URL UTILS
  // ================================================================

  function isBlockedScheme(scheme) {
    if (!scheme) return false;
    const normalized = String(scheme).toLowerCase();
    return BLOCKED_SCHEMES.has(normalized);
  }

  function normalizeURL(input) {
    if (!input) return null;

    // Support URL objects (history.pushState can receive URL)
    if (input instanceof URL) return input;

    if (typeof input !== 'string') return null;

    const raw = input.trim();
    if (!raw) return null;
    if (raw.startsWith('#')) return null;

    // Fast path: detect explicit scheme before URL parsing.
    const scheme = raw.split(':', 1)[0].toLowerCase() + ':';
    if (isBlockedScheme(scheme)) {
      // Signal "blocked" by returning a synthetic URL-like object with protocol set.
      // We don't want to parse/resolve these schemes.
      return { protocol: scheme, href: raw, hostname: '', pathname: '', search: '' };
    }

    try {
      return new URL(raw, location.href);
    } catch {
      return null;
    }
  }

  function matchesAny(text, patterns) {
    if (!text) return false;
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) return true;
    }
    return false;
  }

  function matchesDomainList(url) {
    const settings = getSettings();
    const domains = settings?.adDomains;
    if (!Array.isArray(domains) || domains.length === 0) return false;

    const h = url.hostname.toLowerCase();
    for (const dRaw of domains) {
      const d = String(dRaw || '').trim().toLowerCase();
      if (!d) continue;

      if (d.endsWith('.')) {
        // Prefix match: "track." -> track.example.com
        if (h.startsWith(d) || h.includes('.' + d)) return true;
        continue;
      }

      if (h === d || h.endsWith('.' + d)) return true;
    }
    return false;
  }

  function isBlockedURL(input) {
    const url = normalizeURL(input);
    if (!url) return false;

    // Treat dangerous schemes as blocked (javascript:/data:/blob:/about:)
    if (isBlockedScheme(url.protocol)) return true;

    if (matchesDomainList(url)) return true;

    const full = `${url.href} ${url.hostname} ${url.pathname} ${url.search}`;
    return matchesAny(full, AD_PATTERNS);
  }

  function isJudolURL(input) {
    const url = normalizeURL(input);
    if (!url) return false;

    if (isBlockedScheme(url.protocol)) return true;

    const full = `${url.href} ${url.hostname} ${url.pathname} ${url.search}`;
    return matchesAny(full, JUDOL_PATTERNS);
  }

  // ================================================================
  // DOM UTILS
  // ================================================================

  function hideNode(node) {
    if (!(node instanceof Element)) return;
    node.dataset.adbRemoved = '1';
    node.setAttribute('aria-hidden', 'true');
    node.style.setProperty('display', 'none', 'important');
    node.style.setProperty('visibility', 'hidden', 'important');
    node.style.setProperty('pointer-events', 'none', 'important');
  }

  function safeRemove(node) {
    if (!(node instanceof Element)) return;
    try {
      node.remove();
    } catch {
      hideNode(node);
    }
  }

  // ================================================================
  // DETECTION: LINK / FORM / OVERLAY
  // ================================================================

  function findSuspiciousAnchor(target) {
    const el = target instanceof Element ? target.closest('a[href], area[href]') : null;
    if (!el) return null;
    const href = el.getAttribute('href') || el.href;
    if (isBlockedURL(href) || isJudolURL(href)) return el;
    return null;
  }

  function findSuspiciousForm(target) {
    const form = target instanceof Element ? target.closest('form[action]') : null;
    if (!form) return null;
    const action = form.getAttribute('action') || '';
    if (isBlockedURL(action) || isJudolURL(action)) return form;
    return null;
  }

  function isLikelyOverlay(el) {
    if (!(el instanceof Element)) return false;
    if (el.hasAttribute('data-adb-removed')) return false;

    const tag = el.tagName;
    if (!['DIV', 'SPAN', 'A', 'SECTION', 'ASIDE', 'ARTICLE', 'IFRAME'].includes(tag)) return false;

    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!vw || !vh) return false;

    const coversLargeArea =
      rect.width >= vw * OVERLAY.sizeThreshold &&
      rect.height >= vh * OVERLAY.sizeThreshold;
    if (!coversLargeArea) return false;

    const zIndex = Number.parseInt(style.zIndex, 10);
    const hasHighZ = Number.isFinite(zIndex) && zIndex >= OVERLAY.zThreshold;

    const opacity = Number.parseFloat(style.opacity);
    const isInvisible =
      opacity === 0 ||
      style.visibility === 'hidden' ||
      style.display === 'none' ||
      style.pointerEvents === 'none';

    const fixedLike =
      style.position === 'fixed' ||
      style.position === 'absolute' ||
      style.position === 'sticky';

    const atTopLeft = rect.top <= 12 && rect.left <= 12;
    const textLen = (el.textContent || '').trim().length;

    if (tag === 'IFRAME') {
      const src = el.getAttribute('src') || '';
      return isBlockedURL(src) || isJudolURL(src) || (hasHighZ && fixedLike);
    }

    return ((isInvisible && hasHighZ) || (hasHighZ && fixedLike && atTopLeft)) && textLen < OVERLAY.minTextLength;
  }

  function scanNodeForThreats(root) {
    if (!(root instanceof Element)) return;

    // Meta refresh
    if (root.tagName === 'META' && (root.getAttribute('http-equiv') || '').toLowerCase() === 'refresh') {
      safeRemove(root);
      toast('Blocked meta refresh');
      return;
    }

    // Suspicious frames
    if (root.tagName === 'IFRAME' || root.tagName === 'EMBED' || root.tagName === 'OBJECT') {
      const src = root.getAttribute('src') || root.getAttribute('data') || '';
      if (isBlockedURL(src) || isJudolURL(src)) {
        safeRemove(root);
        toast('Blocked suspicious frame');
        return;
      }
    }

    const candidates = [root, ...root.querySelectorAll('div,span,a,section,aside,article,iframe')];
    for (const el of candidates) {
      if (el instanceof Element && isLikelyOverlay(el)) {
        hideNode(el);
      }
    }
  }

  // ================================================================
  // OBSERVER
  // ================================================================

  let setupDone = false;
  let observer = null;
  let scanScheduled = false;

  function scanExistingOverlays() {
    if (!isEnabled()) return;

    let removed = 0;
    const candidates = document.querySelectorAll('div, span, a, section, aside, article, iframe');

    candidates.forEach((el) => {
      if (!(el instanceof Element)) return;

      const src = el.getAttribute('src') || '';
      if (el.tagName === 'IFRAME' && (isBlockedURL(src) || isJudolURL(src))) {
        safeRemove(el);
        removed++;
        return;
      }

      if (isLikelyOverlay(el)) {
        hideNode(el);
        removed++;
      }
    });

    if (removed > 0) toast(`Removed ${removed} suspicious element(s)`);
  }

  function scheduleRescan() {
    if (scanScheduled) return;
    scanScheduled = true;

    requestAnimationFrame(() => {
      scanScheduled = false;
      scanExistingOverlays();
    });
  }

  function startObserver() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      if (!isEnabled()) return;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) scanNodeForThreats(node);
        }
      }

      scheduleRescan();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function removeMetaRefresh() {
    document.querySelectorAll('meta[http-equiv="refresh" i]').forEach(safeRemove);
  }

  // ================================================================
  // PATCHES
  // ================================================================

  let origWindowOpen = null;
  let origHistoryPushState = null;
  let origHistoryReplaceState = null;
  let origLocationAssign = null;
  let origLocationReplace = null;

  function patchWindowOpen() {
    if (origWindowOpen) return;

    origWindowOpen = window.open;
    window.open = function patchedOpen(url, name, features) {
      if (isEnabled()) {
        if (!url || isBlockedURL(url) || isJudolURL(url)) {
          toast('Blocked popup redirect');
          return null;
        }

        // Common popunder behavior: unnamed "_blank" windows.
        if (!name || name === '_blank') {
          toast('Blocked unsolicited popup');
          return null;
        }
      }

      return origWindowOpen.call(this, url, name, features);
    };
  }

  function patchHistory() {
    if (!origHistoryPushState) {
      origHistoryPushState = history.pushState.bind(history);
      history.pushState = function (state, title, url) {
        if (isEnabled() && (isBlockedURL(url) || isJudolURL(url))) {
          toast('Blocked history.pushState redirect');
          return;
        }
        return origHistoryPushState(state, title, url);
      };
    }

    if (!origHistoryReplaceState) {
      origHistoryReplaceState = history.replaceState.bind(history);
      history.replaceState = function (state, title, url) {
        if (isEnabled() && (isBlockedURL(url) || isJudolURL(url))) {
          toast('Blocked history.replaceState redirect');
          return;
        }
        return origHistoryReplaceState(state, title, url);
      };
    }
  }

  function patchLocationMethods() {
    // Not all environments allow patching; try prototype first.
    try {
      const proto = Location?.prototype;
      if (proto && !origLocationAssign && typeof proto.assign === 'function') {
        origLocationAssign = proto.assign;
        proto.assign = function patchedAssign(url) {
          if (isEnabled() && (isBlockedURL(url) || isJudolURL(url))) {
            toast('Blocked location.assign redirect');
            return;
          }
          return origLocationAssign.call(this, url);
        };
      }
    } catch {
      /* ignore */
    }

    try {
      const proto = Location?.prototype;
      if (proto && !origLocationReplace && typeof proto.replace === 'function') {
        origLocationReplace = proto.replace;
        proto.replace = function patchedReplace(url) {
          if (isEnabled() && (isBlockedURL(url) || isJudolURL(url))) {
            toast('Blocked location.replace redirect');
            return;
          }
          return origLocationReplace.call(this, url);
        };
      }
    } catch {
      /* ignore */
    }
  }

  // ================================================================
  // EVENTS
  // ================================================================

  function onClick(e) {
    if (!isEnabled()) return;

    const anchor = findSuspiciousAnchor(e.target);
    if (anchor) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      try {
        const u = new URL(anchor.href, location.href);
        toast(`Blocked redirect: ${u.hostname}`);
      } catch {
        toast('Blocked redirect');
      }
      return;
    }

    const form = findSuspiciousForm(e.target);
    if (form) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toast('Blocked suspicious form submit');
      return;
    }

    if (e.target instanceof Element && isLikelyOverlay(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      hideNode(e.target);
      toast('Removed invisible overlay');
    }
  }

  function onAuxClick(e) {
    if (!isEnabled()) return;
    if (e.button !== 1) return;

    const anchor = findSuspiciousAnchor(e.target);
    if (anchor) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toast('Blocked middle-click redirect');
    }
  }

  function onMouseDown(e) {
    if (!isEnabled()) return;
    if (e.target instanceof Element && isLikelyOverlay(e.target)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      hideNode(e.target);
    }
  }

  function onSubmit(e) {
    if (!isEnabled()) return;

    const form = e.target instanceof Element ? e.target.closest('form[action]') : null;
    if (!form) return;

    const action = form.getAttribute('action') || '';
    if (isBlockedURL(action) || isJudolURL(action)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      toast('Blocked suspicious form submission');
    }
  }

  // ================================================================
  // PUBLIC API
  // ================================================================

  function setupGlobalAntiRedirect() {
    if (setupDone) return;
    setupDone = true;

    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onAuxClick, true);
    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('submit', onSubmit, true);

    patchWindowOpen();
    patchHistory();
    patchLocationMethods();

    removeMetaRefresh();
    startObserver();
    scanExistingOverlays();
  }

  function teardownGlobalAntiRedirect() {
    if (!setupDone) return;

    document.removeEventListener('click', onClick, true);
    document.removeEventListener('auxclick', onAuxClick, true);
    document.removeEventListener('mousedown', onMouseDown, true);
    document.removeEventListener('submit', onSubmit, true);

    if (observer) {
      observer.disconnect();
      observer = null;
    }

    if (origWindowOpen) {
      window.open = origWindowOpen;
      origWindowOpen = null;
    }

    if (origHistoryPushState) {
      history.pushState = origHistoryPushState;
      origHistoryPushState = null;
    }

    if (origHistoryReplaceState) {
      history.replaceState = origHistoryReplaceState;
      origHistoryReplaceState = null;
    }

    try {
      if (origLocationAssign && Location?.prototype) {
        Location.prototype.assign = origLocationAssign;
        origLocationAssign = null;
      }
    } catch {
      /* ignore */
    }

    try {
      if (origLocationReplace && Location?.prototype) {
        Location.prototype.replace = origLocationReplace;
        origLocationReplace = null;
      }
    } catch {
      /* ignore */
    }

    setupDone = false;
  }

  window.AntiRedirectBlocker = {
    setup: setupGlobalAntiRedirect,
    teardown: teardownGlobalAntiRedirect,
    isBlockedURL,
    isJudolURL,
  };

  // Install early so window.open/history/location/meta-refresh protection is present ASAP.
  // Actual blocking decisions still respect settings and per-domain state.
  setupGlobalAntiRedirect();
})();
