// Créneaux de visite proposés aux familles (règles pures, testées dans slots.test.mjs).
// Heure de Luxembourg (Europe/Luxembourg) ; jours fériés légaux du Luxembourg exclus.

const TZ = "Europe/Luxembourg";

/** Décalage (minutes) de l'heure de Luxembourg par rapport à UTC à l'instant `d`. */
export function luxOffsetMinutes(d) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return Math.round((asUtc - Math.floor(d.getTime() / 60000) * 60000) / 60000);
}

/** « 2026-11-17 » + « 10:00 » (heure de Luxembourg) → instant UTC. */
export function luxToDate(day, hhmm) {
  const [y, m, d] = day.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, h, mi));
  const first = new Date(guess.getTime() - luxOffsetMinutes(guess) * 60000);
  // Second passage : correct autour des changements d'heure.
  return new Date(guess.getTime() - luxOffsetMinutes(first) * 60000);
}

/** Jour (AAAA-MM-JJ) et heure (HH:MM) à Luxembourg d'un instant. */
export function luxParts(d) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

export function addDays(day, n) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
/** 1 = lundi … 7 = dimanche. */
export const isoWeekday = (day) => {
  const w = new Date(`${day}T12:00:00Z`).getUTCDay();
  return w === 0 ? 7 : w;
};

/** Dimanche de Pâques (algorithme de Meeus). */
function easter(y) {
  const a = y % 19,
    b = Math.floor(y / 100),
    c = y % 100,
    d = Math.floor(b / 4),
    e = b % 4,
    f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4),
    k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451),
    month = Math.floor((h + l - 7 * m + 114) / 31),
    day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Jours fériés légaux du Luxembourg pour une année. */
export function luxHolidays(y) {
  const e = easter(y);
  return new Set([
    `${y}-01-01`,
    addDays(e, 1), // lundi de Pâques
    `${y}-05-01`,
    `${y}-05-09`, // Journée de l'Europe
    addDays(e, 39), // Ascension
    addDays(e, 50), // lundi de Pentecôte
    `${y}-06-23`, // Fête nationale
    `${y}-08-15`,
    `${y}-11-01`,
    `${y}-12-25`,
    `${y}-12-26`,
  ]);
}

/** « 09:30-11:30,14:00-16:30 » → [{ start: '09:30', end: '11:30' }, …]. */
export function parseWindows(s) {
  return String(s)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const m = /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/.exec(x);
      if (!m) throw new Error(`Plage horaire invalide : ${x}`);
      const pad = (t) => t.padStart(5, "0");
      return { start: pad(m[1]), end: pad(m[2]) };
    });
}

const overlaps = (a, b) => a.start < b.end && b.start < a.end;
const minutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const hm = (n) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/**
 * Créneaux libres proposés : au plus un par jour, `count` au total, sur les jours et plages autorisés,
 * hors jours fériés et hors occupations (`busy` : [{ start: Date, end: Date }]), au moins `minLeadHours`
 * après `now`. Préférences de la famille (`prefer`) : jours de la semaine, moment (matin / après-midi),
 * dates précises ; les créneaux qui les respectent passent en premier.
 */
export function proposeSlots(o) {
  const {
    busy = [],
    now,
    horizonDays = 14,
    minLeadHours = 24,
    windows,
    durationMin = 60,
    weekdays = [1, 2, 3, 4, 5],
    stepMin = 30,
    count = 3,
    prefer = {},
  } = o;
  const earliest = new Date(now.getTime() + minLeadHours * 3600000);
  const startDay = luxParts(now).day;
  const holidays = new Set([
    ...luxHolidays(+startDay.slice(0, 4)),
    ...luxHolidays(+startDay.slice(0, 4) + 1),
  ]);
  const candidates = [];
  for (let i = 0; i <= horizonDays; i++) {
    const day = addDays(startDay, i);
    if (!weekdays.includes(isoWeekday(day)) || holidays.has(day)) continue;
    for (const w of windows) {
      for (let t = minutes(w.start); t + durationMin <= minutes(w.end); t += stepMin) {
        const start = luxToDate(day, hm(t));
        const end = new Date(start.getTime() + durationMin * 60000);
        if (start < earliest) continue;
        if (busy.some((b) => overlaps({ start, end }, b))) continue;
        const morning = t < 12 * 60;
        let score = 0;
        if (prefer.dates?.length) score += prefer.dates.includes(day) ? 4 : 0;
        if (prefer.weekdays?.length) score += prefer.weekdays.includes(isoWeekday(day)) ? 2 : 0;
        if (prefer.moment === "matin") score += morning ? 1 : 0;
        if (prefer.moment === "apres-midi") score += morning ? 0 : 1;
        candidates.push({ day, start, end, score });
      }
    }
  }
  // Meilleur score d'abord, puis le plus tôt ; un seul créneau par jour.
  candidates.sort((a, b) => b.score - a.score || a.start - b.start);
  const out = [];
  const days = new Set();
  for (const c of candidates) {
    if (days.has(c.day)) continue;
    days.add(c.day);
    out.push({ start: c.start, end: c.end });
    if (out.length === count) break;
  }
  return out.sort((a, b) => a.start - b.start);
}

const LOCALES = {
  fr: "fr-FR",
  en: "en-GB",
  de: "de-DE",
  pt: "pt-PT",
  it: "it-IT",
  es: "es-ES",
  nl: "nl-NL",
};
const AT = { fr: "à", en: "at", de: "um", pt: "às", it: "alle", es: "a las", nl: "om" };

/** « mardi 17 novembre 2026 à 10:00 » (dans la langue de la famille ; français par défaut). */
export function formatSlot(start, lang = "fr") {
  const l = LOCALES[lang] ? lang : "fr";
  const date = new Intl.DateTimeFormat(LOCALES[l], {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);
  return `${date} ${AT[l]} ${luxParts(start).time}`;
}

/** Vrai si le créneau commençant à `start` figure dans le texte (proposé dans un e-mail envoyé). */
export function slotMentioned(text, start) {
  const t = String(text).toLowerCase();
  return Object.keys(LOCALES).some((l) => t.includes(formatSlot(start, l).toLowerCase()));
}
