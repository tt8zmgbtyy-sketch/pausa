const test = require("node:test");
const assert = require("node:assert/strict");
const { contentPage, settle } = require("./helpers.cjs");

test("direct Reels entry covers the page while an ordinary post remains accessible", async (t) => {
  const page = await contentPage(t, { url: "https://www.instagram.com/reel/abc/" });
  assert.equal(page.document.documentElement.dataset.pausaRouteBlocked, "true");
  assert.ok(page.document.getElementById("pausa-reels-notice"));
  assert.equal(page.window.getComputedStyle(page.document.body).visibility, "hidden");
  page.window.history.pushState({}, "", "/p/abc/");
  page.window.dispatchEvent(new page.window.PopStateEvent("popstate"));
  await settle();
  assert.equal(page.document.documentElement.dataset.pausaRouteBlocked, "false");
  assert.equal(page.document.getElementById("pausa-reels-notice"), null);
  assert.equal(page.window.getComputedStyle(page.document.body).visibility, "visible");
});

test("hides Reels anchors and preserves feed, inbox, posts and external links", async (t) => {
  const page = await contentPage(t, { html: `
    <a id="reels" href="/reels/">Reels</a><a id="feed" href="/">Feed</a>
    <a id="direct" href="/direct/inbox/">Messages</a><a id="post" href="/p/abc/">Post</a>
    <a id="external" href="https://example.com/reels/">Other service</a>` });
  assert.equal(page.window.getComputedStyle(page.document.getElementById("reels")).display, "none");
  for (const id of ["feed", "direct", "post", "external"]) {
    const link = page.document.getElementById(id);
    assert.equal(link.hasAttribute("data-pausa-reel-link"), false, id);
    assert.notEqual(page.window.getComputedStyle(link).display, "none", id);
  }
});

test("handles dynamically inserted links and href reuse by the Instagram router", async (t) => {
  const page = await contentPage(t);
  const link = page.document.createElement("a");
  link.href = "/reel/dynamic/";
  page.document.body.append(link);
  await settle();
  assert.equal(page.window.getComputedStyle(link).display, "none");
  link.setAttribute("href", "/p/ordinary/");
  await settle();
  assert.equal(link.hasAttribute("data-pausa-reel-link"), false);
  assert.notEqual(page.window.getComputedStyle(link).display, "none");
  link.setAttribute("href", "/some.person/reels/");
  await settle();
  assert.equal(page.window.getComputedStyle(link).display, "none");
});

test("capture handler prevents nested Reels clicks before a page router receives them", async (t) => {
  const page = await contentPage(t, { html: '<a id="reels" href="/reel/click/"><span id="label">Watch</span></a><a id="feed" href="/">Feed</a>' });
  let routerClicks = 0;
  page.document.addEventListener("click", () => { routerClicks += 1; });
  const event = new page.window.MouseEvent("click", { bubbles: true, cancelable: true });
  page.document.getElementById("label").dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(routerClicks, 0);
  const allowed = new page.window.MouseEvent("click", { bubbles: true, cancelable: true });
  page.document.getElementById("feed").dispatchEvent(allowed);
  assert.equal(allowed.defaultPrevented, false);
  assert.equal(routerClicks, 1);
  const auxiliary = new page.window.MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 });
  page.document.getElementById("label").dispatchEvent(auxiliary);
  assert.equal(auxiliary.defaultPrevented, true);
});

test("isolated-world polling catches pushState without any DOM mutation", async (t) => {
  const page = await contentPage(t);
  page.window.history.pushState({}, "", "/reels/");
  await new Promise((resolve) => setTimeout(resolve, 440));
  assert.equal(page.document.documentElement.dataset.pausaRouteBlocked, "true");
  assert.ok(page.document.getElementById("pausa-reels-notice"));
});

test("popstate updates protection immediately on navigation in both directions", async (t) => {
  const page = await contentPage(t);
  page.window.history.replaceState({}, "", "/some.person/reels/");
  page.window.dispatchEvent(new page.window.PopStateEvent("popstate"));
  await settle();
  assert.equal(page.document.documentElement.dataset.pausaRouteBlocked, "true");
  page.window.history.replaceState({}, "", "/direct/inbox/");
  page.window.dispatchEvent(new page.window.PopStateEvent("popstate"));
  await settle();
  assert.equal(page.document.documentElement.dataset.pausaRouteBlocked, "false");
  assert.equal(page.document.getElementById("pausa-reels-notice"), null);
});

