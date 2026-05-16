// @ts-nocheck
import './styles.css';
/* ============================================================
   Video Enhancer – Content Script
   ============================================================
   Injected on <all_urls>. Responsible for:
   1. Detecting <video> elements (including dynamically loaded ones)
   2. Attaching a floating control panel with seek & subtitle buttons
   3. Parsing .srt / .vtt subtitle files and syncing with playback
   4. Anti-redirect protection on player clicks
   5. Respecting per-domain toggle via background messaging
   ============================================================ */

(function () {
  'use strict';

  // Prevent double injection in the same frame
  if (window.__VIDEO_ENHANCER_INJECTED__) return;
  window.__VIDEO_ENHANCER_INJECTED__ = true;

  // ---- Default Settings ----
  const DEFAULT_SETTINGS = {
    globalEnabled: true,
    showPanel: true,
    autoDetect: true,
    autoPause: false,
    bypassSiteAutoPause: false,
    panelOpacity: 72,
    subFontSize: 22,
    subFontColor: '#ffffff',
    subBgColor: '#000000',
    subBgOpacity: 70,
    subTextShadow: true,
    subBottom: 12,
    antiRedirect: true,
    blockOutsideIframes: true,
    enableShortcuts: true,
    adDomains: [
      'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
      'adclick.g.doubleclick.net', 'adservice.google.com',
      'ads.yahoo.com', 'ad.doubleclick.net',
      'popads.net', 'popcash.net', 'propellerads.com',
      'adcash.com', 'adsterra.com', 'admaven.com',
      'trafficjunky.com', 'exoclick.com', 'juicyads.com',
      'clickadu.com', 'hilltopads.com', 'evadav.com',
      'pushground.com', 'richpush.com', 'megapush.com',
      'ad-maven.com', 'adnium.com', 'tsyndicate.com',
      'revenuehits.com', 'bidvertiser.com',
      'track.', 'click.', 'rdr.', 'redirect.',
    ],
    lyricsOffset: 0,
  };

  // ---- State ----
  let settings = { ...DEFAULT_SETTINGS };
  let extensionEnabled = true;
  let activeVideo = null;
  let panelEl = null;
  let subtitleOverlay = null;
  let subtitleTextEl = null;
  let subtitleInfoEl = null;
  let subtitleImportBtnEl = null;
  let subtitleMetaEl = null;
  let subtitleMetaTextEl = null;
  let subtitleProgressEl = null;
  let subtitleStatusTextEl = null;
  let subtitleIndicatorEl = null;
  let subtitleToggleEl = null;
  let subtitleMenuEl = null;
  let subtitleMenuOffsetEl = null;
  let subtitleMenuDocHandler = null;
  let subtitleInfoExpanded = false;
  let wrapperEl = null;
  let fileInput = null;
  let subtitleCues = [];
  let loadedSubtitleName = '';
  let subtitleOffsetSec = 0;
  let subtitleVisible = true;
  let syncRAF = null;
  let toastTimeout = null;
  let activityTimeout = null;
  let currentParent = null;
  let panelActivityHandler = null;
  const hostname = location.hostname;

  // ================================================================
  //  UTILITY HELPERS
  // ================================================================

  /**
   * Show a small toast notification.
   */
  function showToast(message, type = 'info') {
    let toast = document.querySelector('.ve-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 've-toast';
      document.body.appendChild(toast);
    }
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.className = 've-toast ve-toast--' + type;
    requestAnimationFrame(() => {
      toast.classList.add('ve-toast--show');
    });
    toastTimeout = setTimeout(() => {
      toast.classList.remove('ve-toast--show');
    }, 3000);
  }

  // ================================================================
  //  ANTI-REDIRECT BRIDGE (for anti-redirect.js)
  // ================================================================

  function installAntiRedirectBridge() {
    if (window.__VE_ANTI_REDIRECT_BRIDGE__) return;

    const bridge = {};
    Object.defineProperties(bridge, {
      extensionEnabled: {
        enumerable: true,
        get() { return extensionEnabled; },
        set(v) { extensionEnabled = Boolean(v); },
      },
      settings: {
        enumerable: true,
        get() { return settings; },
        set(v) { if (v && typeof v === 'object') settings = v; },
      },
    });

    bridge.toast = (message, type = 'info') => showToast(message, type);

    window.__VE_ANTI_REDIRECT_BRIDGE__ = bridge;
  }

  // URL blocking is handled by anti-redirect.js (uses settings.adDomains too).

  // ================================================================
  //  SUBTITLE PARSER
  // ================================================================

  /**
   * Parse an SRT or VTT string into an array of cues:
   * [{ start: seconds, end: seconds, text: string }, ...]
   */
  function parseSubtitle(raw) {
    const cues = [];
    // Normalize line endings
    const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Detect format
    const isVTT = text.trimStart().startsWith('WEBVTT');

    // Split into blocks
    const blocks = text.split(/\n\n+/);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;

      // Find the timing line
      let timingIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
          timingIdx = i;
          break;
        }
      }
      if (timingIdx === -1) continue;

      const timing = lines[timingIdx];
      const match = timing.match(
        /(\d{1,2}:?\d{2}:\d{2}[.,]\d{2,3})\s*-->\s*(\d{1,2}:?\d{2}:\d{2}[.,]\d{2,3})/
      );
      if (!match) continue;

      const start = timeToSeconds(match[1]);
      const end = timeToSeconds(match[2]);
      const subtitleText = lines
        .slice(timingIdx + 1)
        .join('\n')
        .replace(/<[^>]+>/g, '') // strip HTML tags
        .trim();

      if (subtitleText) {
        cues.push({ start, end, text: subtitleText });
      }
    }

    // Sort by start time
    cues.sort((a, b) => a.start - b.start);
    return cues;
  }

  /**
   * Convert a timestamp string (HH:MM:SS,mmm or HH:MM:SS.mmm or MM:SS.mmm)
   * to seconds.
   */
  function timeToSeconds(ts) {
    const cleaned = ts.replace(',', '.');
    const parts = cleaned.split(':');
    if (parts.length === 3) {
      return (
        parseFloat(parts[0]) * 3600 +
        parseFloat(parts[1]) * 60 +
        parseFloat(parts[2])
      );
    }
    if (parts.length === 2) {
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(cleaned) || 0;
  }

  // ================================================================
  //  SUBTITLE SYNC
  // ================================================================

  /**
   * Find the cue that should be displayed at the given time.
   * Uses binary search for performance.
   */
  function findCue(time) {
    // Linear scan is fine for < 5000 cues; binary search for larger files
    for (let i = 0; i < subtitleCues.length; i++) {
      const c = subtitleCues[i];
      if (time >= c.start && time <= c.end) return c;
      // Early exit if we've passed all possible matches
      if (c.start > time + 1) break;
    }
    return null;
  }

  let lastDisplayedText = '';
  let lastActiveCueIndex = -1;

  function formatClock(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const sec = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    const min = Math.floor((totalSeconds / 60) % 60).toString().padStart(2, '0');
    const hour = Math.floor(totalSeconds / 3600);
    return hour > 0 ? `${hour}:${min}:${sec}` : `${min}:${sec}`;
  }

  function formatOffset(offsetSec) {
    const sign = offsetSec >= 0 ? '+' : '−';
    return `${sign}${Math.abs(offsetSec).toFixed(1)}s`;
  }

  function setSubtitleInfoExpanded(expanded) {
    subtitleInfoExpanded = Boolean(expanded);
    if (!subtitleInfoEl) return;
    subtitleInfoEl.classList.toggle('ve-subtitle-info--expanded', subtitleInfoExpanded);
    subtitleInfoEl.classList.toggle('ve-subtitle-info--collapsed', !subtitleInfoExpanded);
    if (subtitleMenuEl && !subtitleInfoExpanded) {
      subtitleMenuEl.classList.remove('ve-subtitle-menu--open');
    }
  }

  function updateSubtitleTitleMarquee() {
    if (!subtitleMetaTextEl) return;
    // Only marquee when subtitle selected and text really overflows
    if (subtitleCues.length === 0) {
      subtitleMetaTextEl.classList.remove('ve-subtitle-info__meta-text--marquee');
      return;
    }
    requestAnimationFrame(() => {
      if (!subtitleMetaTextEl) return;
      const hasOverflow = subtitleMetaTextEl.scrollWidth > subtitleMetaTextEl.clientWidth + 4;
      subtitleMetaTextEl.classList.toggle('ve-subtitle-info__meta-text--marquee', hasOverflow);
    });
  }

  function updateSubtitlePanelInfo(currentTime = 0, status = 'IDLE') {
    if (!subtitleInfoEl || !subtitleMetaEl || !subtitleProgressEl || !subtitleIndicatorEl) return;
    if (subtitleToggleEl) {
      subtitleToggleEl.textContent = subtitleVisible ? 'ON' : 'OFF';
      subtitleToggleEl.classList.toggle('is-off', !subtitleVisible);
    }

    if (subtitleCues.length === 0) {
      subtitleInfoEl.classList.remove('ve-subtitle-info--active');
      if (subtitleMetaTextEl) subtitleMetaTextEl.textContent = 'No Selected';
      updateSubtitleTitleMarquee();
      if (subtitleStatusTextEl) subtitleStatusTextEl.textContent = 'NO FILE • Klik untuk Import subtitle';
      subtitleIndicatorEl.setAttribute('aria-label', 'Subtitle settings');
      if (subtitleMenuOffsetEl) subtitleMenuOffsetEl.textContent = `Offset ${formatOffset(subtitleOffsetSec)}`;
      return;
    }

    subtitleInfoEl.classList.add('ve-subtitle-info--active');
    const subtitleLabel = loadedSubtitleName || 'Custom subtitle';
    if (subtitleMetaTextEl) subtitleMetaTextEl.textContent = subtitleLabel;
    updateSubtitleTitleMarquee();
    if (subtitleStatusTextEl) subtitleStatusTextEl.textContent = `${status} • ${formatClock(currentTime)}`;
    subtitleIndicatorEl.setAttribute('aria-label', 'Subtitle settings');
    if (subtitleMenuOffsetEl) subtitleMenuOffsetEl.textContent = `Offset ${formatOffset(subtitleOffsetSec)}`;
  }

  function syncSubtitles() {
    if (!activeVideo || !subtitleTextEl || subtitleCues.length === 0) {
      updateSubtitlePanelInfo(activeVideo?.currentTime || 0, 'NO FILE');
      syncRAF = requestAnimationFrame(syncSubtitles);
      return;
    }

    const t = activeVideo.currentTime;
    const adjustedTime = Math.max(0, t + subtitleOffsetSec);
    const cue = findCue(adjustedTime);
    let status = 'IDLE';
    if (!subtitleVisible) status = 'HIDDEN';
    else if (activeVideo.ended) status = 'ENDED';
    else if (activeVideo.paused) status = 'PAUSED';
    else if (cue) status = 'LIVE';
    updateSubtitlePanelInfo(t, status);
    const cueIndex = cue ? subtitleCues.indexOf(cue) : -1;
    if (cueIndex !== lastActiveCueIndex || !cue) lastActiveCueIndex = cueIndex;

    if (cue) {
      if (cue.text !== lastDisplayedText) {
        subtitleTextEl.innerHTML = cue.text.replace(/\n/g, '<br>');
        subtitleOverlay.style.opacity = subtitleVisible ? '1' : '0';
        lastDisplayedText = cue.text;
      }
    } else {
      if (lastDisplayedText !== '') {
        subtitleTextEl.innerHTML = '';
        subtitleOverlay.style.opacity = '0';
        lastDisplayedText = '';
      }
      updateSubtitlePanelInfo(t);
      lastActiveCueIndex = -1;
    }

    syncRAF = requestAnimationFrame(syncSubtitles);
  }

  // ================================================================
  //  VIDEO DETECTION
  // ================================================================

  /**
   * Score a video element to determine priority.
   * Larger visible videos that are playing get higher scores.
   */
  function scoreVideo(video) {
    let score = 0;
    const rect = video.getBoundingClientRect();
    const area = rect.width * rect.height;
    score += area;

    // Bonus for currently playing
    if (!video.paused && !video.ended) score += 1_000_000;

    // Bonus for being visible in viewport
    if (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    ) {
      score += 500_000;
    }

    // Penalty for tiny / hidden videos (likely ads or tracking pixels)
    if (area < 5000) score -= 2_000_000;
    if (video.offsetParent === null) score -= 2_000_000;

    return score;
  }

  /**
   * Find the best video on the page.
   */
  function findBestVideo() {
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) return null;

    let best = null;
    let bestScore = -Infinity;

    videos.forEach((v) => {
      const s = scoreVideo(v);
      if (s > bestScore) {
        bestScore = s;
        best = v;
      }
    });

    return best;
  }

  // ================================================================
  //  UI CONSTRUCTION
  // ================================================================

  function createPanel() {
    // Cleanup old panel
    destroyUI();

    const video = findBestVideo();
    if (!video) return;
    activeVideo = video;

    // -- Wrapper --
    // We need to wrap the video's parent context so panel is positioned above it
    wrapperEl = document.createElement('div');
    wrapperEl.className = 've-wrapper';

    // Attempt to wrap the video or its closest container
    const parent = video.parentElement;
    if (parent) {
      // Inherit sizing from parent
      const parentStyle = getComputedStyle(parent);
      if (parentStyle.position === 'static') {
        parent.style.position = 'relative';
      }
    }

    // -- Panel --
    panelEl = document.createElement('div');
    panelEl.className = 've-panel ve-panel-root';
    if (!extensionEnabled || !settings.showPanel) panelEl.classList.add('ve-disabled');

    // Apply panel opacity from settings
    const opacity = (settings.panelOpacity || 72) / 100;
    panelEl.style.background = `rgba(10, 10, 18, ${opacity})`;

    // Seek buttons
    const seekButtons = [
      { label: '−1m', delta: -60 },
      { label: '−5s', delta: -5 },
      { label: '+5s', delta: 5 },
      { label: '+1m', delta: 60 },
    ];

    seekButtons.forEach((btn, idx) => {
      const el = document.createElement('button');
      el.className = 've-btn ve-panel__btn ve-panel__btn--seek';
      if (btn.delta < 0) el.classList.add('ve-panel__btn--seek-back');
      if (btn.delta > 0) el.classList.add('ve-panel__btn--seek-forward');
      if (btn.delta === -60) el.classList.add('ve-panel__btn--seek-back-60');
      if (btn.delta === -5) el.classList.add('ve-panel__btn--seek-back-5');
      if (btn.delta === 5) el.classList.add('ve-panel__btn--seek-forward-5');
      if (btn.delta === 60) el.classList.add('ve-panel__btn--seek-forward-60');
      el.textContent = btn.label;
      el.title = `Seek ${btn.delta > 0 ? '+' : ''}${btn.delta}s`;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (activeVideo) {
          activeVideo.currentTime = Math.max(
            0,
            Math.min(activeVideo.duration || Infinity, activeVideo.currentTime + btn.delta)
          );
          showToast(`Seek ${btn.delta > 0 ? '+' : ''}${btn.delta}s`, 'info');
        }
      });
      panelEl.appendChild(el);

      // Add divider after first two buttons
      if (idx === 1) {
        const divider = document.createElement('span');
        divider.className = 've-divider ve-panel__divider ve-panel__divider--seek-group';
        panelEl.appendChild(divider);
      }
    });

    // Picture in Picture Button
    const pipBtn = document.createElement('button');
    pipBtn.className = 've-btn ve-panel__btn ve-panel__btn--pip';
    pipBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><rect width="8" height="5" x="11" y="12" rx="1" ry="1"/></svg>';
    pipBtn.title = 'Picture in Picture';
    pipBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!activeVideo) return;
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await activeVideo.requestPictureInPicture();
        }
      } catch (err) {
        showToast('PiP failed', 'error');
      }
    });
    panelEl.appendChild(pipBtn);

    // Lock Mode Button
    const lockBtn = document.createElement('button');
    lockBtn.className = 've-btn ve-panel__btn ve-panel__btn--lock';
    const iconLock = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    const iconUnlock = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';
    lockBtn.innerHTML = iconUnlock;
    lockBtn.title = 'Lock Panel (Always Show)';
    lockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isLocked = panelEl.classList.toggle('ve-panel--locked');
      if (isLocked) {
        lockBtn.innerHTML = iconLock;
        lockBtn.title = 'Unlock Panel (Auto-hide)';
        showToast('Panel locked', 'info');
      } else {
        lockBtn.innerHTML = iconUnlock;
        lockBtn.title = 'Lock Panel (Always Show)';
        showToast('Panel auto-hide', 'info');
        if (panelActivityHandler) panelActivityHandler();
      }
    });
    panelEl.appendChild(lockBtn);

    // Divider before subtitle button
    const divider2 = document.createElement('span');
    divider2.className = 've-divider ve-panel__divider ve-panel__divider--before-subtitle';
    panelEl.appendChild(divider2);

    // Subtitle import + status (single container)
    subtitleInfoEl = document.createElement('div');
    subtitleInfoEl.className = 've-subtitle-info ve-panel__subtitle-info ve-subtitle-info--collapsed';
    subtitleInfoEl.title = 'Subtitle controls';
    subtitleInfoEl.addEventListener('mouseenter', () => setSubtitleInfoExpanded(true));
    subtitleInfoEl.addEventListener('mouseleave', () => {
      const isMenuOpen = subtitleMenuEl && subtitleMenuEl.classList.contains('ve-subtitle-menu--open');
      if (!isMenuOpen) {
        setSubtitleInfoExpanded(false);
      }
    });

    subtitleImportBtnEl = document.createElement('button');
    subtitleImportBtnEl.className = 've-btn ve-btn--accent ve-panel__btn ve-panel__btn--subtitle ve-subtitle-info__import';
    subtitleImportBtnEl.type = 'button';
    subtitleImportBtnEl.setAttribute('aria-label', 'Import subtitle');
    subtitleImportBtnEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"/></svg>';
    subtitleImportBtnEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (fileInput) fileInput.click();
    });
    subtitleInfoEl.appendChild(subtitleImportBtnEl);

    const subtitleTextWrap = document.createElement('div');
    subtitleTextWrap.className = 've-subtitle-info__text';
    subtitleMetaEl = document.createElement('div');
    subtitleMetaEl.className = 've-subtitle-info__meta ve-panel__subtitle-meta';
    subtitleMetaTextEl = document.createElement('span');
    subtitleMetaTextEl.className = 've-subtitle-info__meta-text';
    subtitleMetaEl.appendChild(subtitleMetaTextEl);

    subtitleToggleEl = document.createElement('button');
    subtitleToggleEl.className = 've-subtitle-toggle';
    subtitleToggleEl.type = 'button';
    subtitleToggleEl.textContent = 'ON';
    subtitleToggleEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      subtitleVisible = !subtitleVisible;
      if (subtitleOverlay) subtitleOverlay.style.display = subtitleVisible ? '' : 'none';
      updateSubtitlePanelInfo(activeVideo?.currentTime || 0, subtitleVisible ? 'IDLE' : 'HIDDEN');
      showToast(subtitleVisible ? 'Subtitles shown' : 'Subtitles hidden', 'info');
    });
    subtitleProgressEl = document.createElement('div');
    subtitleProgressEl.className = 've-subtitle-info__progress ve-panel__subtitle-progress';
    subtitleStatusTextEl = document.createElement('span');
    subtitleStatusTextEl.className = 've-subtitle-info__status-text';
    subtitleProgressEl.appendChild(subtitleStatusTextEl);
    subtitleTextWrap.appendChild(subtitleMetaEl);
    subtitleTextWrap.appendChild(subtitleProgressEl);
    subtitleInfoEl.appendChild(subtitleTextWrap);

    subtitleIndicatorEl = document.createElement('button');
    subtitleIndicatorEl.className = 've-subtitle-info__indicator ve-panel__subtitle-indicator';
    subtitleIndicatorEl.type = 'button';
    subtitleIndicatorEl.textContent = '⋯';
    subtitleIndicatorEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!subtitleMenuEl) return;
      setSubtitleInfoExpanded(true);
      subtitleMenuEl.classList.toggle('ve-subtitle-menu--open');
    });
    subtitleInfoEl.appendChild(subtitleIndicatorEl);

    subtitleMenuEl = document.createElement('div');
    subtitleMenuEl.className = 've-subtitle-menu';
    subtitleMenuEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    const offsetMinusBtn = document.createElement('button');
    offsetMinusBtn.className = 've-subtitle-menu__item';
    offsetMinusBtn.type = 'button';
    offsetMinusBtn.textContent = 'Offset -0.5s';
    offsetMinusBtn.addEventListener('click', () => {
      subtitleOffsetSec = Math.max(-10, subtitleOffsetSec - 0.5);
      updateSubtitlePanelInfo(activeVideo?.currentTime || 0);
      showToast(`Subtitle offset ${formatOffset(subtitleOffsetSec)}`, 'info');
    });

    const offsetPlusBtn = document.createElement('button');
    offsetPlusBtn.className = 've-subtitle-menu__item';
    offsetPlusBtn.type = 'button';
    offsetPlusBtn.textContent = 'Offset +0.5s';
    offsetPlusBtn.addEventListener('click', () => {
      subtitleOffsetSec = Math.min(10, subtitleOffsetSec + 0.5);
      updateSubtitlePanelInfo(activeVideo?.currentTime || 0);
      showToast(`Subtitle offset ${formatOffset(subtitleOffsetSec)}`, 'info');
    });

    const offsetResetBtn = document.createElement('button');
    offsetResetBtn.className = 've-subtitle-menu__item';
    offsetResetBtn.type = 'button';
    offsetResetBtn.textContent = 'Reset Offset';
    offsetResetBtn.addEventListener('click', () => {
      subtitleOffsetSec = 0;
      updateSubtitlePanelInfo(activeVideo?.currentTime || 0);
      showToast('Subtitle offset reset', 'info');
    });

    subtitleMenuOffsetEl = document.createElement('div');
    subtitleMenuOffsetEl.className = 've-subtitle-menu__offset';

    subtitleMenuEl.appendChild(offsetMinusBtn);
    subtitleMenuEl.appendChild(offsetPlusBtn);
    subtitleMenuEl.appendChild(offsetResetBtn);
    subtitleMenuEl.appendChild(subtitleMenuOffsetEl);

    const menuHr = document.createElement('div');
    menuHr.className = 've-subtitle-menu__hr';
    subtitleMenuEl.appendChild(menuHr);

    subtitleToggleEl.className = 've-subtitle-menu__item ve-subtitle-toggle';
    subtitleMenuEl.appendChild(subtitleToggleEl);

    subtitleInfoEl.appendChild(subtitleMenuEl);
    subtitleMenuDocHandler = (evt) => {
      if (!subtitleMenuEl || !subtitleInfoEl) return;
      if (!subtitleInfoEl.contains(evt.target)) {
        subtitleMenuEl.classList.remove('ve-subtitle-menu--open');
        setSubtitleInfoExpanded(false);
      }
    };
    document.addEventListener('click', subtitleMenuDocHandler, true);

    panelEl.appendChild(subtitleInfoEl);
    updateSubtitlePanelInfo(0, 'NO FILE');

    // Hidden file input
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.srt,.vtt,text/vtt,application/x-subrip';
    fileInput.className = 've-file-input ve-panel__file-input';
    fileInput.addEventListener('change', handleSubtitleFile);
    panelEl.appendChild(fileInput);

    // -- Subtitle Overlay --
    subtitleOverlay = document.createElement('div');
    subtitleOverlay.className = 've-subtitle-overlay';
    if (!extensionEnabled) subtitleOverlay.classList.add('ve-disabled');
    subtitleOverlay.style.opacity = '0';
    subtitleOverlay.style.bottom = (settings.subBottom || 12) + '%';

    subtitleTextEl = document.createElement('div');
    subtitleTextEl.className = 've-subtitle-text';
    applySubtitleStyles(subtitleTextEl);
    subtitleOverlay.appendChild(subtitleTextEl);

    // -- Attach to DOM --
    if (parent) {
      parent.appendChild(panelEl);
      parent.appendChild(subtitleOverlay);
      parent.classList.add('ve-wrapper');
      currentParent = parent;
    } else {
      document.body.appendChild(panelEl);
      document.body.appendChild(subtitleOverlay);
      currentParent = document.body;
    }

    // Auto-hide activity tracker
    panelActivityHandler = () => {
      if (!panelEl) return;
      panelEl.classList.add('ve-visible');
      clearTimeout(activityTimeout);
      if (!panelEl.classList.contains('ve-panel--locked')) {
        activityTimeout = setTimeout(() => {
          if (panelEl && !panelEl.classList.contains('ve-panel--locked')) {
            panelEl.classList.remove('ve-visible');
          }
        }, 2500);
      }
    };

    if (currentParent) {
      currentParent.addEventListener('mousemove', panelActivityHandler);
      currentParent.addEventListener('click', panelActivityHandler);
    }
    panelEl.addEventListener('mouseenter', () => {
      clearTimeout(activityTimeout);
      panelEl.classList.add('ve-visible');
    });
    panelEl.addEventListener('mouseleave', () => {
      if (panelActivityHandler) panelActivityHandler();
    });
    panelActivityHandler();

    // Start subtitle sync loop
    if (syncRAF) cancelAnimationFrame(syncRAF);
    lastDisplayedText = '';
    syncRAF = requestAnimationFrame(syncSubtitles);

    // Listen for video events to re-sync on seek
    video.addEventListener('seeked', onVideoSeeked);
    video.addEventListener('play', onVideoPlay);
  }

  function destroyUI() {
    if (currentParent && panelActivityHandler) {
      currentParent.removeEventListener('mousemove', panelActivityHandler);
      currentParent.removeEventListener('click', panelActivityHandler);
    }
    clearTimeout(activityTimeout);
    panelActivityHandler = null;
    currentParent = null;

    if (panelEl && panelEl.parentNode) {
      panelEl.parentNode.removeChild(panelEl);
    }
    if (subtitleOverlay && subtitleOverlay.parentNode) {
      subtitleOverlay.parentNode.removeChild(subtitleOverlay);
    }
    if (syncRAF) {
      cancelAnimationFrame(syncRAF);
      syncRAF = null;
    }
    if (activeVideo) {
      activeVideo.removeEventListener('seeked', onVideoSeeked);
      activeVideo.removeEventListener('play', onVideoPlay);
    }
    if (subtitleMenuDocHandler) {
      document.removeEventListener('click', subtitleMenuDocHandler, true);
      subtitleMenuDocHandler = null;
    }
    panelEl = null;
    subtitleOverlay = null;
    subtitleTextEl = null;
    subtitleInfoEl = null;
    subtitleImportBtnEl = null;
    subtitleMetaEl = null;
    subtitleMetaTextEl = null;
    subtitleProgressEl = null;
    subtitleStatusTextEl = null;
    subtitleIndicatorEl = null;
    subtitleToggleEl = null;
    subtitleMenuEl = null;
    subtitleMenuOffsetEl = null;
    wrapperEl = null;
    fileInput = null;
    lastDisplayedText = '';
    lastActiveCueIndex = -1;
  }

  function onVideoSeeked() {
    lastDisplayedText = ''; // Force subtitle refresh
    lastActiveCueIndex = -1;
  }

  function onVideoPlay() {
    // If a different video starts playing, re-evaluate best video
    const best = findBestVideo();
    if (best && best !== activeVideo) {
      createPanel();
    }
  }

  // ================================================================
  //  SUBTITLE FILE HANDLING
  // ================================================================

  function handleSubtitleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      try {
        subtitleCues = parseSubtitle(content);
        if (subtitleCues.length === 0) {
          loadedSubtitleName = '';
          lastActiveCueIndex = -1;
          updateSubtitlePanelInfo(activeVideo?.currentTime || 0);
          showToast('No cues found in subtitle file.', 'error');
        } else {
          loadedSubtitleName = file.name;
          showToast(`Loaded ${subtitleCues.length} subtitle cues from "${file.name}"`, 'success');
          lastDisplayedText = ''; // force refresh
          lastActiveCueIndex = -1;
          updateSubtitlePanelInfo(activeVideo?.currentTime || 0);
        }
      } catch (err) {
        loadedSubtitleName = '';
        lastActiveCueIndex = -1;
        updateSubtitlePanelInfo(activeVideo?.currentTime || 0);
        showToast('Failed to parse subtitle file.', 'error');
        console.error('[Video Enhancer] Subtitle parse error:', err);
      }
    };
    reader.onerror = () => {
      showToast('Failed to read file.', 'error');
    };
    reader.readAsText(file);

    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  // ================================================================
  //  ANTI-REDIRECT & INVISIBLE OVERLAY BLOCKER
  // ================================================================
  // NOTE: Implemented in anti-redirect.js via `window.AntiRedirectBlocker`.

  // ================================================================
  //  IFRAME CLEANUP — Comprehensive Ad Iframe Removal
  // ================================================================

  // Known ad/tracking iframe URL patterns
  const IFRAME_AD_PATTERNS = [
    /doubleclick\.net/i, /googlesyndication\.com/i, /googleadservices\.com/i,
    /adservice\.google/i, /amazon-adsystem\.com/i,
    /facebook\.com\/tr/i, /connect\.facebook/i,
    /popads\.net/i, /popcash\.net/i, /propellerads/i,
    /adcash\.com/i, /adsterra/i, /admaven/i,
    /trafficjunky/i, /exoclick/i, /juicyads/i,
    /clickadu/i, /hilltopads/i, /evadav/i,
    /ad-maven/i, /tsyndicate/i, /bidvertiser/i,
    /about:blank/i,
  ];

  /**
   * Determine if an iframe is suspicious (likely an ad or tracker).
   * Uses multiple heuristics to avoid false positives.
   */
  function isAdIframe(iframe) {
    const src = (iframe.src || iframe.getAttribute('src') || '').toLowerCase();
    const style = iframe.style;
    const rect = iframe.getBoundingClientRect();
    const computedStyle = (() => {
      try { return window.getComputedStyle(iframe); }
      catch (_) { return null; }
    })();

    // 1. Outside <body> — almost always malicious
    if (document.body && !document.body.contains(iframe)) {
      return { remove: true, reason: 'outside-body' };
    }

    // 2. Known ad/tracker URL in src
    if (src && IFRAME_AD_PATTERNS.some((p) => p.test(src))) {
      return { remove: true, reason: 'ad-domain-src' };
    }

    // 3. Also check against user-configured ad domains
    if (src && src !== 'about:blank') {
      try {
        const iframeHost = new URL(src, location.href).hostname.toLowerCase();
        const domains = settings.adDomains || [];
        const matchesDomain = domains.some((d) => {
          if (d.endsWith('.')) return iframeHost.startsWith(d) || iframeHost.includes('.' + d);
          return iframeHost === d || iframeHost.endsWith('.' + d);
        });
        if (matchesDomain) return { remove: true, reason: 'user-blocklist-src' };
      } catch (_) { /* invalid URL */ }
    }

    // 4. Zero-size / 1x1 tracking pixels disguised as iframes
    const w = rect.width || parseInt(iframe.width, 10) || 0;
    const h = rect.height || parseInt(iframe.height, 10) || 0;
    if (w <= 1 && h <= 1) {
      return { remove: true, reason: 'tracking-pixel' };
    }

    // 5. Off-screen positioning (negative coords / huge offsets)
    if (computedStyle) {
      const top = parseInt(computedStyle.top, 10);
      const left = parseInt(computedStyle.left, 10);
      if ((top < -100 || left < -100) && computedStyle.position !== 'static') {
        return { remove: true, reason: 'off-screen' };
      }
    }

    // 6. Invisible overlay iframe covering the viewport
    if (w > window.innerWidth * 0.8 && h > window.innerHeight * 0.8) {
      const opacity = computedStyle ? parseFloat(computedStyle.opacity) : 1;
      const zIndex = computedStyle ? parseInt(computedStyle.zIndex, 10) : 0;
      if (opacity <= 0.05 || (zIndex > 999 && opacity < 0.5)) {
        return { remove: true, reason: 'invisible-overlay' };
      }
    }

    // 7. Hidden via inline styles (display:none + src pointing to ad)
    if (style.display === 'none' || style.visibility === 'hidden') {
      if (src && src !== 'about:blank' && src !== location.href) {
        // Only remove hidden iframes with external src
        const isSameOrigin = (() => {
          try { return new URL(src, location.href).origin === location.origin; }
          catch (_) { return false; }
        })();
        if (!isSameOrigin) {
          return { remove: true, reason: 'hidden-cross-origin' };
        }
      }
    }

    return { remove: false, reason: null };
  }

  /**
   * Scan and cleanup suspicious iframes.
   */
  function cleanupOutsideIframes() {
    if (!extensionEnabled || !settings.blockOutsideIframes) return;

    // Query iframes from the entire document (including outside body)
    const allIframes = document.querySelectorAll('iframe');
    // Also check for iframes that are direct children of <html> but not in body
    const htmlChildren = document.documentElement ? document.documentElement.children : [];

    let removedCount = 0;
    const processed = new Set();

    // Process all iframes found via querySelectorAll
    allIframes.forEach((iframe) => {
      if (processed.has(iframe)) return;
      processed.add(iframe);

      const result = isAdIframe(iframe);
      if (result.remove) {
        try {
          // Neutralize the iframe before removing
          iframe.src = 'about:blank';
          iframe.srcdoc = '';
          iframe.style.display = 'none';
          iframe.style.pointerEvents = 'none';

          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
          removedCount++;
        } catch (e) {
          // Fallback: just hide it
          try {
            iframe.style.display = 'none';
            iframe.style.pointerEvents = 'none';
            iframe.style.width = '0';
            iframe.style.height = '0';
          } catch (_) { /* truly inaccessible */ }
        }
      }
    });

    // Also scan direct <html> children for stray iframes
    for (const child of htmlChildren) {
      if (child.tagName === 'IFRAME' && !processed.has(child)) {
        try {
          child.src = 'about:blank';
          child.parentNode.removeChild(child);
          removedCount++;
        } catch (_) { /* ignore */ }
      }
    }

    if (removedCount > 0) {
      console.log(`[Video Enhancer] Cleaned up ${removedCount} suspicious iframe(s)`);
    }
  }

  // ================================================================
  //  MUTATION OBSERVER – Detect new / replaced video elements
  // ================================================================

  let debounceTimer = null;

  function onMutation() {
    // Debounce to avoid excessive re-scans
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const best = findBestVideo();
      if (best && best !== activeVideo) {
        createPanel();
      } else if (!best && activeVideo) {
        // Video was removed
        destroyUI();
        activeVideo = null;
      } else if (best && best === activeVideo) {
        // Same video – make sure panel is still attached
        if (panelEl && !document.contains(panelEl)) {
          createPanel();
        }
      }
    }, 400);
  }

  const observer = new MutationObserver((mutations) => {
    // Quick check: does any mutation involve a video element?
    let relevant = false;
    for (const m of mutations) {
      if (m.type === 'childList') {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            if (node.tagName === 'VIDEO' || node.querySelector?.('video')) {
              relevant = true;
              break;
            }
          }
        }
        if (!relevant) {
          for (const node of m.removedNodes) {
            if (node.nodeType === 1) {
              if (node.tagName === 'VIDEO' || node === activeVideo) {
                relevant = true;
                break;
              }
            }
          }
        }
      }
      if (relevant) break;
    }

    if (relevant) {
      onMutation();
    }
    
    // Also periodically cleanup outside iframes if mutations happen
    cleanupOutsideIframes();
  });

  // ================================================================
  //  PER-DOMAIN TOGGLE & SETTINGS SYNC
  // ================================================================

  /**
   * Apply subtitle text styling from current settings.
   */
  function applySubtitleStyles(el) {
    if (!el) return;
    el.style.fontSize = (settings.subFontSize || 22) + 'px';
    el.style.color = settings.subFontColor || '#ffffff';

    // Background with opacity
    const hex = (settings.subBgColor || '#000000').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const bgAlpha = (settings.subBgOpacity ?? 70) / 100;
    el.style.background = `rgba(${r}, ${g}, ${b}, ${bgAlpha})`;

    if (settings.subTextShadow !== false) {
      el.style.textShadow = '0 0 4px rgba(0,0,0,0.9), 0 1px 6px rgba(0,0,0,0.7), 1px 1px 2px rgba(0,0,0,0.8)';
    } else {
      el.style.textShadow = 'none';
    }
  }

  /**
   * Apply settings to existing UI elements.
   */
  function applySettingsToUI() {
    if (panelEl) {
      const opacity = (settings.panelOpacity || 72) / 100;
      panelEl.style.background = `rgba(10, 10, 18, ${opacity})`;
    
    // Sync subtitle offset from settings
    subtitleOffsetSec = settings.lyricsOffset || 0;
    panelEl.classList.toggle('ve-disabled', !extensionEnabled || !settings.showPanel);
    }
    if (subtitleOverlay) {
      subtitleOverlay.style.bottom = (settings.subBottom || 12) + '%';
      subtitleOverlay.classList.toggle('ve-disabled', !extensionEnabled);
    }
    if (subtitleTextEl) {
      applySubtitleStyles(subtitleTextEl);
    }
    // Update main world bypass flag
    if (document.documentElement) {
      document.documentElement.dataset.veBypassUnfocus = 
        (extensionEnabled && settings.bypassSiteAutoPause) ? 'true' : 'false';
    }
  }

  function applyEnabledState(enabled) {
    extensionEnabled = enabled;
    applySettingsToUI();
  }

  /**
   * Load settings from storage and apply.
   */
  function loadSettings(callback) {
    try {
      chrome.storage?.local?.get('ve_settings', (result) => {
        if (chrome.runtime.lastError) {
          if (callback) callback();
          return;
        }
        if (result.ve_settings) {
          settings = { ...DEFAULT_SETTINGS, ...result.ve_settings };
          if (settings.globalEnabled === false) {
            extensionEnabled = false;
          }
          applySettingsToUI();
        }
        if (callback) callback();
      });
    } catch (_) {
      if (callback) callback();
    }
  }

  // Listen for state changes from popup AND settings updates from options page
  chrome.runtime?.onMessage?.addListener((msg) => {
    if (msg.type === 'VE_STATE_CHANGED') {
      applyEnabledState(msg.enabled);
    }
    if (msg.type === 'VE_SETTINGS_UPDATED' && msg.settings) {
      settings = { ...DEFAULT_SETTINGS, ...msg.settings };
      if (settings.globalEnabled === false) {
        extensionEnabled = false;
      } else {
        // Re-check per-domain state
        try {
          chrome.runtime?.sendMessage?.(
            { type: 'VE_GET_STATE', hostname },
            (response) => {
              if (chrome.runtime.lastError) return;
              extensionEnabled = response?.enabled ?? true;
              applySettingsToUI();
            }
          );
        } catch (_) {
          extensionEnabled = true;
        }
      }
      applySettingsToUI();
    }
  });

  // Query initial per-domain state
  try {
    chrome.runtime?.sendMessage?.(
      { type: 'VE_GET_STATE', hostname },
      (response) => {
        if (chrome.runtime.lastError) return;
        if (response) {
          applyEnabledState(response.enabled);
        }
      }
    );
  } catch (_) {
    // Extension context may not be available (e.g., in Firefox about: pages)
  }

  // ================================================================
  //  KEYBOARD SHORTCUTS
  // ================================================================

  document.addEventListener('keydown', (e) => {
    if (!extensionEnabled || !settings.enableShortcuts || !activeVideo) return;

    // Don't capture when typing in inputs
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;

    let handled = false;

    if (e.key === 'ArrowLeft' && e.shiftKey) {
      activeVideo.currentTime = Math.max(0, activeVideo.currentTime - 60);
      showToast('Seek −1m', 'info');
      handled = true;
    } else if (e.key === 'ArrowRight' && e.shiftKey) {
      activeVideo.currentTime = Math.min(activeVideo.duration || Infinity, activeVideo.currentTime + 60);
      showToast('Seek +1m', 'info');
      handled = true;
    } else if (e.key === 'ArrowLeft' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      activeVideo.currentTime = Math.max(0, activeVideo.currentTime - 5);
      showToast('Seek −5s', 'info');
      handled = true;
    } else if (e.key === 'ArrowRight' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      activeVideo.currentTime = Math.min(activeVideo.duration || Infinity, activeVideo.currentTime + 5);
      showToast('Seek +5s', 'info');
      handled = true;
    } else if (e.key === 's' || e.key === 'S') {
      // Toggle subtitle visibility
      if (subtitleOverlay) {
        subtitleVisible = !subtitleVisible;
        subtitleOverlay.style.display = subtitleVisible ? '' : 'none';
        updateSubtitlePanelInfo(activeVideo?.currentTime || 0);
        showToast(subtitleVisible ? 'Subtitles shown' : 'Subtitles hidden', 'info');
        handled = true;
      }
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // ================================================================
  //  INITIALIZATION
  // ================================================================

  function init() {
    // Load settings first, then proceed
    loadSettings(() => {
      // Provide dependencies for anti-redirect.js and start it (if present)
      installAntiRedirectBridge();
      window.AntiRedirectBlocker?.setup?.();

      // Initial scan
      const best = findBestVideo();
      if (best) {
        createPanel();
      }

      // Start observing
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });

      // Also listen for dynamically created videos via play event
      document.addEventListener(
        'play',
        (e) => {
          if (e.target?.tagName === 'VIDEO') {
            onMutation();
          }
        },
        true
      );

      // Re-check periodically (fallback for shadow DOM / iframe players)
      setInterval(() => {
        cleanupOutsideIframes();

        if (!extensionEnabled) return;
        const best = findBestVideo();
        if (best && best !== activeVideo) {
          createPanel();
        }
        // Verify panel is still in DOM
        if (activeVideo && panelEl && !document.contains(panelEl)) {
          createPanel();
        }
      }, 3000);
    });
  }

  // ================================================================
  //  AUTO-PAUSE — Comprehensive Tab/Window Leave Detection
  // ================================================================

  let autoPausedByUs = false;       // Track if WE paused it (not the user)
  let wasPipActive = false;         // Track Picture-in-Picture state

  /**
   * Pause the active video when leaving the tab/window.
   * Called from multiple event sources for maximum coverage.
   */
  function handleAutoPause() {
    if (!extensionEnabled || !settings.autoPause || !activeVideo) return;

    // Don't pause if Picture-in-Picture is active (user wants it playing)
    if (document.pictureInPictureElement === activeVideo) {
      wasPipActive = true;
      return;
    }

    // Don't pause if already paused (by the user or the site)
    if (activeVideo.paused) return;

    // Pause conditions:
    //  - Tab is hidden (switched to another tab)
    //  - Window lost focus (alt-tabbed, minimized, clicked outside browser)
    const isHidden = document.hidden || document.visibilityState === 'hidden';
    const hasNoFocus = !document.hasFocus();

    if (isHidden || hasNoFocus) {
      try {
        activeVideo.pause();
        autoPausedByUs = true;
      } catch (_) { /* some players throw on pause */ }
    }
  }

  /**
   * Resume the video when returning to the tab/window —
   * but ONLY if we were the ones who paused it.
   */
  function handleAutoResume() {
    if (!extensionEnabled || !settings.autoPause || !activeVideo) return;
    if (!autoPausedByUs) return;

    // Only resume if tab is now visible AND window has focus
    const isVisible = !document.hidden && document.visibilityState === 'visible';

    if (isVisible) {
      try {
        activeVideo.play().catch(() => {
          // Autoplay policy may prevent this; that's OK
        });
      } catch (_) { /* ignore */ }
      autoPausedByUs = false;
    }
  }

  // 1. Page Visibility API — most reliable for tab switches
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      handleAutoPause();
    } else {
      handleAutoResume();
    }
  });

  // 2. Window blur/focus — catches alt-tab, clicking outside browser, minimize
  window.addEventListener('blur', () => {
    // Small delay to avoid false triggers from iframes or popups within the page
    setTimeout(handleAutoPause, 150);
  });
  window.addEventListener('focus', () => {
    handleAutoResume();
  });

  // 3. Page freeze/resume (newer API for aggressive tab discarding)
  document.addEventListener('freeze', handleAutoPause);
  document.addEventListener('resume', handleAutoResume);

  // 4. Before unload — pause before navigation away
  window.addEventListener('beforeunload', () => {
    if (extensionEnabled && settings.autoPause && activeVideo && !activeVideo.paused) {
      try { activeVideo.pause(); } catch (_) { /* ignore */ }
    }
  });

  // 5. Picture-in-Picture exit — if user leaves PiP, re-evaluate
  document.addEventListener('leavepictureinpicture', () => {
    wasPipActive = false;
    // If tab is still hidden, pause
    if (document.hidden) {
      handleAutoPause();
    }
  });

  // ================================================================
  //  MAIN WORLD INJECTION
  // ================================================================

  function injectMainWorldScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('assets/inject.js');
    script.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectMainWorldScript();
      init();
    });
  } else {
    injectMainWorldScript();
    init();
  }
})();
