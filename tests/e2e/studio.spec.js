import { readFile } from "node:fs/promises";
import { test, expect, installStudioFixture, seededDocument, TEST_USER_ID, OTHER_USER_ID } from "./fixtures.js";

async function openStudio(page) {
  await page.goto("/uret");
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toBeVisible();
}

test("guest edits survive reload and stay out of cloud storage", async ({ page }) => {
  const mock = await installStudioFixture(page, { authenticated: false });
  await openStudio(page);
  await page.getByLabel("Eser başlığı", { exact: true }).fill("Misafirin Türkçe taslağı");
  await page.getByLabel("Aksiyon", { exact: true }).fill("Çağrı yağmurlu sokağa çıkar.");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("senaryo-studio:draft:v1:guest"))?.document.title)).toBe("Misafirin Türkçe taslağı");
  await page.reload();
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toHaveValue("Misafirin Türkçe taslağı");
  await expect(page.getByLabel("Aksiyon", { exact: true })).toHaveValue("Çağrı yağmurlu sokağa çıkar.");
  await expect(page.getByRole("button", { name: "Kaydet", exact: true })).toBeDisabled();
  expect(mock.requests.filter(request => request.path.endsWith("/save_scenario"))).toEqual([]);
});

test("a failed cloud save is reported and the local document survives reload", async ({ page, studio }) => {
  studio.saveError = { code: "XX000", message: "Controlled save failure", details: "" };
  await openStudio(page);
  await page.getByLabel("Eser başlığı", { exact: true }).fill("Korunacak taslak");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Bulut kaydı başarısız" })).toBeVisible();
  await expect(page.getByText("Buluta kaydedilemedi", { exact: true })).toBeVisible();
  await expect(page.getByText(/^Buluta kaydedildi/)).toHaveCount(0);
  await expect.poll(() => page.evaluate(userId => JSON.parse(localStorage.getItem(`senaryo-studio:draft:v1:${userId}`))?.document.title, TEST_USER_ID)).toBe("Korunacak taslak");
  await page.reload();
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toHaveValue("Korunacak taslak");
});

test("a second account cannot load the first account's browser draft", async ({ page }) => {
  await installStudioFixture(page, { userId: OTHER_USER_ID });
  await page.addInitScript(({ ownerId, document }) => {
    localStorage.setItem(`senaryo-studio:draft:v1:${ownerId}`, JSON.stringify({ draftSchemaVersion: 1, ownerId, document: { ...document, title: "Başka hesabın gizli taslağı" }, row: null }));
  }, { ownerId: TEST_USER_ID, document: seededDocument });
  await openStudio(page);
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toHaveValue("");
  await expect(page.getByText("Başka hesabın gizli taslağı")).toHaveCount(0);
  await page.getByLabel("Eser başlığı", { exact: true }).fill("İkinci hesabın eseri");
  await expect.poll(() => page.evaluate(userId => JSON.parse(localStorage.getItem(`senaryo-studio:draft:v1:${userId}`))?.document.title, OTHER_USER_ID)).toBe("İkinci hesabın eseri");
  expect(await page.evaluate(userId => JSON.parse(localStorage.getItem(`senaryo-studio:draft:v1:${userId}`))?.document.title, TEST_USER_ID)).toBe("Başka hesabın gizli taslağı");
});

test("foreign ownership returned by a loose mock is still rejected by the editor", async ({ page, studio }) => {
  studio.row = { ...studio.row, user_id: OTHER_USER_ID, document: { ...seededDocument, title: "Yetkisiz eserin metni" } };
  await page.goto("/uret?id=101");
  await expect(page.getByRole("alert").filter({ hasText: "düzenleme yetkisi size ait değil" })).toBeVisible();
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toHaveValue(seededDocument.title);
  expect(studio.requests.filter(request => request.path.endsWith("/save_scenario"))).toEqual([]);
});

test("revision conflicts preserve edits and can fork a new private work", async ({ page, studio }) => {
  studio.saveError = { code: "40001", message: "Revision conflict", details: "Another session changed this revision" };
  await openStudio(page);
  await page.getByLabel("Eser başlığı", { exact: true }).fill("Çakışmadaki kendi metnim");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(page.getByText("Sürüm çakışması", { exact: true }).first()).toBeVisible();
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toHaveValue("Çakışmadaki kendi metnim");
  studio.saveError = null;
  await page.getByRole("button", { name: "Taslağı yeni eser olarak kaydet" }).click();
  await expect(page.getByText(/^Buluta kaydedildi/)).toBeVisible();
  const save = studio.requests.filter(request => request.path.endsWith("/save_scenario")).at(-1);
  expect(save.body.p_id).toBeNull();
  expect(save.body.p_expected_revision).toBeNull();
  expect(save.body.p_document.title).toBe("Çakışmadaki kendi metnim");
});

