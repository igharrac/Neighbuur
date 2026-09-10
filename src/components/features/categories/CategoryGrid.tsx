import { CategoryTile } from "./CategoryTile";
import type { Categorie } from "@/types";

export function CategoryGrid({ categorieen }: { categorieen: Categorie[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
      {categorieen.map((categorie) => (
        <CategoryTile key={categorie.id} categorie={categorie} />
      ))}
    </div>
  );
}
