# Feuille de route — iKIDZ CRM

- [x] Socle : connexion avec les identifiants iKIDZ, accès administration et direction,
      tableau de bord par structure (enfants, plannings validés, contrats signés) lu dans la base iKIDZ.
- [ ] Mise en ligne : application Clever Cloud « ikidz-crm », domaine crm.ikidz-app.com (OVH),
      redirect URL dans Supabase.
- [ ] Rubriques du CRM à définir : demandes, visites, liste d'attente, inscriptions
      (tables `crm_` par migration dans iKIDZ).
- [x] Demandes de visite (13/11/2026) : lecture quotidienne de contact@babyhome.lu, brouillon de réponse
      avec les créneaux libres de l'agenda de Kaleli EL HOUFIA, rendez-vous ajouté à l'agenda quand la famille
      confirme (`scripts/visites-creche.mjs`). À mettre en service : compte de service Google, clé API Claude.
- [ ] Inscription validée → création de l'enfant et des parents dans iKIDZ.
