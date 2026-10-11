import { normalizeScenario } from "./scenario.js";

const FONT_FAMILY = "DejaVuSansMono";
const FONT_PATHS = ["/fonts/DejaVuSansMono.ttf", "/fonts/DejaVuSansMono-Bold.ttf"];
let fontRequest;

// XML 1.0 disallows these control characters; preserve actual Unicode text.
function clean(value) {
  // eslint-disable-next-line no-control-regex -- XML 1.0 explicitly forbids these controls.
  return String(value ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function xml(value) {
  return clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function characterName(document, character) {
  const value = document.characters.find(item => item.id === character)?.name || character;
  return clean(value).replace(/\n/g, " ").toLocaleUpperCase("tr-TR");
}

function documentNotes(document) {
  return [
    document.synopsis && `ÖZET\n${clean(document.synopsis)}`,
    document.characters.length && `KARAKTERLER\n${document.characters.map(item => `${clean(item.name)}\n${clean(item.description)}`).join("\n\n")}`,
    document.dramaticQuestion && `DRAMATİK SORU\n${clean(document.dramaticQuestion)}`,
  ].filter(Boolean);
}

export function scenarioToText(input) {
  const document = normalizeScenario(input);
  return [
    clean(document.title) || "İsimsiz senaryo",
    clean(document.tagline),
    ...documentNotes(document),
    ...document.scenes.map(scene => [
      clean(scene.heading).toLocaleUpperCase("tr-TR"), clean(scene.action),
      ...scene.dialogue.map(line => `${characterName(document, line.character)}\n${clean(line.text)}`),
    ].filter(Boolean).join("\n\n")),
  ].filter(Boolean).join("\n\n") + "\n";
}

export function scenarioToFountain(input) {
  const document = normalizeScenario(input);
  const note = value => `[[${clean(value).replace(/\]\]/g, "] ]")}]]`;
  const title = clean(document.title || "İsimsiz senaryo").split("\n").join("\n    ");
  return [
    `Title: ${title}`,
    document.metadata.author && `Author: ${clean(document.metadata.author).split("\n").join("\n    ")}`,
    "",
    document.tagline && note(document.tagline),
    ...documentNotes(document).map(note),
    ...document.scenes.map(scene => [
      // Force Turkish scene headings, which Fountain readers do not auto-detect.
      `.${clean(scene.heading).replace(/\n/g, " ").toLocaleUpperCase("tr-TR")}`,
      clean(scene.action),
      ...scene.dialogue.map(line => `@${characterName(document, line.character)}\n${clean(line.text)}`),
    ].filter(Boolean).join("\n\n")),
  ].filter(value => value !== false && value != null).join("\n\n") + "\n";
}

export function scenarioToFdx(input) {
  const document = normalizeScenario(input);
  const paragraph = (type, value, attributes = "") => `    <Paragraph Type="${type}"${attributes}><Text>${xml(value)}</Text></Paragraph>`;
  const content = document.scenes.flatMap(scene => [
    paragraph("Scene Heading", clean(scene.heading).toLocaleUpperCase("tr-TR")),
    ...clean(scene.action).split(/\n\s*\n/).filter(Boolean).map(block => paragraph("Action", block)),
    ...scene.dialogue.flatMap(line => [paragraph("Character", characterName(document, line.character)), paragraph("Dialogue", line.text)]),
  ]).join("\n");
  const titlePage = [
    paragraph("Action", document.title || "İsimsiz senaryo", ' Alignment="Center"'),
    document.tagline && paragraph("Action", document.tagline, ' Alignment="Center"'),
    document.metadata.author && paragraph("Action", `Yazan\n${document.metadata.author}`, ' Alignment="Center"'),
  ].filter(Boolean).join("\n");
  return `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<FinalDraft DocumentType="Script" Template="No" Version="1">\n  <Content>\n${content}\n  </Content>\n  <TitlePage>\n    <Content>\n${titlePage}\n    </Content>\n  </TitlePage>\n</FinalDraft>\n`;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return btoa(binary);
}

async function loadFonts() {
  if (!fontRequest) {
    fontRequest = Promise.all(FONT_PATHS.map(async path => {
      const response = await fetch(path);
      if (!response.ok) throw new Error("PDF yazı tipi yüklenemedi. Lütfen tekrar deneyin.");
      return bufferToBase64(await response.arrayBuffer());
    })).then(([regular, bold]) => ({ regular, bold }));
    // A failed download should not permanently break future attempts.
    fontRequest.catch(() => { fontRequest = undefined; });
  }
  return fontRequest;
}

/** Build a printable, Unicode script PDF. Tests may inject local TTF base64. */
export async function buildScenarioPdf(input, { fontBase64 } = {}) {
  const document = normalizeScenario(input);
  const [{ jsPDF }, fonts] = await Promise.all([import("jspdf"), fontBase64 ? Promise.resolve(fontBase64) : loadFonts()]);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
  pdf.addFileToVFS("DejaVuSansMono.ttf", fonts.regular);
  pdf.addFont("DejaVuSansMono.ttf", FONT_FAMILY, "normal");
  pdf.addFileToVFS("DejaVuSansMono-Bold.ttf", fonts.bold || fonts.regular);
  pdf.addFont("DejaVuSansMono-Bold.ttf", FONT_FAMILY, "bold");
  pdf.setProperties({ title: document.title || "İsimsiz senaryo", subject: document.tagline, author: clean(document.metadata.author), creator: "Senaryo Studio" });
  pdf.setTextColor(0, 0, 0);
  const pageWidth = 210;
  const left = 31.8;
  const right = 25.4;
  const top = 25.4;
  const bottom = 273;
  const lineHeight = 5.2;
  let y = top;
  pdf.setFont(FONT_FAMILY, "normal");
  pdf.setFontSize(12);

  function newPage() { pdf.addPage(); y = top; }
  function ensureSpace(lines = 1) { if (y + (lines - 1) * lineHeight > bottom) newPage(); }
  function linesFor(value, width) { return pdf.splitTextToSize(clean(value), width); }
  function write(value, { x = left, width = pageWidth - left - right, bold = false, keepNext = 0 } = {}) {
    if (!clean(value).trim()) return;
    pdf.setFont(FONT_FAMILY, bold ? "bold" : "normal");
    const lines = linesFor(value, width);
    ensureSpace(Math.min(lines.length, 2) + keepNext);
    for (const line of lines) {
      ensureSpace();
      pdf.text(line, x, y);
      y += lineHeight;
    }
    y += lineHeight;
  }

  // Title page is deliberately restrained and remains readable in print.
  y = 100;
  pdf.setFontSize(20);
  const titleLines = linesFor(document.title || "İsimsiz senaryo", 150);
  // Huge titles continue onto another page rather than crossing the footer.
  for (const line of titleLines) {
    ensureSpace(); pdf.text(line, pageWidth / 2, y, { align: "center" }); y += 9;
  }
  pdf.setFontSize(12);
  if (document.tagline) { y += 10; write(document.tagline, { x: left, width: 152 }); }
  if (document.metadata.author) { y += 10; write(`Yazan\n${document.metadata.author}`); }

  if (document.scenes.length) {
    newPage();
    document.scenes.forEach(scene => {
      write(clean(scene.heading).toLocaleUpperCase("tr-TR"), { bold: true, keepNext: 2 });
      write(scene.action);
      scene.dialogue.forEach(line => {
        const name = characterName(document, line.character);
        pdf.setFont(FONT_FAMILY, "normal");
        const dialogue = linesFor(line.text, 88);
        ensureSpace(4);
        write(name, { x: 85, width: 95, keepNext: 1 });
        for (const words of dialogue) {
          if (y > bottom) {
            newPage();
            write(`${name} (DEVAM)`, { x: 85, width: 95, keepNext: 1 });
          }
          pdf.text(words, 63.5, y);
          y += lineHeight;
        }
        y += lineHeight;
      });
      y += lineHeight;
    });
  }

  const notes = documentNotes(document);
  if (notes.length) {
    newPage();
    write("PROJE NOTLARI", { bold: true, keepNext: 2 });
    notes.forEach(value => write(value));
  }
  const pageCount = pdf.internal.getNumberOfPages();
  for (let page = 2; page <= pageCount; page++) {
    pdf.setPage(page);
    pdf.setFont(FONT_FAMILY, "normal");
    pdf.setFontSize(10);
    pdf.text(String(page - 1) + ".", pageWidth - right, 15, { align: "right" });
  }
  return pdf;
}

function filename(input, format) {
  const title = clean(normalizeScenario(input).title || "senaryo");
  // eslint-disable-next-line no-control-regex -- Download filenames cannot contain controls.
  return `${title.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "").replace(/\s+/g, "_").replace(/^\.+|\.+$/g, "").slice(0, 100) || "senaryo"}.${format}`;
}

export async function downloadScenario(input, format) {
  if (!["txt", "fountain", "fdx", "pdf"].includes(format)) throw new Error("Desteklenmeyen dışa aktarma biçimi.");
  if (format === "pdf") {
    const pdf = await buildScenarioPdf(input);
    pdf.save(filename(input, format));
    return;
  }
  const exports = { txt: scenarioToText, fountain: scenarioToFountain, fdx: scenarioToFdx };
  const blob = new Blob([exports[format](input)], { type: format === "fdx" ? "application/xml;charset=utf-8" : "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename(input, format);
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
