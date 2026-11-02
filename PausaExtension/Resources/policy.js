/* Pure URL policy shared by the content script and regression tests. */
(function (scope) {
  "use strict";
  const hosts = new Set(["instagram.com", "www.instagram.com", "m.instagram.com"]);

  function isReelsURL(value, base = "https://www.instagram.com/") {
    try {
      const url = new URL(value, base);
      if (url.protocol !== "https:" || !hosts.has(url.hostname.toLowerCase())) return false;
      const path = decodeURIComponent(url.pathname).replace(/\/{2,}/g, "/");
      return /^\/(?:reels?|[^/]+\/reels?)(?:\/|$)/i.test(path);
    } catch {
      return false;
    }
  }

  scope.PausaPolicy = Object.freeze({ isReelsURL });
  if (typeof module !== "undefined" && module.exports) module.exports = scope.PausaPolicy;
})(globalThis);
