import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Centrale bewaking van alle private app-routes — de bestaande
  // per-pagina auth.getUser()+redirect()-checks blijven ook staan
  // (defense-in-depth), maar dit dekt ze allemaal op één plek i.p.v.
  // per-pagina, en stuurt naar "/" i.p.v. "/login" (de nieuwe
  // provider-homepage is nu het publieke startpunt).
  const PRIVATE_PREFIXES = ["/profiel", "/dashboard", "/berichten", "/notificaties", "/plan", "/admin"];
  const { pathname } = request.nextUrl;
  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isPrivate && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Tijdelijke schakelaar: /diensten en /zoeken zijn nog niet publiek
  // bedoeld zolang het platform nog onvoldoende gevuld is met
  // vakmensen. Standaard uit (geen env-var gezet) — zet SEARCH_LIVE=true
  // zodra dat wel zo is. Geldt voor iedereen, ook admins, bewust geen
  // bypass — het is geen beveiligingsmaatregel maar een launch-fase.
  const SEARCH_PREFIXES = ["/diensten", "/zoeken"];
  const isSearchRoute = SEARCH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isSearchRoute && process.env.SEARCH_LIVE !== "true") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
