export const metadata = { title: "Neighbuur — Design Explorations", robots: { index: false, follow: false } };

/**
 * Volledig geïsoleerd van de productie-site: geen Nav/Footer, geen
 * gedeelde homepage-componenten. Alleen de root layout (LangProvider/
 * AuthProvider/ToastProvider + globals.css) blijft eromheen, want Next.js
 * vereist precies één root layout — dat raakt geen bestaande pagina.
 */
export default function DesignExplorationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-[999] bg-warmzwart text-white text-center text-[12px] font-semibold tracking-wide py-1.5">
        PROTOTYPE — design exploration, geen onderdeel van de productie-site
      </div>
      {children}
    </div>
  );
}
