// Sur Clever Cloud, le serveur Node ne relit pas le fichier .env :
// si SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY manquent à l'exécution, on reprend
// les valeurs publiques VITE_* intégrées au build. Uniquement des valeurs publiques
// (URL + clé publishable) — jamais de clé secrète ici.
export function ensureServerEnv(): void {
  if (typeof process === "undefined" || !process.env) return;
  const env = process.env;
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;
  if (!env["SUPABASE_URL"] && url) env["SUPABASE_URL"] = url;
  if (!env["SUPABASE_PUBLISHABLE_KEY"] && key) env["SUPABASE_PUBLISHABLE_KEY"] = key;
}
