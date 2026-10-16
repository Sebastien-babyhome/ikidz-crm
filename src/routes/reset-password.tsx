import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import ikidzLogo from "@/assets/ikidz-logo.png";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — iKIDZ" },
      {
        name: "description",
        content: "Définissez un nouveau mot de passe pour accéder à votre espace structure.",
      },
      { property: "og:title", content: "Nouveau mot de passe — iKIDZ" },
      { property: "og:description", content: "Réinitialisation du mot de passe de votre compte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [linkValid, setLinkValid] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setLinkValid(Boolean(data.session));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setLinkValid(Boolean(session));
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("8 caractères minimum.");
      return;
    }
    if (password !== confirmation) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSaved(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex justify-center">
          <img src={ikidzLogo} alt={"Logo iKIDZ"} width={1600} height={520} className="h-12 w-auto" />
        </Link>
        {saved ? (
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <CheckCircle2 className="mx-auto size-12 text-primary" aria-hidden="true" />
            <div>
              <h1 className="text-2xl">{"Mot de passe enregistré"}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {"Votre mot de passe est bien enregistré. Vous pouvez maintenant accéder à votre espace iKIDZ."}</p>
            </div>
            <Button className="w-full" onClick={() => navigate({ to: "/tableau-de-bord" })}>
              {"Accéder à mon espace"}</Button>
          </div>
        ) : linkValid === false ? (
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <KeyRound className="mx-auto size-12 text-primary" aria-hidden="true" />
            <div>
              <h1 className="text-2xl">{"Lien invalide ou expiré"}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {"Demandez une nouvelle invitation à votre structure ou utilisez « Mot de passe oublié »."}</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">{"Retour à la connexion"}</Link>
            </Button>
          </div>
        ) : (
      <form onSubmit={submit} className="w-full space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl">{"Choisissez votre mot de passe"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{"Saisissez-le une seconde fois pour le confirmer."}</p>
        </div>
        <Alert>
          <KeyRound className="size-4" />
          <AlertTitle>{"Votre accès iKIDZ"}</AlertTitle>
          <AlertDescription>{"Le mot de passe doit contenir au moins 8 caractères."}</AlertDescription>
        </Alert>
        <div className="space-y-1.5">
          <Label htmlFor="pwd">{"Nouveau mot de passe"}</Label>
          <Input
            id="pwd"
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pwd-confirm">{"Confirmer le mot de passe"}</Label>
          <Input
            id="pwd-confirm"
            type="password"
            value={confirmation}
            autoComplete="new-password"
            onChange={(e) => setConfirmation(e.target.value)}
            minLength={8}
            aria-invalid={confirmation.length > 0 && confirmation !== password}
            required
          />
          {confirmation.length > 0 && confirmation !== password ? (
            <p className="text-sm text-destructive">{"Les mots de passe ne correspondent pas."}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enregistrement…" : "Enregistrer mon mot de passe"}
        </Button>
      </form>
        )}
      </div>
    </div>
  );
}
