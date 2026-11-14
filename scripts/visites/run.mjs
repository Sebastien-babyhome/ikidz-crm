// Demandes de visite de crèche reçues sur contact@babyhome.lu (demande du 13/11/2026) :
//  1. chaque jour, les e-mails reçus et pas encore analysés sont lus ; une demande de visite reçoit un
//     BROUILLON de réponse (jamais envoyé automatiquement) dans la boîte contact@, avec trois créneaux libres
//     de l'agenda de Kaleli EL HOUFIA ; le fil reçoit le libellé « Visites crèche/Réponse préparée » ;
//  2. quand la famille répond à la réponse envoyée en choisissant un créneau proposé, le rendez-vous est
//     ajouté à l'agenda (après vérification qu'il est toujours libre), un brouillon de confirmation est
//     préparé et le fil reçoit « Visites crèche/RDV dans l'agenda ». Créneau pris entre-temps ou aucun
//     créneau ne convient : nouveau brouillon avec d'autres créneaux.
// Chaque message traité reçoit le libellé « Visites-creche/Analyse » (il n'est plus relu).
// Dépendances injectées (Gmail, Agenda, IA) pour les tests (run.test.mjs).
import { analyzeReply, analyzeRequest, writeConfirmation, writeProposal } from "./claude.mjs";
import { buildReplyRaw, threadTranscript } from "./mail.mjs";
import { formatSlot, luxParts, luxToDate, proposeSlots, slotMentioned } from "./slots.mjs";

export const LABELS = {
  analyse: "Visites-creche/Analyse",
  proposee: "Visites crèche/Réponse préparée",
  rdv: "Visites crèche/RDV dans l'agenda",
};

/**
 * @param {object} d
 * @param {ReturnType<import('./google.mjs').gmail>} d.gm
 * @param {ReturnType<import('./google.mjs').calendar>} d.cal
 * @param {(o: object) => Promise<any>} d.ai  appel d'outil Claude (claude.mjs › callTool)
 * @param {object} d.cfg
 */
