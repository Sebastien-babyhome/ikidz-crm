#! /bin/bash -l
# Demandes de visite de crèche (tous les jours à 06:40 UTC, soit 07:40 en hiver / 08:40 en été à Luxembourg) :
# voir scripts/visites-creche.mjs. Seule l'instance 0 travaille.
if [ "${INSTANCE_NUMBER:-0}" != "0" ]; then exit 0; fi
cd "$ROOT" && node scripts/visites-creche.mjs
