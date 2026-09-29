// Synthetic fixtures only (TEST-* permits, .test domains). No real contractor data.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  addBusinessDays, draftOutreach, isStopReply, makeSourceCode, mapHeaders, normalizeEmail,
  normalizeSource, parseCsv, rowsToCandidates, score, toIsoDate, trackedLink, COMPANY,
} from "../netlify/lib/flywheel";

test("normalizeSource allow-lists and falls back", () => {
  assert.equal(normalizeSource("o-3f9c2a1b"), "o-3f9c2a1b");
  assert.equal(normalizeSource("  O-ABC_1 "), "o-abc_1");
  assert.equal(normalizeSource("<script>"), "crew-shuttle-landing");
  assert.equal(normalizeSource("a".repeat(81)), "crew-shuttle-landing");
  assert.equal(normalizeSource(undefined), "crew-shuttle-landing");
});

test("makeSourceCode is stable and short", () => {
  assert.equal(makeSourceCode("3f9c2a1b-0000-4000-8000-000000000000"), "o-3f9c2a1b");
  assert.throws(() => makeSourceCode("xyz"));
});

test("trackedLink sets source without dropping other params", () => {
  assert.equal(trackedLink("https://spatchy.netlify.app/?lang=es", "o-1"), "https://spatchy.netlify.app/?lang=es&source=o-1");
});

test("score ranks parking-on-record island jobs highest", () => {
  const island = { address: "a", sourceUrl: "s", jurisdiction: "Town of Palm Beach" };
  const parking = score({ ...island, signalType: "row_parking_permit", strikeCmaFlag: true });
  const permit = score({ ...island, signalType: "construction_permit" });
  const early = score({ ...island, signalType: "dev_review", phase: "pre" });
  assert.ok(parking > permit && permit > early, `${parking} > ${permit} > ${early}`);
  assert.ok(parking <= 100);
});

test("every draft step carries the CAN-SPAM footer in both languages and states no invented facts", () => {
  const c = { address: "100 Example Way", sourceUrl: "s", signalType: "row_parking_permit" as const };
  for (const step of [1, 2, 3] as const) {
    const d = draftOutreach(c, "https://x.test/?source=o-1", step);
    for (const lang of ["en", "es"] as const) {
      assert.ok(d[lang].body.includes(COMPANY.postal), `${step}/${lang} postal`);
      assert.ok(d[lang].body.includes(COMPANY.phone), `${step}/${lang} phone`);
      assert.ok(d[lang].body.includes("?source=o-1"), `${step}/${lang} link`);
      assert.match(d[lang].body, lang === "en" ? /Reply STOP/ : /Responda ALTO/);
      assert.ok(d[lang].subject.includes("100 Example Way"));
    }
  }
  assert.match(draftOutreach(c, "https://x.test/", 1).en.body, /construction parking on file/);
  assert.doesNotMatch(draftOutreach({ ...c, signalType: "construction_permit" }, "https://x.test/", 1).en.body, /on file/);
  assert.match(draftOutreach(c, "https://x.test/", 1).en.body, /27–31 seats/);
});

test("addBusinessDays skips weekends", () => {
  // Fri 2026-10-02 + 1 business day = Mon 2026-10-05
  assert.equal(addBusinessDays(new Date("2026-10-02T15:00:00Z"), 1).toISOString().slice(0, 10), "2026-10-05");
  // Mon + 4 = Fri
  assert.equal(addBusinessDays(new Date("2026-10-05T15:00:00Z"), 4).toISOString().slice(0, 10), "2026-10-09");
});

test("isStopReply catches opt-outs in EN/ES but not our quoted footer", () => {
  assert.equal(isStopReply("STOP"), true);
  assert.equal(isStopReply("Please remove me from your list"), true);
  assert.equal(isStopReply("alto por favor"), true);
  assert.equal(isStopReply("Unsubscribe"), true);
  assert.equal(isStopReply("Sounds good, we have 60 riders per shift.\n\n> Reply STOP and we won't contact you again."), false);
  assert.equal(isStopReply("Can you send pricing?\nReply STOP and we won't contact you again."), false);
  assert.equal(isStopReply("Interested. Call me."), false);
});

test("normalizeEmail handles display names and rejects junk", () => {
  assert.equal(normalizeEmail("Pat Super <Pat@Builder.test>"), "pat@builder.test");
  assert.equal(normalizeEmail("nope"), null);
});

test("toIsoDate parses US and ISO dates", () => {
  assert.equal(toIsoDate("3/4/2026"), "2026-03-04");
  assert.equal(toIsoDate("03/12/26"), "2026-03-12");
  assert.equal(toIsoDate("2026-03-09"), "2026-03-09");
  assert.equal(toIsoDate("13/40/2026"), undefined);
  assert.equal(toIsoDate(""), undefined);
});

test("parseCsv handles quotes, commas, CRLF, BOM", () => {
  const rows = parseCsv('\uFEFFa,b\r\n"x, y","say ""hi"""\r\n');
  assert.deepEqual(rows, [["a", "b"], ["x, y", 'say "hi"']]);
});

test("mapHeaders matches Town-style headers", () => {
  const m = mapHeaders(["Permit Number", "Project Address", "Contractor Corporate Name", "Contractor Phone #"]);
  assert.deepEqual(m, { permit: 0, address: 1, contractor: 2, phone: 3 });
});

test("rowsToCandidates maps the sample, dedupes, skips blanks, promotes ROW parking", () => {
  const { candidates, skipped } = rowsToCandidates(readFileSync("tests/fixtures/records-sample.csv", "utf8"), {
    requestRef: "PRR-TEST-1",
    signalType: "construction_permit",
  });
  assert.equal(candidates.length, 2);
  assert.deepEqual(skipped.map((s) => s.reason), ["no address", "duplicate TEST-0001"]);
  const [a, b] = candidates;
  assert.equal(a.sourceUrl, "records:PRR-TEST-1#TEST-0001");
  assert.equal(a.contractorEmail, "sup@example-builders.test");
  assert.equal(a.startDate, "2026-03-04");
  assert.equal(a.signalType, "construction_permit");
  assert.equal(b.signalType, "row_parking_permit");
  assert.equal(b.strikeCmaFlag, true);
  assert.equal(b.contractorEmail, undefined);
});

test("rowsToCandidates fails loudly with the headers it saw", () => {
  assert.throws(
    () => rowsToCandidates("Foo,Bar\n1,2\n", { requestRef: "R", signalType: "construction_permit" }),
    /missing required column\(s\): address\. Headers seen: Foo \| Bar/,
  );
});
