import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import ikidzLogo from "@/assets/ikidz-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Connexion — iKIDZ CRM" }] }),
  component: AuthPage,
});

/** Connexion avec les identifiants iKIDZ (même annuaire d'utilisateurs). */
function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error("E-mail ou mot de passe incorrect.");
      return;
    }
    navigate({ to: "/tableau-de-bord", replace: true });
  }

  async function forgot() {
    if (!email.trim()) {
      toast.error("Saisissez d'abord votre e-mail.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Un e-mail vous a été envoyé pour choisir un nouveau mot de passe.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={signIn}
        className="w-full max-w-sm space-y-5 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <img src={ikidzLogo} alt="iKIDZ" className="h-12 w-auto" />
          <p className="font-hand text-xl text-primary">CRM</p>
          <p className="text-sm text-muted-foreground">
            Connectez-vous avec vos identifiants iKIDZ (administration ou direction).
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </Button>
        <button
          type="button"
          onClick={forgot}
          className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Mot de passe oublié
        </button>
      </form>
    </div>
  );
}
