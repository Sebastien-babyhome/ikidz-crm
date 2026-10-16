import { createFileRoute, redirect } from "@tanstack/react-router";

// Pas de page publique : l'outil est réservé à l'administration et à la direction.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/tableau-de-bord" });
  },
});
