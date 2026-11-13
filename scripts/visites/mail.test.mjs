import { test } from "node:test";
import assert from "node:assert/strict";
import { bodyText, buildReplyRaw, parseAddress, stripQuoted, threadTranscript } from "./mail.mjs";

const b64 = (s) => Buffer.from(s, "utf8").toString("base64url");

test("adresse, texte et historique cité", () => {
  assert.deepEqual(parseAddress('"Marie Dupont" <Marie@Ex.lu>'), {
    name: "Marie Dupont",
    email: "marie@ex.lu",
  });
  const msg = {
    payload: {
      mimeType: "multipart/alternative",
      parts: [
        { mimeType: "text/html", body: { data: b64("<p>Bonjour&nbsp;!</p><p>Mardi me va</p>") } },
      ],
    },
  };
  assert.equal(bodyText(msg), "Bonjour !\nMardi me va");
  assert.equal(
    stripQuoted(
      "Mardi 14h me va.\n\nLe ven. 13 nov. 2026, BabyHome a écrit :\n> Voici nos créneaux",
    ),
    "Mardi 14h me va.",
  );
});

test("brouillon de réponse dans le même fil, objet et texte UTF-8", () => {
  const raw = buildReplyRaw({
    from: "BabyHome <contact@babyhome.lu>",
    to: "marie@ex.lu",
    subject: "Visite crèche",
    inReplyTo: "<a@ex.lu>",
    references: "",
    text: "Bonjour,\nÀ mardi.",
  });
  const s = Buffer.from(raw, "base64url").toString("utf8");
  assert.match(s, /Subject: Re: Visite crèche|Subject: =\?UTF-8\?B\?/);
  assert.match(s, /In-Reply-To: <a@ex.lu>/);
  const body = s.split("\r\n\r\n")[1].replace(/\r\n/g, "");
  assert.equal(Buffer.from(body, "base64").toString("utf8"), "Bonjour,\r\nÀ mardi.");
});

test("fil : ordre, messages de la boîte, brouillons écartés", () => {
  const m = (id, from, t, labels = []) => ({
    id,
    internalDate: String(t),
    labelIds: labels,
    payload: {
      headers: [{ name: "From", value: from }],
      mimeType: "text/plain",
      body: { data: b64(id) },
    },
  });
  const tr = threadTranscript(
    {
      messages: [
        m("b", "contact@babyhome.lu", 2, ["SENT"]),
        m("a", "x@y.lu", 1),
        m("c", "contact@babyhome.lu", 3, ["DRAFT"]),
      ],
    },
    "contact@babyhome.lu",
  );
  assert.deepEqual(
    tr.map((x) => [x.id, x.ours]),
    [
      ["a", false],
      ["b", true],
    ],
  );
});
