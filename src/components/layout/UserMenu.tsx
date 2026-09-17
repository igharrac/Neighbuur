"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CaretDown, House, UsersThree, Gear, SignOut, Briefcase, Gauge } from "@phosphor-icons/react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLang } from "@/lib/hooks/useLang";
import { Avatar } from "@/components/ui/Avatar";

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const { dict } = useLang();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  async function handleLogout() {
    setOpen(false);
    await signOut();
    router.push("/");
  }

  const naam = profile?.name ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pr-1"
        aria-expanded={open}
      >
        <Avatar naam={naam} src={profile?.avatar_url} size="sm" />
        <span className="hidden lg:inline text-body-sm font-medium text-warmzwart max-w-[120px] truncate">
          {naam}
        </span>
        <CaretDown size={13} weight="bold" className={`text-warmgrijs transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-strong border border-lijn overflow-hidden animate-fade-in z-50">
          <div className="px-4 py-3 border-b border-lijn">
            <p className="font-semibold text-body-sm text-warmzwart truncate">{naam}</p>
          </div>
          <div className="py-1.5">
            {profile?.role === "admin" ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-warmzwart hover:bg-cream transition-colors no-underline"
              >
                <Gauge size={17} className="text-warmgrijs" />
                Admin
              </Link>
            ) : profile?.role === "professional" ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-warmzwart hover:bg-cream transition-colors no-underline"
              >
                <Briefcase size={17} className="text-warmgrijs" />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/plan"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-warmzwart hover:bg-cream transition-colors no-underline"
              >
                <House size={17} className="text-warmgrijs" />
                {dict.nav.myPlan}
              </Link>
            )}
            <Link
              href="/wijk"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-warmzwart hover:bg-cream transition-colors no-underline"
            >
              <UsersThree size={17} className="text-warmgrijs" />
              {dict.nav.myNeighbourhood}
            </Link>
            <Link
              href="/profiel"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-warmzwart hover:bg-cream transition-colors no-underline"
            >
              <Gear size={17} className="text-warmgrijs" />
              Instellingen
            </Link>
          </div>
          <div className="border-t border-lijn py-1.5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-sage font-medium hover:bg-sage-50 transition-colors w-full text-left"
            >
              <SignOut size={17} />
              Uitloggen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
