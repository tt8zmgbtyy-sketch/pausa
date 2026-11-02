const test = require("node:test");
const assert = require("node:assert/strict");
const { isReelsURL } = require("../PausaExtension/Resources/policy.js");

test("recognizes Reels pages and profile Reels tabs on supported Instagram hosts", () => {
  const blocked = [
    "/reels", "/reels/", "/reel/abc123/", "/reels/abc123/?igsh=share",
    "/some.person/reels/", "/some.person/reel/abc123/", "/REELS/#fragment",
    "/%72eel/abc/", "//www.instagram.com/reels/", "https://m.instagram.com/reel/id/",
    "https://instagram.com/reels/?utm_source=other", "https://www.instagram.com//reels///abc/"
  ];
  for (const url of blocked) assert.equal(isReelsURL(url), true, url);
});

test("preserves feed, messages, profiles, stories, posts, and unrelated destinations", () => {
  const allowed = [
    "/", "/direct/inbox/", "/direct/t/123/", "/stories/user/123/", "/p/abc123/",
    "/some.person/", "/some.person/tagged/", "/explore/", "/accounts/login/",
    "/reels_are_fun/", "/reelgood/", "/reels2/", "/some.person/reels_are_fun/",
    "/?next=/reels/", "/p/abc/?caption=reels", "/#reels",
    "https://www.example.com/reels/", "https://www.instagram.com.example.com/reels/",
    "https://instagram.com@evil.example/reels/", "https://evil.example/@instagram.com/reels/",
    "mailto:reels@example.com", "javascript:alert('reels')", "data:text/plain,reels",
    "http://www.instagram.com/reels/"
  ];
  for (const url of allowed) assert.equal(isReelsURL(url), false, url);
});

test("resolves relative destinations against current profile and safely rejects malformed URLs", () => {
  assert.equal(isReelsURL("reels/", "https://www.instagram.com/some.person/"), true);
  assert.equal(isReelsURL("../reels/", "https://www.instagram.com/some.person/tagged/"), true);
  assert.equal(isReelsURL("reels/", "https://example.com/"), false);
  for (const url of ["https://[invalid/", "/reels/%E0%A4%A", "/%", "https://%/reels/"]) {
    assert.doesNotThrow(() => isReelsURL(url));
    assert.equal(isReelsURL(url), false, url);
  }
});
