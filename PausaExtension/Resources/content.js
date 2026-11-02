(function () {
  "use strict";
  if (window.__pausaInstalled) return;
  window.__pausaInstalled = true;

  const api = globalThis.browser;
  const { isReelsURL } = globalThis.PausaPolicy;
  let enabled = true;
  let notice = null;
  let queued = false;
  let blocked = false;
  let storageFailed = false;
  let lastURL = "";
  let preferenceRevision = 0;

  function renderNotice() {
    if (notice?.isConnected) return;
    notice = document.createElement("div");
    notice.id = "pausa-reels-notice";
    // Isolate both the notice's appearance and its controls from Instagram CSS.
    const shadow = notice.attachShadow({ mode: "closed" });
    shadow.innerHTML = `
      <style>
        :host { all: initial !important; position: fixed !important; inset: 0 !important;
          z-index: 2147483647 !important; display: grid !important; place-items: center !important;
          overflow: auto !important; background: #f6f4ef !important; color: #202b32 !important;
          font: 16px/1.6 -apple-system, BlinkMacSystemFont, sans-serif !important; }
        * { box-sizing: border-box; }
        main { width: min(100%, 430px); padding: 48px 28px; text-align: center; }
        .mark { width: 68px; height: 68px; display: grid; place-items: center; margin: 0 auto 32px;
          background: #e87960; border-radius: 23px; color: #202b32; font-size: 32px; font-weight: 800; }
        .label { font-size: 12px; letter-spacing: 3px; font-weight: 700; color: #59685e; }
        h1 { font-size: 36px; line-height: 1.12; letter-spacing: -1.5px; margin: 18px 0; }
        p { color: #56616a; margin: 0 0 28px; }
        a { display: block; background: #202b32; color: #fff; border-radius: 17px; padding: 17px;
          text-decoration: none; font-weight: 600; }
        small { display: block; margin-top: 25px; font-size: 13px; color: #56616a; }
        .error { color: #94432f; }
        @media (prefers-reduced-motion: no-preference) { main { animation: arrive .2s ease-out; }
          @keyframes arrive { from { opacity: 0; transform: translateY(8px); } } }
      </style>
      <main role="dialog" aria-modal="true" aria-labelledby="title" tabindex="-1">
        <div class="mark" aria-hidden="true">Ⅱ</div>
        <div class="label">UMA PAUSA NO AUTOMÁTICO</div>
        <h1 id="title">Seu tempo merece<br>uma escolha.</h1>
        <p>Esta página de Reels foi bloqueada pelo Pausa no Safari.</p>
        <a href="https://www.instagram.com/" target="_self">Voltar ao início do Instagram</a>
        <small>Para mudar a proteção, abra a extensão Pausa no menu do Safari.</small>
      </main>`;
    if (storageFailed) {
      const warning = document.createElement("small");
      warning.className = "error";
      warning.textContent = "Não foi possível ler sua preferência. A proteção está ligada por padrão. Tente reabrir a extensão.";
      shadow.querySelector("main").append(warning);
    }
    document.documentElement.append(notice);
    shadow.querySelector("main").focus({ preventScroll: true });
  }

  function pauseVideo(event) {
    if (enabled && isReelsURL(location.href) && event.target instanceof HTMLMediaElement) {
      event.target.pause();
    }
  }

  function sync() {
    queued = false;
    const root = document.documentElement;
    if (!root) return;
    lastURL = location.href;
    root.dataset.pausaEnabled = String(enabled);
    for (const link of document.querySelectorAll("a[href]")) {
      if (link.closest("#pausa-reels-notice")) continue;
      if (isReelsURL(link.getAttribute("href"), location.href)) {
        if (!link.hasAttribute("data-pausa-reel-link")) link.setAttribute("data-pausa-reel-link", "");
      } else if (link.hasAttribute("data-pausa-reel-link")) {
        link.removeAttribute("data-pausa-reel-link");
      }
    }
    blocked = enabled && isReelsURL(location.href);
    root.dataset.pausaRouteBlocked = String(blocked);
    if (blocked) {
      for (const video of document.querySelectorAll("video, audio")) {
        if (!video.paused) video.pause();
      }
      renderNotice();
    } else {
      notice?.remove();
      notice = null;
    }
  }

  function scheduleSync() {
    if (queued) return;
    queued = true;
    queueMicrotask(sync);
  }

  function stopReelLink(event) {
    if (!enabled || !(event.target instanceof Element)) return;
    const anchor = event.target.closest("a[href]");
    if (!anchor || !isReelsURL(anchor.href, location.href)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // Capture links before Instagram's SPA router gets the click.
  document.addEventListener("click", stopReelLink, true);
  document.addEventListener("auxclick", stopReelLink, true);
  document.addEventListener("play", pauseVideo, true);
  window.addEventListener("pageshow", scheduleSync);
  window.addEventListener("popstate", scheduleSync);
  window.addEventListener("hashchange", scheduleSync);
  document.addEventListener("visibilitychange", scheduleSync);
  new MutationObserver(scheduleSync).observe(document, {
    childList: true, subtree: true, attributes: true, attributeFilter: ["href"]
  });
  // Safari content scripts run in an isolated world. Poll the URL as well as
  // observing DOM changes; monkey-patching history here would miss page scripts.
  window.setInterval(() => {
    if (location.href !== lastURL) scheduleSync();
  }, 400);
  sync();

  api.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && Object.prototype.hasOwnProperty.call(changes, "enabled")) {
      preferenceRevision += 1;
      enabled = changes.enabled.newValue !== false;
      storageFailed = false;
      sync();
    }
  });
  api.storage.local.get({ enabled: true }).then((values) => {
    if (preferenceRevision !== 0) return;
    enabled = values.enabled !== false;
    sync();
  }).catch(() => {
    if (preferenceRevision !== 0) return;
    storageFailed = true;
    notice?.remove();
    sync();
  });
})();