export async function runVisites({ gm, cal, ai, cfg, now = new Date(), log = console.log }) {
  const mailbox = cfg.mailbox.toLowerCase();
  const labels = await gm.labelIds(Object.values(LABELS));
  const L = {
    analyse: labels[LABELS.analyse],
    proposee: labels[LABELS.proposee],
    rdv: labels[LABELS.rdv],
  };
  const today = luxParts(now).day;
  const crecheNames = cfg.creches.map((c) => c.name);
  const addressOf = (name) => {
    const c = cfg.creches.find((x) => x.name === name);
    return c ? [c.address, c.city].filter(Boolean).join(", ") : "";
  };
  const reserved = []; // créneaux proposés pendant ce passage (pas deux familles sur le même)
  const stats = { lus: 0, demandes: 0, brouillons: 0, rdv: 0, ignores: 0, erreurs: 0 };
  const write = !cfg.dryRun;

  const q = `in:inbox -from:${mailbox} -label:${LABELS.analyse.replace(/\//g, "-").toLowerCase()} newer_than:${cfg.lookbackDays}d`;
  const ids = await gm.listMessageIds(q, cfg.maxMessages);

  const draft = async (thread, to, text) => {
    const first = thread[0];
    const last = thread[thread.length - 1];
    const raw = buildReplyRaw({
      from: cfg.fromName ? `${cfg.fromName} <${cfg.mailbox}>` : cfg.mailbox,
      to: to.name ? `${to.name} <${to.email}>` : to.email,
      subject: first.subject,
      inReplyTo: last.messageId,
      references: last.references,
      text,
    });
    if (write) await gm.createDraft(raw, thread.threadId);
    stats.brouillons++;
  };

  const propose = async (thread, family, analysis, previous) => {
    const horizon = new Date(now.getTime() + (cfg.horizonDays + 1) * 86400000);
    const busy = [...(await cal.busy(now, horizon)), ...reserved];
    const slots = proposeSlots({
      busy,
      now,
      horizonDays: cfg.horizonDays,
      minLeadHours: cfg.minLeadHours,
      windows: cfg.windows,
      durationMin: cfg.durationMin,
      weekdays: cfg.weekdays,
      count: 3,
      prefer: { weekdays: analysis.jours, moment: analysis.moment, dates: analysis.dates },
    });
    if (!slots.length) {
      log(
        `  aucun créneau libre dans les ${cfg.horizonDays} jours : pas de brouillon (${family.from.email})`,
      );
      return false;
    }
    let text = await writeProposal(ai, {
      request: family.text,
      analysis,
      signature: cfg.signature,
      address: addressOf(analysis.creche),
      previous,
    });
    const list = slots.map((s) => `• ${formatSlot(s.start, analysis.langue)}`).join("\n");
    text = text.includes("{{CRENEAUX}}")
      ? text.replace("{{CRENEAUX}}", list)
      : text.replace(cfg.signature, `${list}\n\n${cfg.signature}`);
    if (!text.includes(list)) text = `${text}\n\n${list}`;
    await draft(thread, family.from, text);
    reserved.push(...slots);
    return true;
  };

  for (const { id, threadId } of ids) {
    stats.lus++;
    try {
      const raw = await gm.getThread(threadId);
      const thread = Object.assign(threadTranscript(raw, mailbox), { threadId });
      const msg = thread.find((m) => m.id === id);
      const threadLabels = new Set((raw.messages ?? []).flatMap((m) => m.labelIds ?? []));
      const mark = async () => write && gm.modifyMessage(id, [L.analyse]);
      if (!msg || msg.ours || threadLabels.has(L.rdv)) {
        stats.ignores++;
        await mark();
        continue;
      }
      const family = thread.filter((m) => !m.ours);
      const sent = thread.filter((m) => m.ours);
      const lastSent = sent[sent.length - 1];

      if (threadLabels.has(L.proposee)) {
        // Réponse de la famille à nos créneaux (seulement si la réponse préparée a été envoyée, et sur son dernier message).
        if (!lastSent || msg.date <= lastSent.date || family[family.length - 1]?.id !== id) {
          stats.ignores++;
          await mark();
          continue;
        }
        const analysis = await analyzeRequest(ai, {
          from: `${family[0].from.name} <${family[0].from.email}>`,
          subject: family[0].subject,
          text: family[0].text,
          today,
          creches: crecheNames,
        });
        const rep = await analyzeReply(ai, { transcript: thread, today });
        const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(rep.creneau ?? "");
        if (rep.confirme && m) {
          const start = luxToDate(m[1], m[2]);
          const end = new Date(start.getTime() + cfg.durationMin * 60000);
          if (!slotMentioned(sent.map((s) => s.text).join("\n"), start)) {
            log(
              `  ${msg.from.email} : créneau « ${rep.creneau} » absent de nos propositions, à traiter à la main`,
            );
            stats.ignores++;
            await mark();
            continue;
          }
          const busy = await cal.busy(start, end);
          if (busy.length) {
            await propose(
              thread,
              msg,
              analysis,
              `Le créneau choisi par la famille (${formatSlot(start, "fr")}) n'est plus disponible : excuse-toi et propose d'autres créneaux.`,
            );
            await mark();
            continue;
          }
          const parent = analysis.parent_nom || msg.from.name || msg.from.email;
          if (write) {
            await cal.insertEvent({
              summary: `Visite crèche${analysis.creche ? ` ${analysis.creche}` : ""} – ${parent}`,
              location: addressOf(analysis.creche) || analysis.creche || undefined,
              description: [
                `Famille : ${parent} <${msg.from.email}>`,
                analysis.telephone ? `Téléphone : ${analysis.telephone}` : null,
                analysis.enfant ? `Enfant : ${analysis.enfant}` : null,
                rep.remarque ? `Remarque : ${rep.remarque}` : null,
                `Demande : ${analysis.resume}`,
                `E-mails : https://mail.google.com/mail/u/?authuser=${encodeURIComponent(cfg.mailbox)}#all/${threadId}`,
              ]
                .filter(Boolean)
                .join("\n"),
              start: { dateTime: start.toISOString(), timeZone: "Europe/Luxembourg" },
              end: { dateTime: end.toISOString(), timeZone: "Europe/Luxembourg" },
            });
            await gm.modifyThread(threadId, [L.rdv]);
          }
          stats.rdv++;
          const text = await writeConfirmation(ai, {
            lang: analysis.langue,
            parent,
            slot: formatSlot(start, analysis.langue),
            creche: analysis.creche,
            address: addressOf(analysis.creche),
            signature: cfg.signature,
          });
          await draft(thread, msg.from, text);
          log(`  RDV ajouté : ${formatSlot(start, "fr")} — ${parent}`);
        } else if (rep.autres_creneaux) {
          await propose(
            thread,
            msg,
            analysis,
            "Aucun des créneaux proposés ne convenait à la famille : propose-en d'autres.",
          );
        } else {
          stats.ignores++;
        }
        await mark();
        continue;
      }

      const analysis = await analyzeRequest(ai, {
        from: `${msg.from.name} <${msg.from.email}>`,
        subject: msg.subject,
        text: msg.text,
        today,
        creches: crecheNames,
      });
      if (analysis.visite) {
        stats.demandes++;
        if (await propose(thread, msg, analysis)) {
          if (write) await gm.modifyThread(threadId, [L.proposee]);
          log(`  demande de visite : ${msg.from.email} — brouillon préparé`);
        }
      }
      await mark();
    } catch (e) {
      stats.erreurs++;
      log(`  erreur sur le message ${id} : ${e.message}`);
    }
  }
  return stats;
}
