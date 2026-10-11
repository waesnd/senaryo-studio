import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { scenarioToText, scenarioToFountain, scenarioToFdx, buildScenarioPdf, downloadScenario } from "../lib/exports.js";

const document = {
  schemaVersion: 1,
  title: 'Çığlık & "Işık" <Öykü>',
  tagline: "Şüphe, gölgeler ve özgürlük.",
  synopsis: "Şule, güneydeki şehirde kardeşini arar.",
  characters: [{ id: "character-1", name: "Şule", description: "Güçlü bir gözlemci." }],
  scenes: [{ id: "scene-1", heading: "İç. Kütüphane - Gece", action: "Şule & İpek <kapıya> yaklaşır.\n\nYağmur sürer.", dialogue: [{ id: "line-1", character: "character-1", text: '"Neredesin?" & "Dönecek misin?"' }] }],
  dramaticQuestion: "Geçmişini değiştirebilir mi?",
  metadata: { author: "Çağrı Öztürk" },
};

test("TXT preserves Turkish script, supporting notes and named dialogue", () => {
  const txt = scenarioToText(document);
  for (const text of [document.title, document.synopsis, document.characters[0].description, document.dramaticQuestion, "ŞULE", document.scenes[0].dialogue[0].text]) assert.ok(txt.includes(text));
  assert.ok(txt.includes("İÇ. KÜTÜPHANE - GECE"));
  assert.ok(!txt.includes("character-1"));
});

test("Fountain forces Turkish scene headings and real character/dialogue blocks", () => {
  const fountain = scenarioToFountain(document);
  assert.ok(fountain.startsWith(`Title: ${document.title}`));
  assert.ok(fountain.includes("Author: Çağrı Öztürk"));
  assert.ok(fountain.includes(".İÇ. KÜTÜPHANE - GECE"));
  assert.ok(fountain.includes('@ŞULE\n"Neredesin?" & "Dönecek misin?"'));
  assert.ok(fountain.includes(`[[ÖZET\n${document.synopsis}]]`));
  assert.ok(!scenarioToFountain({ ...document, synopsis: "Test ]] metin" }).includes("[[ÖZET\nTest ]]"));
});

test("FDX uses a separate title page and scene, action, character, dialogue paragraphs", () => {
  const fdx = scenarioToFdx(document);
  const body = fdx.split("<Content>")[1].split("</Content>")[0];
  assert.deepEqual([...body.matchAll(/Type="([^"]+)"/g)].map(match => match[1]), ["Scene Heading", "Action", "Action", "Character", "Dialogue"]);
  assert.ok(fdx.includes("<TitlePage>"));
  assert.ok(fdx.includes('Çığlık &amp; &quot;Işık&quot; &lt;Öykü&gt;'));
  assert.ok(fdx.includes("Şule &amp; İpek &lt;kapıya&gt; yaklaşır."));
  assert.ok(fdx.includes("Yazan\nÇağrı Öztürk"));
  assert.ok(!fdx.includes("&amp;amp;"));
  assert.ok(!body.includes(document.title));
  assert.ok(!scenarioToFdx({ title: "Null\u0000\u0001char", scenes: [] }).includes("\u0000"));
});

test("Export adapters accept previous scenario documents without dropping their scene", () => {
  const legacy = { baslik: "Eski çalışma", acilis_sahnesi: "Güneş yavaşça doğar.", karakter: "İpek: Öğretmen" };
  assert.ok(scenarioToText(legacy).includes("Güneş yavaşça doğar."));
  assert.ok(scenarioToFdx(legacy).includes("Güneş yavaşça doğar."));
});

test("Unsupported download formats fail before creating browser objects", async () => {
  await assert.rejects(() => downloadScenario(document, "html"), /Desteklenmeyen/);
});

async function fonts() {
  const [regular, bold] = await Promise.all(["DejaVuSansMono.ttf", "DejaVuSansMono-Bold.ttf"].map(file => readFile(new URL(`../public/fonts/${file}`, import.meta.url))));
  return { regular: regular.toString("base64"), bold: bold.toString("base64") };
}

test("PDF embeds Unicode fonts and spans title, screenplay, notes and overflow pages", async () => {
  const longDocument = { ...document, scenes: [{ ...document.scenes[0], action: Array(170).fill("Şule yağmurlu sokağın gölgelerine bakar.").join("\n"), dialogue: [{ id: "line-1", character: "character-1", text: Array(90).fill("İçimdeki düşünceyi görebiliyor musun?").join("\n") }] }] };
  const pdf = await buildScenarioPdf(longDocument, { fontBase64: await fonts() });
  const content = pdf.output();
  assert.ok(content.startsWith("%PDF-"));
  assert.ok(content.includes("/FontFile2"));
  assert.ok(content.includes("/Identity-H"));
  assert.ok(pdf.internal.getNumberOfPages() > 5);
  assert.equal(pdf.getTextColor(), "#000000");
});

test("PDF Turkish glyphs round-trip and text remains inside printable page bounds", async context => {
  const available = spawnSync("pdftotext", ["-v"], { encoding: "utf8" });
  if (available.error?.code === "ENOENT") { context.skip("Optional Poppler pdftotext is not installed"); return; }
  const pdf = await buildScenarioPdf({ ...document, scenes: [{ ...document.scenes[0], dialogue: [{ id: "line-1", character: "character-1", text: Array(85).fill("Çığ, ışık, şüphe, özgürlük, güzel günler.").join("\n") }] }] }, { fontBase64: await fonts() });
  const directory = await mkdtemp(join(tmpdir(), "senaryo-export-"));
  try {
    const path = join(directory, "script.pdf");
    await writeFile(path, new Uint8Array(pdf.output("arraybuffer")));
    const extracted = spawnSync("pdftotext", ["-enc", "UTF-8", path, "-"], { encoding: "utf8" });
    assert.equal(extracted.status, 0, extracted.stderr);
    const readableText = extracted.stdout.replace(/\s+/g, " ");
    for (const expected of ["Çığlık", "Öykü", "Çağrı Öztürk", "İÇ. KÜTÜPHANE", "ŞULE", "Çığ, ışık, şüphe, özgürlük, güzel günler.", "DRAMATİK SORU", "DEVAM"]) assert.ok(readableText.includes(expected), `Missing PDF text: ${expected}`);
    const bounds = spawnSync("pdftotext", ["-bbox", path, "-"], { encoding: "utf8" });
    assert.equal(bounds.status, 0, bounds.stderr);
    const words = [...bounds.stdout.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)"/g)];
    assert.ok(words.length > 300);
    for (const [, xMin, yMin, xMax, yMax] of words) {
      assert.ok(Number(xMin) >= 40 && Number(xMax) <= 555, `PDF horizontal overflow: ${xMin}, ${xMax}`);
      assert.ok(Number(yMin) >= 28 && Number(yMax) <= 798, `PDF vertical overflow: ${yMin}, ${yMax}`);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