test("edits made during an in-flight save use the returned revision in the next save", async ({ page, studio }) => {
  studio.saveDelay = 800;
  await openStudio(page);
  await page.getByLabel("Eser başlığı", { exact: true }).fill("İlk kayıt metni");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect.poll(() => studio.requests.filter(request => request.path.endsWith("/save_scenario")).length).toBe(1);
  await page.getByLabel("Eser başlığı", { exact: true }).fill("Kayıt sürerken yazılan son metin");
  await expect.poll(() => studio.row.document.title).toBe("Kayıt sürerken yazılan son metin");
  await expect(page.getByText(/^Buluta kaydedildi/)).toBeVisible();
  const saves = studio.requests.filter(request => request.path.endsWith("/save_scenario"));
  expect(saves[0].body.p_expected_revision).toBe(1);
  expect(saves[0].body.p_document.title).toBe("İlk kayıt metni");
  expect(saves[1].body.p_expected_revision).toBe(2);
  expect(saves[1].body.p_document.title).toBe("Kayıt sürerken yazılan son metin");
});

test("creating the first version waits for the initial save and uses its scenario ID", async ({ page }) => {
  const mock = await installStudioFixture(page);
  await openStudio(page);
  await page.getByLabel("Eser başlığı", { exact: true }).fill("İlk sürümü oluşturulacak eser");
  await page.getByRole("button", { name: "Sürüm oluştur", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Sürüm geçmişi" })).toBeVisible();
  const saves = mock.requests.filter(request => request.path.endsWith("/save_scenario"));
  expect(saves).toHaveLength(1);
  expect(saves[0].body.p_id).toBeNull();
  const version = mock.requests.find(request => request.path.endsWith("/create_scenario_version"));
  expect(version.body.p_scenario_id).toBe(mock.row.id);
  expect(mock.row.document.title).toBe("İlk sürümü oluşturulacak eser");
});

test("failed AI generation keeps the original screenplay", async ({ page, studio }) => {
  studio.generationError = "Üretim servisi geçici olarak kullanılamıyor. Çalışmanız korundu.";
  await openStudio(page);
  await page.getByRole("button", { name: "+ AI ile başla", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Fikir, dünya veya özel istek").fill("İstanbul’da geçen iki kardeşin hikâyesi");
  await dialog.getByRole("button", { name: "Öneri üret", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Üretim servisi geçici" })).toBeVisible();
  await dialog.getByRole("button", { name: "Vazgeç", exact: true }).click();
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toHaveValue(seededDocument.title);
  await expect(page.getByLabel("Aksiyon", { exact: true })).toHaveValue(seededDocument.scenes[0].action);
});

test("AI proposals require acceptance and keep the previous work in recovery", async ({ page, studio }) => {
  await openStudio(page);
  await page.getByRole("button", { name: "+ AI ile başla", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Öneri üret", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Öneriyi inceleyin" })).toBeVisible();
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toHaveValue(seededDocument.title);
  await page.getByRole("button", { name: "Mevcut eserle devam et" }).click();
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toHaveValue(seededDocument.title);
  await page.getByRole("button", { name: "+ AI ile başla", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Öneri üret", exact: true }).click();
  await page.getByRole("button", { name: "Öneriyi editöre al" }).click();
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toHaveValue("Yeni Bir Sabah");
  await page.getByRole("button", { name: "Kurtarma", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Kurtarma arşivi" }).getByText(seededDocument.title, { exact: true })).toBeVisible();
  expect(studio.requests.filter(request => request.path === "/api/generate")).toHaveLength(2);
});

test("publishing and unpublishing persist through an explicit visibility RPC", async ({ page, studio }) => {
  await openStudio(page);
  await page.getByRole("button", { name: "Yayınla", exact: true }).click();
  await expect(page.getByText("Eseriniz toplulukta yayımlandı.", { exact: true })).toBeVisible();
  expect(studio.row.paylasim_acik).toBe(true);
  await page.getByRole("button", { name: "Yayından kaldır", exact: true }).click();
  await expect(page.getByText("Eseriniz yayından kaldırıldı; yalnız siz erişebilirsiniz.", { exact: true })).toBeVisible();
  expect(studio.row.paylasim_acik).toBe(false);
  expect(studio.requests.filter(request => request.path.endsWith("/set_scenario_visibility")).map(request => request.body.p_public)).toEqual([true, false]);
  await page.reload();
  await expect(page.getByRole("button", { name: "Yayınla", exact: true })).toBeVisible();
});

test("a selected AI rewrite stays a proposal and becomes stale when the script changes", async ({ page, studio }) => {
  await openStudio(page);
  await page.getByRole("button", { name: "Seçili aksiyonu AI ile düzenle" }).click();
  await page.getByRole("button", { name: "Önerileri getir", exact: true }).click();
  const apply = page.getByRole("button", { name: "Öneriyi seçili metne uygula" });
  await expect(apply).toBeEnabled();
  await expect(page.getByLabel("Aksiyon", { exact: true })).toHaveValue(seededDocument.scenes[0].action);
  await page.getByLabel("Aksiyon", { exact: true }).fill("Yazarın kendi yeni aksiyonu.");
  await expect(page.getByText("Metin değişti", { exact: true })).toBeVisible();
  await expect(apply).toBeDisabled();
  expect(studio.requests.find(request => request.path === "/api/diyalog").body.metin).toBe(seededDocument.scenes[0].action);
});

test("AI analysis survives reload with its original source and no repeated provider request", async ({ page, studio }) => {
  await openStudio(page);
  await page.getByRole("button", { name: "Önerileri getir", exact: true }).click();
  await expect(page.getByText(studio.analysis.sonuc, { exact: true })).toBeVisible();
  await expect(page.getByText("Güncel", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(userId => JSON.parse(localStorage.getItem(`senaryo-studio:draft:v1:${userId}`))?.document.metadata?.analyses?.dramaturg?.value?.sonuc, TEST_USER_ID)).toBe(studio.analysis.sonuc);
  await page.reload();
  await expect(page.getByText(studio.analysis.sonuc, { exact: true })).toBeVisible();
  await expect(page.getByText("Güncel", { exact: true })).toBeVisible();
  expect(studio.requests.filter(request => request.path === "/api/dramaturg")).toHaveLength(1);
  await page.getByLabel("Eser başlığı", { exact: true }).fill("Kaynağı değişmiş eser");
  await expect(page.getByText("Metin değişti", { exact: true })).toBeVisible();
});

test("all four exports download locally with UTF-8 screenplay and embedded-font PDF", async ({ page, studio }) => {
  await openStudio(page);
  for (const format of ["txt", "fountain", "fdx", "pdf"]) {
    const pending = page.waitForEvent("download");
    await page.getByRole("combobox", { name: "Dışa aktarma biçimi" }).selectOption(format);
    const download = await pending;
    expect(download.suggestedFilename()).toBe(`Kayıp_Işık.${format}`);
    const content = await readFile(await download.path());
    if (format === "pdf") {
      expect(content.subarray(0, 5).toString()).toBe("%PDF-");
      expect(content.toString("latin1")).toContain("/FontFile2");
    } else {
      expect(content.toString("utf8")).toContain(seededDocument.title);
      expect(content.toString("utf8")).toContain("ŞULE");
    }
  }
  expect(studio.blockedExternal).toEqual([]);
});

test("mobile workspace has no horizontal overflow and modal keyboard focus stays inside", async ({ page, studio }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStudio(page);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "İçeriğe geç" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page.getByRole("tab", { name: "Senaryo", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Hikâye & karakterler" })).toBeFocused();
  await expect(page.getByLabel("Hikâye özeti")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Senaryo", exact: true })).toBeFocused();
  const launch = page.getByRole("button", { name: "+ AI ile başla", exact: true });
  await launch.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(launch).toBeFocused();
  await testInfo.attach("mobil-studyo", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  expect(studio.unexpectedApi).toEqual([]);
});

test("account and community routes render named content without browser exceptions", async ({ page, studio }) => {
  const failures = [];
  page.on("pageerror", error => failures.push(error.message));
  for (const [path, title] of [["/mesajlar", "Bir sohbetle başlar."], ["/bildirimler", "Bildirimlerin."], ["/profil", "Yazar profilin."], ["/kesfet", "Yeni dünyalar keşfet."], ["/arama", "Aradığın hikâye burada."], ["/kaydedilenler", "Kitaplığın."]]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  expect(failures).toEqual([]);
  expect(studio.unexpectedApi).toEqual([]);
});

test("the same workspace supports light and dark themes with visible named controls", async ({ page, studio }, testInfo) => {
  await openStudio(page);
  await page.getByRole("button", { name: "Koyu temaya geç" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByLabel("Eser başlığı", { exact: true })).toBeVisible();
  await testInfo.attach("koyu-studyo", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Açık temaya geç" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await testInfo.attach("acik-studyo", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  expect(studio.unexpectedApi).toEqual([]);
});

test("nested recovery confirmation keeps keyboard focus in the top modal and restores it", async ({ page }) => {
  await installStudioFixture(page, { authenticated: false });
  await openStudio(page);
  await page.getByLabel("Eser başlığı", { exact: true }).fill("Kurtarmadaki eser");
  await page.getByRole("button", { name: "Yeni eser", exact: true }).click();
  await page.getByRole("dialog", { name: "Yeni eser", exact: true }).getByRole("button", { name: "Devam et", exact: true }).click();
  await page.getByRole("button", { name: "Kurtarma", exact: true }).click();
  const archive = page.getByRole("dialog", { name: "Kurtarma arşivi", exact: true });
  await archive.getByRole("button", { name: "Aç", exact: true }).click();
  const confirm = page.getByRole("dialog", { name: "Eseri aç", exact: true });
  await expect(confirm).toBeVisible();
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press("Tab");
    expect(await confirm.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(confirm).toHaveCount(0);
  await expect(archive.getByRole("button", { name: "Aç", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Kurtarma", exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});
