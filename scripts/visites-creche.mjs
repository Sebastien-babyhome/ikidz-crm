#!/usr/bin/env node
// Tâche quotidienne « demandes de visite de crèche » (Clever Cloud, clevercloud/cron.json) — voir
// scripts/visites/run.mjs. Lancement à la main : `npm run visites` (VISITES_DRY_RUN=1 : rien n'est écrit).
//
// Variables (secrètes sauf mention) :
//   GOOGLE_SERVICE_ACCOUNT_JSON  clé JSON du compte de service (délégation au domaine babyhome.lu)
//   ANTHROPIC_API_KEY            clé de l'API Claude ; ANTHROPIC_MODEL (facultatif)
//   VISITES_ACTIF=1              interrupteur (rien n'est fait sans lui)
//   VISITES_BOITE                boîte lue (défaut contact@babyhome.lu)
//   VISITES_AGENDA               agenda consulté et complété (défaut kaleli.elhoufia@babyhome.lu)
//   VISITES_PLAGES               plages de visite (défaut 09:30-11:30,14:00-16:30)
//   VISITES_JOURS                jours de visite, 1 = lundi (défaut 1,2,3,4,5)
//   VISITES_DUREE_MIN            durée d'une visite en minutes (défaut 60)
//   VISITES_DELAI_HEURES         délai minimum avant une visite (défaut 48)
//   VISITES_HORIZON_JOURS        créneaux cherchés sur N jours (défaut 14)
//   VISITES_SIGNATURE            signature des réponses (\n pour les retours à la ligne)
//   VISITES_NOM_EXPEDITEUR       nom affiché de l'expéditeur (défaut BabyHome)
//   VISITES_DRY_RUN=1            lecture et analyse seulement (journal), aucune écriture
//   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY  (facultatif) noms et adresses des crèches (table creches)
import { callTool } from "./visites/claude.mjs";
import {
  accessToken,
  calendar,
  CALENDAR_SCOPES,
  gmail,
  GMAIL_SCOPES,
  serviceAccount,
} from "./visites/google.mjs";
import { runVisites } from "./visites/run.mjs";
import { parseWindows } from "./visites/slots.mjs";

const env = process.env;
if (env.INSTANCE_NUMBER && env.INSTANCE_NUMBER !== "0") process.exit(0);
if (env.VISITES_ACTIF !== "1" && env.VISITES_DRY_RUN !== "1") {
  console.log("visites-creche : VISITES_ACTIF n'est pas à 1, rien fait.");
  process.exit(0);
}

async function creches() {
  const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  const r = await fetch(
    `${url.replace(/\/$/, "")}/rest/v1/creches?select=name,address,city&order=name`,
    {
      headers: { apikey: key, authorization: `Bearer ${key}` },
    },
  );
  return r.ok ? r.json() : [];
}

const cfg = {
  mailbox: env.VISITES_BOITE ?? "contact@babyhome.lu",
  calendarUser: env.VISITES_AGENDA ?? "kaleli.elhoufia@babyhome.lu",
  windows: parseWindows(env.VISITES_PLAGES ?? "09:30-11:30,14:00-16:30"),
  weekdays: (env.VISITES_JOURS ?? "1,2,3,4,5")
    .split(",")
    .map(Number)
    .filter((n) => n >= 1 && n <= 7),
  durationMin: Number(env.VISITES_DUREE_MIN ?? 60),
  minLeadHours: Number(env.VISITES_DELAI_HEURES ?? 48),
  horizonDays: Number(env.VISITES_HORIZON_JOURS ?? 14),
  lookbackDays: 7,
  maxMessages: 100,
  fromName: env.VISITES_NOM_EXPEDITEUR ?? "BabyHome",
  signature: (
    env.VISITES_SIGNATURE ?? "Kaleli EL HOUFIA\nBabyHome – crèches Montessori\ncontact@babyhome.lu"
  ).replace(/\\n/g, "\n"),
  dryRun: env.VISITES_DRY_RUN === "1",
  creches: await creches(),
};

const sa = serviceAccount();
const [gt, ct] = await Promise.all([
  accessToken(sa, cfg.mailbox, GMAIL_SCOPES),
  accessToken(sa, cfg.calendarUser, CALENDAR_SCOPES),
]);
console.log(
  `visites-creche : ${cfg.mailbox} → agenda ${cfg.calendarUser}${cfg.dryRun ? " (essai, rien n'est écrit)" : ""}`,
);
const stats = await runVisites({
  gm: gmail(gt, cfg.mailbox),
  cal: calendar(ct, cfg.calendarUser),
  ai: (o) => callTool(o),
  cfg,
});
console.log(`visites-creche : ${JSON.stringify(stats)}`);
if (stats.erreurs) process.exitCode = 1;
