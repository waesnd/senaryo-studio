import test from "node:test";
import assert from "node:assert/strict";
import {
  applyCursor,
  errorMessage,
  normalizeTag,
  safeUrl,
  searchPattern,
  unwrap,
} from "../lib/social-client.js";

test("public profile links reject executable and embedded document protocols", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "//attacker.example",
    "file:///etc/passwd",
  ])
    assert.equal(safeUrl(value), "");
  assert.equal(
    safeUrl("https://örnek.com/yazar?ad=Ayşe"),
    "https://xn--rnek-4qa.com/yazar?ad=Ay%C5%9Fe",
  );
});

test("user search is literal even for wildcard and PostgREST filter syntax", () => {
  assert.equal(searchPattern(" %_\\ "), "%\\%\\_\\\\%");
  assert.equal(searchPattern("a),id.gt.0"), "%a),id.gt.0%");
  assert.equal(searchPattern("x".repeat(1000)).length, 122);
});

test("cursor refuses untrusted grammar and keeps exact timestamp precision for stable ties", () => {
  const filters = [],
    request = {
      or(value) {
        filters.push(value);
        return this;
      },
    };
  const cursor = { created_at: "2026-10-11T12:45:12.123456+00:00", id: 42 };
  assert.equal(applyCursor(request, cursor), request);
  assert.equal(
    filters[0],
    "created_at.lt.2026-10-11T12:45:12.123456+00:00,and(created_at.eq.2026-10-11T12:45:12.123456+00:00,id.lt.42)",
  );
  assert.throws(
    () => applyCursor(request, { ...cursor, id: "1),user_id.neq.null" }),
    /geçersiz/,
  );
  assert.throws(
    () =>
      applyCursor(request, {
        ...cursor,
        created_at: "2026-10-11T12:00:00Z),id.gt.0",
      }),
    /geçersiz/,
  );
  assert.throws(
    () =>
      applyCursor(request, { ...cursor, created_at: "2026-99-99T12:00:00Z" }),
    /geçersiz/,
  );
});

test("Turkish hashtags normalize compatibility forms and decomposed characters", () => {
  assert.equal(normalizeTag(" #İSTANBUL "), "istanbul");
  assert.equal(normalizeTag("#IŞIK"), "ışık");
  assert.equal(normalizeTag("#C\u0327ıg\u0306lık"), "çığlık");
});

test("service errors become readable Turkish without exposing SQL object names", () => {
  assert.match(errorMessage({ message: "CHALLENGE_CLOSED" }), /teslim süresi/);
  assert.match(
    errorMessage({ message: "SCENARIO_NOT_ACCESSIBLE" }),
    /erişimin yok/,
  );
  assert.match(
    errorMessage({
      message: "new row violates row-level security policy for table mesajlar",
      code: "42501",
    }),
    /yetkin yok/,
  );
  assert.equal(
    errorMessage({ message: 'column "public.secret" does not exist' }).includes(
      "public.secret",
    ),
    false,
  );
  assert.throws(
    () => unwrap({ error: { message: "PROFILE_NOT_FOUND" } }),
    /Yazar bulunamadı/,
  );
  assert.equal(errorMessage({ name: "AbortError" }), "");
});
