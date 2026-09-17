"use client";

interface CategoryOption {
  id: string;
  name_nl: string;
}

interface CategoryMultiSelectProps {
  categories: CategoryOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  max: number;
  /** Template string with {count} and {max} placeholders, e.g. "{count} of {max} selected". */
  countLabelTemplate: string;
}

export function CategoryMultiSelect({ categories, selectedIds, onChange, max, countLabelTemplate }: CategoryMultiSelectProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else if (selectedIds.length < max) {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const isSelected = selectedIds.includes(c.id);
          const isDisabled = !isSelected && selectedIds.length >= max;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={`px-3.5 py-2 rounded-full text-body-sm font-medium border transition-colors ${
                isSelected
                  ? "bg-sage text-white border-sage"
                  : isDisabled
                    ? "bg-cream text-warmgrijs/50 border-lijn cursor-not-allowed"
                    : "bg-white text-warmzwart border-lijn hover:border-sage"
              }`}
            >
              {c.name_nl}
            </button>
          );
        })}
      </div>
      <p className="text-body-xs text-warmgrijs mt-2">
        {countLabelTemplate.replace("{count}", String(selectedIds.length)).replace("{max}", String(max))}
      </p>
    </div>
  );
}
