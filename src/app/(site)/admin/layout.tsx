import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";

/**
 * Gedeelde shell voor /admin/*. Handhaaft alleen "moet ingelogd zijn" —
 * de fijnmazige autorisatie (admin-only vs. admin-of-community-beheerder)
 * blijft per pagina, omdat /admin/community/[slug] ook toegankelijk is
 * voor community-beheerders die geen globale admin zijn. De navigatie
 * hieronder toont daarom alleen de globale admin-tools, en alleen aan
 * echte admins — dit is bewust een lichte basis, geen volledig
 * admin-dashboard (dat volgt later).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profiel?.role === "admin";

  return (
    <div>
      {isAdmin && (
        <nav className="flex items-center gap-5 px-6 py-3 border-b border-lijn bg-white">
          <span className="text-body-xs font-semibold uppercase tracking-wider text-warmgrijs">Admin</span>
          <Link href="/admin" className="text-body-sm font-medium text-warmzwart hover:text-terracotta">
            Cijfers
          </Link>
          <Link href="/admin/bewoners" className="text-body-sm font-medium text-warmzwart hover:text-terracotta">
            Bewoners
          </Link>
          <Link href="/admin/vakmensen" className="text-body-sm font-medium text-warmzwart hover:text-terracotta">
            Vakmensen
          </Link>
          <Link href="/admin/categorieen" className="text-body-sm font-medium text-warmzwart hover:text-terracotta">
            Categorieën
          </Link>
          <Link href="/admin/auth-fotos" className="text-body-sm font-medium text-warmzwart hover:text-terracotta">
            Login-foto's
          </Link>
        </nav>
      )}
      {children}
    </div>
  );
}
