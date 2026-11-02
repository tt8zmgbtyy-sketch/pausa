const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const resources = path.join(__dirname, "..", "PausaExtension", "Resources");
const readResource = (filename) => fs.readFileSync(path.join(resources, filename), "utf8");
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function storageMock({ enabled = true, getError = false, setError = false, deferInitialRead = false } = {}) {
  const listeners = new Set();
  const writes = [];
  let stored = enabled;
  let resolveRead;
  const pendingRead = deferInitialRead ? new Promise((resolve) => { resolveRead = resolve; }) : null;
  return {
    writes,
    resolveRead: (values) => resolveRead(values),
    emit(newValue, area = "local") {
      for (const listener of listeners) listener({ enabled: { newValue } }, area);
    },
    api: {
      storage: {
        local: {
          get: () => getError ? Promise.reject(new Error("read unavailable")) : pendingRead || Promise.resolve({ enabled: stored }),
          set: async (values) => {
            writes.push(values.enabled);
            if (setError) throw new Error("write unavailable");
            stored = values.enabled;
            for (const listener of listeners) listener({ enabled: { newValue: stored } }, "local");
          }
        },
        onChanged: { addListener: (listener) => listeners.add(listener) }
      }
    }
  };
}

async function contentPage(t, { url = "https://www.instagram.com/", html = "", ...storageOptions } = {}) {
  const storage = storageMock(storageOptions);
  const dom = new JSDOM(`<!doctype html><html><head><style>${readResource("content.css")}</style></head><body>${html}</body></html>`, {
    url, runScripts: "outside-only", pretendToBeVisual: true
  });
  const observers = [];
  const NativeMutationObserver = dom.window.MutationObserver;
  dom.window.MutationObserver = class extends NativeMutationObserver {
    constructor(callback) {
      super(callback);
      observers.push(this);
    }
  };
  t.after(async () => {
    // Closing jsdom removes its document. Disconnect first so teardown cannot
    // schedule another production DOM sync against the destroyed window.
    for (const observer of observers) observer.disconnect();
    await settle();
    dom.window.close();
  });
  dom.window.browser = storage.api;
  dom.window.eval(readResource("policy.js"));
  dom.window.eval(readResource("content.js"));
  await settle();
  return { dom, window: dom.window, document: dom.window.document, storage };
}

async function popupPage(t, storageOptions = {}) {
  const storage = storageMock(storageOptions);
  const dom = new JSDOM(readResource("popup.html"), {
    url: "https://extension.invalid/popup.html", runScripts: "outside-only"
  });
  t.after(() => dom.window.close());
  dom.window.browser = storage.api;
  dom.window.eval(readResource("popup.js"));
  await settle();
  return { dom, window: dom.window, document: dom.window.document, storage };
}

module.exports = { contentPage, popupPage, readResource, settle };
