import { getCategorieen } from "@/lib/categorieen";
import { DienstenGrid } from "@/components/features/categories/DienstenGrid";

export default async function DienstenPage() {
  const alleCategorieen = await getCategorieen();
  const categories = alleCategorieen.filter((c) => c.type === "professional" || c.type === "compare");

  return (
    <div className="bg-cream-warm min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="max-w-[640px] mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffdbcf] px-4 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#a73400]" />
            <span className="font-body font-semibold text-[12px] tracking-[0.6px] uppercase text-[#390c00]">
              Diensten
            </span>
          </span>
          <h1 className="font-display font-bold text-[38px] sm:text-[48px] leading-[44px] sm:leading-[54px] text-warmzwart mb-3">
            Wat wil je{" "}
            <span className="italic text-terracotta [text-decoration-line:underline] [text-decoration-style:wavy] [text-decoration-color:#ffdbcf] [text-underline-position:from-font]">
              laten doen
            </span>
            ?
          </h1>
          <p className="font-body text-[16px] leading-[24px] text-warmgrijs-dark">
            Van stucwerk tot zonnepanelen — kies de dienst die je nodig hebt en vind direct betrouwbare vakmensen uit
            jouw buurt.
          </p>
        </div>

        <DienstenGrid categories={categories} />
      </div>
    </div>
  );
}
