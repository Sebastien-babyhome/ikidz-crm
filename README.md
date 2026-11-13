# iKIDZ CRM

Outil de suivi des familles du réseau Babyhome (demandes, visites, liste d'attente,
inscriptions), réservé à l'administration et à la direction, connecté à iKIDZ par la même
base Supabase.

```bash
npm ci
npm run dev     # http://localhost:8080
```

Consignes et déploiement : voir `CLAUDE.md`.

## Demandes de visite de crèche (tâche quotidienne)

Chaque matin (`clevercloud/cron.json`, 06:40 UTC), `scripts/visites-creche.mjs` lit les e-mails reçus sur
**contact@babyhome.lu** (7 derniers jours, pas encore analysés) :

1. **Demande de visite** (repérée par Claude, dans n'importe quelle langue) : un **brouillon** de réponse est créé
   dans le fil, dans la langue de la famille, avec **trois créneaux libres** de l'agenda de
   **kaleli.elhoufia@babyhome.lu** (plages et jours réglables, jours fériés exclus, préférences de la famille
   prises en compte, pas deux familles sur le même créneau dans un passage). Rien n'est envoyé : relire puis
   envoyer depuis Gmail. Libellé du fil : « Visites crèche/Réponse préparée ».
2. **Réponse de la famille** à l'e-mail envoyé : si elle choisit l'un des créneaux proposés (vérifié dans nos
   e-mails), le rendez-vous est **ajouté à l'agenda** (titre, crèche et adresse, coordonnées, lien vers le fil ;
   aucune invitation envoyée) et un brouillon de confirmation est préparé ; libellé « Visites crèche/RDV dans
   l'agenda ». Créneau pris entre-temps ou aucun ne convient : nouveau brouillon avec d'autres créneaux. Autre
   réponse : laissée à traiter à la main.

Chaque message lu reçoit le libellé `Visites-creche/Analyse` (retirer ce libellé fait relire le message).

**Mise en service**

1. Google Cloud : créer un compte de service, activer les API Gmail et Google Calendar, créer une clé JSON.
2. Console d'administration Google Workspace › Sécurité › Contrôle des API › **Délégation au niveau du
   domaine** : ajouter l'ID client du compte de service avec les champs d'application
   `https://www.googleapis.com/auth/gmail.modify,https://www.googleapis.com/auth/gmail.compose,https://www.googleapis.com/auth/calendar`.
3. Clever Cloud (application « ikidz-crm ») : `GOOGLE_SERVICE_ACCOUNT_JSON`, `ANTHROPIC_API_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (facultatif : adresses des crèches), réglages `VISITES_*` (voir `.env.example`).
4. Essai sans rien écrire : `VISITES_DRY_RUN=1 npm run visites` (journal des demandes repérées) ; puis
   `VISITES_ACTIF=1`.

Tests : `npm test` (créneaux, e-mails, scénarios complets avec Gmail, Agenda et IA simulés).
