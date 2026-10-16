import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, LogOut } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import ikidzLogoBlanc from "@/assets/ikidz-logo-blanc.png";
import { Button } from "@/components/ui/button";
import { roleLabel, useMe } from "@/lib/auth";
import { IKIDZ_URL } from "@/lib/links";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

const LINKS = [{ to: "/tableau-de-bord", label: "Tableau de bord" }] as const;

/** Mise en page : réservée à l'administration et à la direction (mêmes rôles qu'iKIDZ). */
function AuthenticatedLayout() {
  const { data: me, isLoading } = useMe();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-[oklch(0.45_0.055_215)] text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/tableau-de-bord" className="flex items-center gap-2">
            <img src={ikidzLogoBlanc} alt="iKIDZ" className="h-9 w-auto" />
            <span className="font-hand text-xl">CRM</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/15 hover:text-white"
                activeProps={{ className: "bg-white/20 text-white" }}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={IKIDZ_URL}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/15 hover:text-white"
            >
              iKIDZ <ExternalLink className="size-3.5" />
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{me?.fullName}</p>
              <p className="text-xs text-white/70">{roleLabel(me)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              aria-label="Se déconnecter"
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {isLoading ? null : me?.canManage ? (
          <Outlet />
        ) : (
          <div className="mx-auto max-w-md rounded-2xl bg-card p-6 text-center shadow-sm ring-1 ring-border">
            <p className="font-semibold">Accès réservé</p>
            <p className="mt-2 text-sm text-muted-foreground">
              iKIDZ CRM est réservé à l'administration et à la direction des structures.
            </p>
            <Button asChild className="mt-4">
              <a href={IKIDZ_URL}>Aller sur iKIDZ</a>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
