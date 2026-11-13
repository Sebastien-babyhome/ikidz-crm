import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatSlot,
  luxHolidays,
  luxParts,
  luxToDate,
  parseWindows,
  proposeSlots,
  slotMentioned,
} from "./slots.mjs";

test("heure de Luxembourg, été comme hiver", () => {
  assert.equal(luxToDate("2026-11-17", "10:00").toISOString(), "2026-11-17T09:00:00.000Z");
  assert.equal(luxToDate("2026-07-07", "10:00").toISOString(), "2026-07-07T08:00:00.000Z");
  assert.deepEqual(luxParts(new Date("2026-11-17T09:00:00Z")), {
    day: "2026-11-17",
    time: "10:00",
  });
});

test("jours fériés du Luxembourg (Pâques mobile)", () => {
  const h = luxHolidays(2027);
  for (const d of ["2027-03-29", "2027-05-06", "2027-05-17", "2027-06-23", "2027-12-26"])
    assert.ok(h.has(d), d);
});

const windows = parseWindows("09:30-11:30,14:00-16:30");
const now = new Date("2026-11-13T11:00:00Z"); // vendredi 13/11/2026, 12:00 à Luxembourg

test("trois créneaux libres, un par jour ouvré, après le délai, hors occupations", () => {
  const busy = [{ start: luxToDate("2026-11-16", "09:00"), end: luxToDate("2026-11-16", "12:00") }];
  const s = proposeSlots({ busy, now, windows, minLeadHours: 48, durationMin: 60 });
  assert.deepEqual(
    s.map((x) => luxParts(x.start)),
    [
      { day: "2026-11-16", time: "14:00" },
      { day: "2026-11-17", time: "09:30" },
      { day: "2026-11-18", time: "09:30" },
    ],
  );
});

test("préférences de la famille : mardi et jeudi après-midi", () => {
  const s = proposeSlots({ now, windows, prefer: { weekdays: [2, 4], moment: "apres-midi" } });
  assert.deepEqual(
    s.map((x) => luxParts(x.start)),
    [
      { day: "2026-11-17", time: "14:00" },
      { day: "2026-11-19", time: "14:00" },
      { day: "2026-11-24", time: "14:00" },
    ],
  );
});

test("créneau écrit dans la langue de la famille et retrouvé dans un e-mail envoyé", () => {
  const start = luxToDate("2026-11-17", "14:00");
  assert.equal(formatSlot(start, "fr"), "mardi 17 novembre 2026 à 14:00");
  assert.equal(formatSlot(start, "en"), "Tuesday, 17 November 2026 at 14:00");
  assert.ok(slotMentioned(`Voici nos créneaux :\n• ${formatSlot(start, "de")}`, start));
  assert.ok(!slotMentioned("• mardi 17 novembre 2026 à 15:00", start));
});
