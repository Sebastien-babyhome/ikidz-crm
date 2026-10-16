# iKIDZ CRM — consignes pour Claude

Outil de suivi des familles du réseau de crèches Montessori de BabyHome (demandes, visites,
liste d'attente, inscriptions), réservé à l'administration et à la direction.
Production prévue : https://crm.ikidz-app.com. Application sœur : iKIDZ
(dépôt Sebastien-babyhome/connect-creche, https://ikidz-app.com).

Les règles d'architecture sont dans AGENTS.md :

@AGENTS.md

## Pile technique

- Même socle qu'iKIDZ : TanStack Start (React 19, SSR) + Vite + Tailwind 4 + shadcn/ui,
  preset Nitro node-server.
- Base, authentification et stockage : **le même projet Supabase qu'iKIDZ** (région UE).
  Navigateur et rendu serveur utilisent la clé publishable et la session de l'utilisateur
  (RLS). La clé secrète `SUPABASE_SERVICE_ROLE_KEY` n'est lue que côté serveur.
- Variables d'environnement : voir `.env.example`.

## Commandes

```bash
npm ci          # installer exactement les versions du package-lock.json
npm run dev     # serveur de développement (port 8080)
npm run build   # build production (.output/)
npm run start   # lance .output/server/index.mjs
npm run lint
npx tsc --noEmit
```

## Déploiement

Hébergement Clever Cloud (application Node « ikidz-crm », `npm run start`), domaine
crm.ikidz-app.com (CNAME OVH vers domain.par.clever-cloud.com.). Après fusion sur `main`,
faire « RE-BUILD AND RESTART » dans la console Clever Cloud.

## Règles de travail

- Ne jamais réécrire l'historique publié (pas de force push, pas de rebase/amend de commits
  poussés). Travailler sur une branche et passer par une pull request ; `main` doit toujours
  construire.
- **Base partagée** : aucune migration dans ce dépôt. Toute table ou colonne (préfixe `crm_`
  pour les tables du CRM, RLS activée) passe par une migration du dépôt iKIDZ
  (`supabase/migrations/`), puis `src/integrations/supabase/types.ts` est recopié ici.
- Ne pas modifier la structure des tables d'iKIDZ depuis le CRM.
- Ne pas modifier à la main `src/routeTree.gen.ts` (généré au build).
- Interface et textes en français.
- Ne jamais committer de secret : `.env` ne contient que des valeurs publiques.
- Tenir `roadmap.md` à jour.
