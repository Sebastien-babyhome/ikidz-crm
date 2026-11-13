// Accès Google Workspace (Gmail, Agenda) par un compte de service avec délégation au domaine babyhome.lu.
// Secret : GOOGLE_SERVICE_ACCOUNT_JSON (clé JSON du compte de service). Dans la console d'administration
// Google Workspace (Sécurité › Contrôle des API › Délégation au niveau du domaine), autoriser l'ID client du
// compte de service pour les champs d'application :
//   https://www.googleapis.com/auth/gmail.modify, https://www.googleapis.com/auth/gmail.compose,
//   https://www.googleapis.com/auth/calendar
import { createSign } from "node:crypto";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.compose",
];
export const CALENDAR_SCOPES = ["https://www.googleapis.com/auth/calendar"];

const b64url = (s) =>
  Buffer.from(s).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export function serviceAccount(raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON absent.");
  const sa = JSON.parse(raw);
  if (!sa.client_email || !sa.private_key)
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON incomplet.");
  return sa;
}

/** Jeton d'accès au nom de `subject` (adresse du domaine), pour les champs d'application demandés. */
export async function accessToken(sa, subject, scopes) {
  const now = Math.floor(Date.now() / 1000);
  const aud = sa.token_uri ?? "https://oauth2.googleapis.com/token";
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(
    JSON.stringify({
      iss: sa.client_email,
      sub: subject,
      scope: scopes.join(" "),
      aud,
      iat: now,
      exp: now + 3600,
    }),
  )}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key);
  const res = await fetch(aud, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${b64url(sig)}`,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(
      `Jeton Google refusé pour ${subject} (${data.error ?? res.status}) : vérifiez la délégation au domaine du compte de service.`,
    );
  }
  return data.access_token;
}

async function api(token, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok)
    throw new Error(
      `${method} ${url.split("?")[0]} : ${res.status} ${(await res.text()).slice(0, 300)}`,
    );
  return res.status === 204 ? null : res.json();
}

/** Client Gmail de la boîte `user` (ex. contact@babyhome.lu). */
export function gmail(token, user) {
  const base = `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(user)}`;
  return {
    async listMessageIds(q, max = 100) {
      const ids = [];
      let pageToken;
      do {
        const p = new URLSearchParams({
          q,
          maxResults: "100",
          ...(pageToken ? { pageToken } : {}),
        });
        const r = await api(token, "GET", `${base}/messages?${p}`);
        for (const m of r.messages ?? []) ids.push({ id: m.id, threadId: m.threadId });
        pageToken = r.nextPageToken;
      } while (pageToken && ids.length < max);
      return ids.slice(0, max);
    },
    getThread: (id) => api(token, "GET", `${base}/threads/${id}?format=full`),
    async labelIds(names) {
      const r = await api(token, "GET", `${base}/labels`);
      const out = {};
      for (const name of names) {
        let l = (r.labels ?? []).find((x) => x.name === name);
        if (!l) {
          l = await api(token, "POST", `${base}/labels`, {
            name,
            labelListVisibility: "labelShow",
            messageListVisibility: "show",
          });
        }
        out[name] = l.id;
      }
      return out;
    },
    modifyMessage: (id, add = [], remove = []) =>
      api(token, "POST", `${base}/messages/${id}/modify`, {
        addLabelIds: add,
        removeLabelIds: remove,
      }),
    modifyThread: (id, add = [], remove = []) =>
      api(token, "POST", `${base}/threads/${id}/modify`, {
        addLabelIds: add,
        removeLabelIds: remove,
      }),
    createDraft: (raw, threadId) =>
      api(token, "POST", `${base}/drafts`, { message: { raw, threadId } }),
  };
}

/** Client Agenda de `user` (agenda principal). */
export function calendar(token, user) {
  const base = "https://www.googleapis.com/calendar/v3";
  return {
    async busy(timeMin, timeMax) {
      const r = await api(token, "POST", `${base}/freeBusy`, {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: "Europe/Luxembourg",
        items: [{ id: user }],
      });
      const cal = r.calendars?.[user];
      if (cal?.errors?.length)
        throw new Error(`Agenda ${user} illisible : ${cal.errors.map((e) => e.reason).join(", ")}`);
      return (cal?.busy ?? []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
    },
    insertEvent: (event) =>
      api(
        token,
        "POST",
        `${base}/calendars/${encodeURIComponent(user)}/events?sendUpdates=none`,
        event,
      ),
  };
}
