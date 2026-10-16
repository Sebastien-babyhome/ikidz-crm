import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, ExternalLink } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IKIDZ_URL } from "@/lib/links";

export const Route = createFileRoute("/_authenticated/tableau-de-bord")({
  head: () => ({ meta: [{ title: "Tableau de bord — iKIDZ CRM" }] }),
  component: Dashboard,
});

/** Année scolaire (septembre → août) en cours. */
const schoolYear = () => {
  const d = new Date();
  return d.getMonth() + 1 >= 9 ? d.getFullYear() : d.getFullYear() - 1;
};

/**
 * Vue d'ensemble par structure, lue directement dans la base iKIDZ (règles d'accès d'iKIDZ :
 * l'administration voit tout le réseau, la direction sa structure).
 */
function Dashboard() {
  const year = schoolYear();
  const q = useQuery({
    queryKey: ["crm-overview", year],
    queryFn: async () => {
      const [creches, kids, plans, contracts] = await Promise.all([
        supabase.from("creches").select("id, name").order("name"),
        supabase.from("children").select("id, creche_id").eq("active", true),
        supabase
          .from("planning_templates")
          .select("child_id, validated_at")
          .eq("school_year", year)
          .not("validated_at", "is", null),
        supabase.from("enrollment_contracts").select("child_id, status"),
      ]);
      for (const r of [creches, kids, plans, contracts]) if (r.error) throw r.error;
      const crecheOf = new Map((kids.data ?? []).map((k) => [k.id, k.creche_id]));
      const count = (rows: { child_id: string }[], id: string) =>
        rows.filter((r) => crecheOf.get(r.child_id) === id).length;
      return (creches.data ?? []).map((c) => ({
        ...c,
        children: (kids.data ?? []).filter((k) => k.creche_id === c.id).length,
        plannings: count(plans.data ?? [], c.id),
        contracts: count(
          (contracts.data ?? []).filter((x) => ["signed", "validated"].includes(x.status)),
          c.id,
        ),
      }));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-hand text-3xl text-primary">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Données partagées avec iKIDZ, année scolaire {year}-{year + 1}. Les rubriques du CRM
          (demandes, visites, liste d'attente, inscriptions) viendront ici.
        </p>
      </div>
      {q.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : q.error ? (
        <p className="text-sm text-destructive">Lecture impossible : {(q.error as Error).message}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(q.data ?? []).map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="size-4 text-primary" /> {c.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <dt className="text-xs text-muted-foreground">Enfants</dt>
                    <dd className="text-2xl font-semibold">{c.children}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Plannings validés</dt>
                    <dd className="text-2xl font-semibold">{c.plannings}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Contrats signés</dt>
                    <dd className="text-2xl font-semibold">{c.contracts}</dd>
                  </div>
                </dl>
                <a
                  href={`${IKIDZ_URL}/planning`}
                  className="flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                >
                  Voir le planning dans iKIDZ <ExternalLink className="size-3" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
