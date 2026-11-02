"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const resources = path.join(root, "PausaExtension", "Resources");
const manifest = JSON.parse(fs.readFileSync(path.join(resources, "manifest.json"), "utf8"));
const declared = new Set([
  manifest.action.default_popup,
  ...Object.values(manifest.icons),
  ...Object.values(manifest.action.default_icon),
  ...manifest.content_scripts.flatMap((script) => [...script.js, ...script.css])
]);
for (const file of declared) {
  assert.ok(fs.existsSync(path.join(resources, file)), `Missing manifest resource: ${file}`);
}
for (const html of ["popup.html"]) {
  const source = fs.readFileSync(path.join(resources, html), "utf8");
  for (const [, resource] of source.matchAll(/(?:src|href)="([^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(resources, resource)), `Missing HTML resource: ${resource}`);
  }
}
for (const file of fs.readdirSync(resources).filter((name) => name.endsWith(".js"))) {
  const result = spawnSync(process.execPath, ["--check", path.join(resources, file)], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
}
for (const file of [
  "PausaApp/PausaApp.swift", "PausaApp/ContentView.swift", "PausaApp/Info.plist",
  "PausaApp/Assets.xcassets/AppIcon.appiconset/AppIcon.png",
  "PausaExtension/SafariWebExtensionHandler.swift", "PausaExtension/Info.plist",
  "Pausa.xcodeproj/project.pbxproj", "Pausa.xcodeproj/xcshareddata/xcschemes/Pausa.xcscheme"
]) assert.ok(fs.existsSync(path.join(root, file)), `Missing Xcode input: ${file}`);
assert.deepEqual(manifest.permissions, ["storage"]);
assert.equal(manifest.manifest_version, 3);
console.log("Manifest, recursos da extensão, sintaxe JavaScript e arquivos do projeto: OK.");
