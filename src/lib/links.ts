// Adresse d'iKIDZ pour les liens croisés (fiche d'un enfant, planning…). Valeur publique,
// réglable au build par VITE_IKIDZ_URL.
export const IKIDZ_URL = (import.meta.env["VITE_IKIDZ_URL"] as string | undefined) ?? "https://ikidz-app.com";
