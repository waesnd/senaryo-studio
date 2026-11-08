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

test("PWA manifest uses the Fabularc identity and safe icon purposes", () => {
  const manifest = JSON.parse(read("public/manifest.json"));
  assert.equal(manifest.name, "Fabularc");
  assert.equal(manifest.short_name, "Fabularc");
  assert.equal(manifest.theme_color, "#063B32");
  assert.equal(manifest.background_color, "#063B32");
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.deepEqual(sizes, ["192x192", "512x512"]);
  assert.ok(manifest.icons.every((icon) => icon.purpose === "any"));
  assert.doesNotMatch(JSON.stringify(manifest), /Scriptify/i);
});

test("PWA and favicon PNGs have real, correct pixel dimensions", () => {
  for (const [name, dimension] of [
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["favicon-16.png", 16],
    ["favicon-32.png", 32],
    ["favicon-48.png", 48],
  ]) {
    const buffer = fs.readFileSync(path.join(root, "public", name));
    assert.ok(buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
    assert.equal(buffer.toString("ascii", 12, 16), "IHDR");
    assert.equal(buffer.readUInt32BE(16), dimension);
    assert.equal(buffer.readUInt32BE(20), dimension);
  }
});
