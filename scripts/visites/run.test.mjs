import { test } from "node:test";
import assert from "node:assert/strict";
import { LABELS, runVisites } from "./run.mjs";
import { parseWindows } from "./slots.mjs";

const b64 = (s) => Buffer.from(s, "utf8").toString("base64url");
const msg = (id, from, t, text, labels = []) => ({
  id,
  threadId: "T1",
  internalDate: String(Date.parse(t)),
  labelIds: labels,
  payload: {
    mimeType: "text/plain",
    headers: [
      { name: "From", value: from },
      { name: "Subject", value: "Visite de la crèche" },
      { name: "Message-ID", value: `<${id}@ex.lu>` },
    ],
    body: { data: b64(text) },
  },
});

function fakes(thread) {
  const calls = { drafts: [], events: [], threadLabels: [], marked: [] };
  const gm = {
    labelIds: async (names) => Object.fromEntries(names.map((n) => [n, `L:${n}`])),
    listMessageIds: async () =>
      thread.messages
        .filter((m) => !m.labelIds.includes("SENT"))
        .slice(-1)
        .map((m) => ({ id: m.id, threadId: "T1" })),
    getThread: async () => thread,
    createDraft: async (raw) => calls.drafts.push(Buffer.from(raw, "base64url").toString("utf8")),
    modifyThread: async (_id, add) => calls.threadLabels.push(...add),
    modifyMessage: async (id) => calls.marked.push(id),
  };
  const cal = { busy: async () => [], insertEvent: async (e) => calls.events.push(e) };
  return { gm, cal, calls };
}

const cfg = {
  mailbox: "contact@babyhome.lu",
  windows: parseWindows("09:30-11:30,14:00-16:30"),
  weekdays: [1, 2, 3, 4, 5],
  durationMin: 60,
  minLeadHours: 48,
  horizonDays: 14,
  lookbackDays: 7,
  maxMessages: 100,
  fromName: "BabyHome",
  signature: "Kaleli EL HOUFIA\nBabyHome",
  dryRun: false,
  creches: [
    { name: "Babyhome Belair", address: "22 rue Jean-Pierre Brasseur", city: "Luxembourg" },
  ],
};
const analysis = {
  visite: true,
  parent_nom: "Marie Dupont",
  langue: "fr",
  creche: "Babyhome Belair",
  enfant: "8 mois",
  telephone: "",
  jours: [],
  moment: "",
  dates: [],
  resume: "Visite pour une entrée en janvier.",
};
const now = new Date("2026-11-13T11:00:00Z");

test("nouvelle demande de visite : brouillon avec trois créneaux, fil marqué « réponse préparée »", async () => {
  const thread = {
    messages: [
      msg(
        "m1",
        "Marie Dupont <marie@ex.lu>",
        "2026-11-13T08:00:00Z",
        "Bonjour, pouvons-nous visiter la crèche de Belair ?",
      ),
    ],
  };
  const { gm, cal, calls } = fakes(thread);
  const ai = async (o) =>
    o.tool.name === "analyse_demande"
      ? analysis
      : { texte: "Bonjour Madame Dupont,\n\n{{CRENEAUX}}\n\nKaleli EL HOUFIA\nBabyHome" };
  const stats = await runVisites({ gm, cal, ai, cfg, now, log: () => {} });
  assert.equal(stats.brouillons, 1);
  assert.deepEqual(calls.threadLabels, [`L:${LABELS.proposee}`]);
  assert.deepEqual(calls.marked, ["m1"]);
  const body = Buffer.from(
    calls.drafts[0].split("\r\n\r\n")[1].replace(/\r\n/g, ""),
    "base64",
  ).toString("utf8");
  assert.match(body, /• lundi 16 novembre 2026 à 09:30/);
  assert.match(body, /• mardi 17 novembre 2026 à 09:30/);
  assert.equal(calls.events.length, 0);
});

test("la famille confirme un créneau proposé : RDV dans l'agenda et brouillon de confirmation", async () => {
  const thread = {
    messages: [
      msg(
        "m1",
        "Marie Dupont <marie@ex.lu>",
        "2026-11-12T08:00:00Z",
        "Bonjour, pouvons-nous visiter Belair ?",
        [`L:${LABELS.proposee}`],
      ),
      msg(
        "s1",
        "BabyHome <contact@babyhome.lu>",
        "2026-11-12T09:00:00Z",
        "Créneaux :\n• mardi 17 novembre 2026 à 09:30\n• mercredi 18 novembre 2026 à 09:30",
        ["SENT", `L:${LABELS.proposee}`],
      ),
      msg(
        "m2",
        "Marie Dupont <marie@ex.lu>",
        "2026-11-13T07:00:00Z",
        "Mardi 9h30 nous convient, merci !",
      ),
    ],
  };
  const { gm, cal, calls } = fakes(thread);
  const ai = async (o) =>
    o.tool.name === "analyse_demande"
      ? analysis
      : o.tool.name === "analyse_reponse"
        ? { confirme: true, creneau: "2026-11-17T09:30", autres_creneaux: false, remarque: "" }
        : { texte: "C'est noté.\n\nKaleli EL HOUFIA\nBabyHome" };
  const stats = await runVisites({ gm, cal, ai, cfg, now, log: () => {} });
  assert.equal(stats.rdv, 1);
  assert.equal(calls.events[0].summary, "Visite crèche Babyhome Belair – Marie Dupont");
  assert.equal(calls.events[0].start.dateTime, "2026-11-17T08:30:00.000Z");
  assert.equal(calls.events[0].location, "22 rue Jean-Pierre Brasseur, Luxembourg");
  assert.deepEqual(calls.threadLabels, [`L:${LABELS.rdv}`]);
  assert.equal(calls.drafts.length, 1);
});

test("créneau jamais proposé : rien dans l'agenda (traitement à la main)", async () => {
  const thread = {
    messages: [
      msg("m1", "marie@ex.lu", "2026-11-12T08:00:00Z", "Visite ?", [`L:${LABELS.proposee}`]),
      msg("s1", "contact@babyhome.lu", "2026-11-12T09:00:00Z", "• mardi 17 novembre 2026 à 09:30", [
        "SENT",
      ]),
      msg("m2", "marie@ex.lu", "2026-11-13T07:00:00Z", "Plutôt vendredi 16h ?"),
    ],
  };
  const { gm, cal, calls } = fakes(thread);
  const ai = async (o) =>
    o.tool.name === "analyse_demande"
      ? analysis
      : { confirme: true, creneau: "2026-11-20T16:00", autres_creneaux: false, remarque: "" };
  await runVisites({ gm, cal, ai, cfg, now, log: () => {} });
  assert.equal(calls.events.length, 0);
  assert.equal(calls.drafts.length, 0);
});

test("e-mail sans demande de visite : seulement marqué comme lu par l'automate", async () => {
  const thread = {
    messages: [msg("m1", "fournisseur@ex.lu", "2026-11-13T08:00:00Z", "Votre facture")],
  };
  const { gm, cal, calls } = fakes(thread);
  const ai = async () => ({ ...analysis, visite: false });
  await runVisites({ gm, cal, ai, cfg, now, log: () => {} });
  assert.deepEqual([calls.drafts.length, calls.threadLabels.length, calls.marked], [0, 0, ["m1"]]);
});
