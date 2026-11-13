// Lecture des messages Gmail et préparation des brouillons de réponse (règles pures, testées dans mail.test.mjs).

const b64urlDecode = (s) =>
  Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
const b64url = (s) =>
  Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/** Valeur d'un en-tête d'un message Gmail (format « full »). */
export function header(msg, name) {
  const h = msg?.payload?.headers?.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h?.value ?? "";
}

/** « Marie Dupont <marie@ex.lu> » → { name: 'Marie Dupont', email: 'marie@ex.lu' }. */
export function parseAddress(s) {
  const m = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(String(s));
  if (m) return { name: m[1].trim(), email: m[2].trim().toLowerCase() };
  return { name: "", email: String(s).trim().toLowerCase() };
}

function htmlToText(html) {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Texte d'un message : partie text/plain, sinon text/html convertie. */
export function bodyText(msg) {
  const plain = [];
  const html = [];
  const walk = (p) => {
    if (!p) return;
    if (p.mimeType === "text/plain" && p.body?.data) plain.push(b64urlDecode(p.body.data));
    else if (p.mimeType === "text/html" && p.body?.data) html.push(b64urlDecode(p.body.data));
    for (const c of p.parts ?? []) walk(c);
  };
  walk(msg?.payload);
  if (plain.length) return plain.join("\n").trim();
  if (html.length) return htmlToText(html.join("\n"));
  return String(msg?.snippet ?? "");
}

/** Retire l'historique cité d'une réponse (« Le … a écrit : », lignes « > »). */
export function stripQuoted(text) {
  const lines = String(text).split(/\r?\n/);
  const out = [];
  for (const l of lines) {
    if (
      /^\s*(Le |On |Am |Em |Il ).{0,200}(a écrit|wrote|schrieb|escreveu|ha scritto)\s*:\s*$/i.test(
        l,
      )
    )
      break;
    if (/^-{2,}\s*(Original Message|Message d'origine|Ursprüngliche Nachricht)/i.test(l)) break;
    if (/^\s*>/.test(l)) continue;
    out.push(l);
  }
  return out.join("\n").trim();
}

export const replySubject = (s) =>
  /^\s*(re|aw|réf)\s*:/i.test(s) ? s : `Re: ${s || "Visite de la crèche"}`;

const encodeHeader = (s) =>
  /^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;

/**
 * Message de réponse au format RFC 2822, encodé pour l'API Gmail (`raw`) : même fil (In-Reply-To,
 * References), texte UTF-8.
 */
export function buildReplyRaw({ from, to, subject, inReplyTo, references, text }) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeHeader(replySubject(subject))}`,
    ...(inReplyTo ? [`In-Reply-To: ${inReplyTo}`] : []),
    ...(inReplyTo || references
      ? [`References: ${[references, inReplyTo].filter(Boolean).join(" ")}`]
      : []),
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(text.replace(/\r?\n/g, "\r\n"), "utf8")
      .toString("base64")
      .replace(/.{76}/g, "$&\r\n"),
  ];
  return b64url(lines.join("\r\n"));
}

/** Messages du fil dans l'ordre, avec expéditeur, date et texte (pour l'analyse). */
export function threadTranscript(thread, mailbox) {
  return (thread.messages ?? [])
    .slice()
    .sort((a, b) => Number(a.internalDate) - Number(b.internalDate))
    .map((m) => {
      const from = parseAddress(header(m, "From"));
      const ours = from.email === mailbox.toLowerCase() || (m.labelIds ?? []).includes("SENT");
      return {
        id: m.id,
        ours,
        draft: (m.labelIds ?? []).includes("DRAFT"),
        from,
        date: new Date(Number(m.internalDate)),
        subject: header(m, "Subject"),
        messageId: header(m, "Message-ID") || header(m, "Message-Id"),
        references: header(m, "References"),
        text: ours ? bodyText(m) : stripQuoted(bodyText(m)),
      };
    })
    .filter((m) => !m.draft);
}
