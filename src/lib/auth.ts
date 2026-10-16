import { queryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Me = {
  userId: string;
  email: string | null;
  fullName: string;
  roles: string[];
  isAdmin: boolean;
  /** Direction d'une crèche : droits d'administration limités à sa structure. */
  isDirector: boolean;
  isEducator: boolean;
  /** Personnel : administrateur, direction ou éducateur. */
  isStaff: boolean;
  /** Accès à l'administration : administrateur (tout le réseau) ou direction (sa crèche). */
  canManage: boolean;
  isParent: boolean;
  crecheIds: string[];
};

export const meQueryOptions = queryOptions({
  queryKey: ["me"],
  queryFn: async (): Promise<Me | null> => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return null;

    const [profileRes, rolesRes, staffRes] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("staff_assignments").select("creche_id").eq("user_id", user.id),
    ]);

    const roles = (rolesRes.data ?? []).map((r) => r.role as string);
    return {
      userId: user.id,
      email: profileRes.data?.email ?? user.email ?? null,
      fullName: profileRes.data?.full_name || (user.email ?? ""),
      roles,
      isAdmin: roles.includes("admin"),
      isDirector: roles.includes("director"),
      isEducator: roles.includes("educator"),
      isStaff: roles.some((r) => r === "admin" || r === "director" || r === "educator"),
      canManage: roles.includes("admin") || roles.includes("director"),
      isParent: roles.includes("parent"),
      crecheIds: (staffRes.data ?? []).map((s) => s.creche_id as string),
    };
  },
});

export function useMe() {
  return useQuery(meQueryOptions);
}

export function roleLabel(me: Me | null | undefined) {
  if (!me) return "";
  if (me.isAdmin) return "Administrateur";
  if (me.isDirector) return "Direction";
  if (me.isEducator) return "Éducateur";
  if (me.isParent) return "Parent";
  return "Sans rôle";
}
