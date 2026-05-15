// @ts-nocheck
/* ============================================================
   Video Enhancer - MAIN World Inject (Fixed)
   ============================================================ */

(function () {
  "use strict";

  const isEnabled = () =>
    document.documentElement.dataset.veBypassUnfocus === "true";

  // ─── 1. Spoof document.hidden & visibilityState ───────────
  const originalHidden = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "hidden",
  );
  const originalVis = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "visibilityState",
  );

  Object.defineProperty(document, "hidden", {
    configurable: true,
    get() {
      return isEnabled() ? false : (originalHidden?.get.call(this) ?? false);
    },
  });

  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get() {
      return isEnabled()
        ? "visible"
        : (originalVis?.get.call(this) ?? "visible");
    },
  });

  // ─── 2. Event sets ─────────────────────────────────────────
  const PAGE_PAUSE_EVENTS = new Set([
    "visibilitychange",
    "webkitvisibilitychange",
    "mozvisibilitychange",
  ]);

  // ─── 3. Blokir dispatchEvent untuk event pause ────────────
  const originalDispatch = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function (event) {
    if (isEnabled() && PAGE_PAUSE_EVENTS.has(event?.type)) {
      return true; // seolah berhasil tapi tidak ada yang dipanggil
    }
    return originalDispatch.call(this, event);
  };

  // ─── 4. Blokir onpause langsung di HTMLMediaElement ───────
  // FIX: ambil dari HTMLMediaElement.prototype (bukan HTMLElement)
  const originalOnPauseDesc = Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    "onpause",
  );
  if (originalOnPauseDesc) {
    Object.defineProperty(HTMLMediaElement.prototype, "onpause", {
      configurable: true,
      get() {
        return originalOnPauseDesc.get.call(this);
      },
      set(val) {
        if (isEnabled()) return; // blokir site set onpause
        originalOnPauseDesc.set.call(this, val);
      },
    });
  }

  // ─── 5. Graceful play() — tolak NotAllowedError ───────────
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    return originalPlay.apply(this, arguments).catch((err) => {
      if (err.name === "NotAllowedError") return Promise.resolve();
      return Promise.reject(err); // lempar error lain tetap
    });
  };

  // ─── 6. FIX: Hapus setInterval dispatch yang bermasalah ───
  // Ganti dengan sekali dispatch saat bypass diaktifkan
  const observer = new MutationObserver(() => {
    if (isEnabled()) {
      // Kirim 'visible' ke listener MILIK KITA (bukan site)
      // agar resume logic ekstensi tetap jalan
      window.dispatchEvent(new Event("focus"));
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-ve-bypass-unfocus"],
  });

  console.log("[Video Enhancer] Main-world injection active (fixed).");
})();
