const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const colors = ["#063B32", "#C8F33B", "#F7F4ED"];

test("approved Fabularc vector assets are present and not raster wrappers", () => {
  for (const name of ["fabularc-primary.svg", "fabularc-monogram.svg", "fabularc-favicon.svg", "fabularc-app-icon.svg"]) {
    const source = read("public/brand/" + name);
    assert.match(source, /^<svg\b/);
    assert.match(source, /<path\b/);
    assert.doesNotMatch(source, /<image\b|data:image\/|<foreignObject\b/);
    assert.match(source, /viewBox=/);
  }
});

test("brand colors are retained in SVG source", () => {
  const primary = read("public/brand/fabularc-primary.svg");
  assert.ok(primary.includes(colors[0]));
  assert.ok(primary.includes(colors[1]));
  const guidance = read("docs/FABULARC_BRAND.md");
  for (const color of colors) assert.ok(guidance.includes(color));
});

test("Fabularc name and favicon are included in both page heads", () => {
  for (const name of ["pages/_document.js", "pages/_app.js"]) {
    const source = read(name);
    assert.match(source, /Fabularc/);
    assert.match(source, /\/brand\/fabularc-favicon\.svg/);
    assert.doesNotMatch(source, /content="Scriptify/);
  }
});

test("main product metadata is not confused with an unsupported PWA icon migration", () => {
  const manifest = JSON.parse(read("public/manifest.json"));
  assert.ok(Array.isArray(manifest.icons));
  for (const icon of manifest.icons) {
    assert.ok(fs.existsSync(path.join(root, "public", icon.src.replace(/^\//, ""))));
  }
});