test("live storage changes release and restore protection without reloading", async (t) => {
  const page = await contentPage(t, {
    url: "https://www.instagram.com/reels/", html: '<a id="reels" href="/reels/">Reels</a>'
  });
  const link = page.document.getElementById("reels");
  page.storage.emit(false);
  assert.equal(page.document.documentElement.dataset.pausaEnabled, "false");
  assert.equal(page.document.documentElement.dataset.pausaRouteBlocked, "false");
  assert.notEqual(page.window.getComputedStyle(link).display, "none");
  const disabledClick = new page.window.MouseEvent("click", { bubbles: true, cancelable: true });
  link.dispatchEvent(disabledClick);
  assert.equal(disabledClick.defaultPrevented, false);
  page.storage.emit(true, "sync");
  assert.equal(page.document.documentElement.dataset.pausaEnabled, "false", "other storage areas must not change local preference");
  page.storage.emit(true);
  assert.equal(page.document.documentElement.dataset.pausaRouteBlocked, "true");
  assert.equal(page.window.getComputedStyle(link).display, "none");
});

test("a saved disabled preference permits a direct Reels page", async (t) => {
  const page = await contentPage(t, { enabled: false, url: "https://www.instagram.com/reel/id/" });
  assert.equal(page.document.documentElement.dataset.pausaEnabled, "false");
  assert.equal(page.document.documentElement.dataset.pausaRouteBlocked, "false");
  assert.equal(page.document.getElementById("pausa-reels-notice"), null);
});

test("a pending initial storage read cannot overwrite a newer preference change", async (t) => {
  const page = await contentPage(t, { deferInitialRead: true, url: "https://www.instagram.com/reels/" });
  page.storage.emit(false);
  assert.equal(page.document.documentElement.dataset.pausaEnabled, "false");
  page.storage.resolveRead({ enabled: true });
  await settle();
  assert.equal(page.document.documentElement.dataset.pausaEnabled, "false");
  assert.equal(page.document.documentElement.dataset.pausaRouteBlocked, "false");
  assert.equal(page.document.getElementById("pausa-reels-notice"), null);
});

test("storage read failures preserve default protection instead of failing open", async (t) => {
  const page = await contentPage(t, { getError: true, url: "https://www.instagram.com/reels/" });
  assert.equal(page.document.documentElement.dataset.pausaEnabled, "true");
  assert.equal(page.document.documentElement.dataset.pausaRouteBlocked, "true");
  assert.ok(page.document.getElementById("pausa-reels-notice"));
});

test("playback is paused on a blocked Reels route but allowed on feed posts or when disabled", async (t) => {
  const page = await contentPage(t, { url: "https://www.instagram.com/reel/id/", html: '<video id="video"></video>' });
  const video = page.document.getElementById("video");
  let pauses = 0;
  video.pause = () => { pauses += 1; };
  video.dispatchEvent(new page.window.Event("play"));
  assert.equal(pauses, 1);
  page.storage.emit(false);
  video.dispatchEvent(new page.window.Event("play"));
  assert.equal(pauses, 1);
  page.storage.emit(true);
  page.window.history.replaceState({}, "", "/p/normal/");
  video.dispatchEvent(new page.window.Event("play"));
  assert.equal(pauses, 1);
});

test("malformed link URLs do not disable protection or hide ordinary content", async (t) => {
  const page = await contentPage(t, { html: '<a id="bad" href="/reels/%E0%A4%A">Malformed</a><a id="good" href="/reels/">Reels</a>' });
  assert.equal(page.document.getElementById("bad").hasAttribute("data-pausa-reel-link"), false);
  assert.equal(page.document.getElementById("good").hasAttribute("data-pausa-reel-link"), true);
  assert.equal(page.document.documentElement.dataset.pausaEnabled, "true");
});
