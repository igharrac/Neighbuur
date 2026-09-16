"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  House,
  List,
  X,
  MagnifyingGlass,
  ChatCircle,
  UserCircle,
  SignIn,
} from "@phosphor-icons/react";
import { useLang } from "@/lib/hooks/useLang";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOngelezenBerichten } from "@/lib/hooks/useOngelezenBerichten";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificatieBadge } from "@/components/features/notifications/NotificatieBadge";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 no-underline">
      <span className="w-8 h-8 bg-terracotta rounded-lg flex items-center justify-center text-white">
        <House weight="fill" size={18} />
      </span>
      <span className="font-display font-black text-[22px] text-warmzwart tracking-tight">
        Neigh<span className="text-terracotta">buur</span>
      </span>
    </Link>
  );
}

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { dict } = useLang();
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/85 backdrop-blur-xl border-b border-lijn">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
        <Logo />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {user && (
            <Link href="/plan" className="text-body-sm font-medium text-warmgrijs hover:text-warmzwart transition-colors">
              {dict.nav.myPlan}
            </Link>
          )}
          <Link href="/wijk" className="text-body-sm font-medium text-warmgrijs hover:text-warmzwart transition-colors">
            {dict.nav.myNeighbourhood}
          </Link>
          <Link href="/diensten" className="text-body-sm font-medium text-warmgrijs hover:text-warmzwart transition-colors">
            {dict.nav.services}
          </Link>
          <LanguageToggle />
          {user ? (
            <>
              <NotificatieBadge />
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/registreer/vakman" className="btn-secondary !px-5 !py-2.5 !text-body-sm">
                {dict.nav.registerPro}
              </Link>
              <Link href="/login" className="btn-dark">
                {dict.nav.login}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {user && <NotificatieBadge />}
          <LanguageToggle />
          <button
            className="min-w-11 min-h-11 -mr-1.5 flex items-center justify-center text-warmgrijs hover:text-warmzwart"
            aria-label={menuOpen ? "Sluit menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-cream border-b border-lijn px-6 py-4 animate-fade-in">
          <div className="flex flex-col gap-3">
            {user && (
              <Link href="/plan" className="py-2 text-body font-medium text-warmzwart" onClick={() => setMenuOpen(false)}>
                {dict.nav.myPlan}
              </Link>
            )}
            <Link href="/wijk" className="py-2 text-body font-medium text-warmzwart" onClick={() => setMenuOpen(false)}>
              {dict.nav.myNeighbourhood}
            </Link>
            <Link href="/diensten" className="py-2 text-body font-medium text-warmzwart" onClick={() => setMenuOpen(false)}>
              {dict.nav.services}
            </Link>
            {user ? (
              <>
                <Link href="/profiel" className="py-2 text-body font-medium text-warmzwart" onClick={() => setMenuOpen(false)}>
                  Instellingen
                </Link>
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await signOut();
                    router.push("/");
                  }}
                  className="py-2 text-body font-medium text-terracotta text-left"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/registreer/vakman"
                  className="btn-secondary text-center mt-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {dict.nav.registerPro}
                </Link>
                <Link href="/login" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>
                  {dict.nav.login}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export function MobileBar() {
  const { dict } = useLang();
  const pathname = usePathname();
  const { user } = useAuth();
  const ongelezenBerichten = useOngelezenBerichten();

  const items = user
    ? [
        { href: "/plan", icon: House, label: dict.nav.myPlan },
        { href: "/wijk", icon: UserCircle, label: dict.nav.myNeighbourhood },
        { href: "/zoeken", icon: MagnifyingGlass, label: "Zoeken" },
        { href: "/berichten", icon: ChatCircle, label: "Berichten", badge: ongelezenBerichten },
        { href: "/profiel", icon: UserCircle, label: "Profiel" },
      ]
    : [
        { href: "/wijk", icon: UserCircle, label: dict.nav.myNeighbourhood },
        { href: "/diensten", icon: House, label: dict.nav.services },
        { href: "/zoeken", icon: MagnifyingGlass, label: "Zoeken" },
        { href: "/login", icon: SignIn, label: dict.nav.login },
      ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-lijn z-50 px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="flex justify-around">
        {items.map((item) => {
          const active = item.href !== "#" && (pathname === item.href || pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`min-h-11 min-w-11 flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-body-xs font-semibold transition-colors ${
                active ? "text-terracotta" : "text-warmgrijs"
              }`}
            >
              <span className="relative">
                <item.icon size={22} weight={active ? "fill" : "regular"} />
                {!!item.badge && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Footer() {
  const { dict } = useLang();

  return (
    <footer className="text-center py-10 px-6 border-t border-lijn">
      <div className="flex justify-center mb-3">
        <Logo />
      </div>
      <p className="text-body-sm text-warmgrijs">
        {dict.footer.tagline}{" "}
        <Link href="#" className="text-terracotta hover:underline">{dict.footer.about}</Link>
        {" · "}
        <Link href="#" className="text-terracotta hover:underline">{dict.footer.forPros}</Link>
        {" · "}
        <Link href="#" className="text-terracotta hover:underline">{dict.footer.contact}</Link>
        {" · "}
        <Link href="/voorwaarden/bewoner" className="text-terracotta hover:underline">{dict.footer.terms}</Link>
        {" · "}
        <Link href="/privacy" className="text-terracotta hover:underline">{dict.footer.privacy}</Link>
      </p>
      <p className="text-body-xs text-warmgrijs-light mt-2">
        © {new Date().getFullYear()} Neighbuur
      </p>
    </footer>
  );
}
