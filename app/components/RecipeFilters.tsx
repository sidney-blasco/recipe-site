"use client";

import { usePathname, useRouter } from "next/navigation";
import type { FilterGroup, FilterGroupKey, SelectedFilters } from "../lib/filters";
import { buildFilterHref } from "../lib/filters";

type RecipeFiltersProps = {
  groups: FilterGroup[];
  selected: SelectedFilters;
  activeCount: number;
  ingredient: string | null;
};

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-plum/60 transition-transform group-open:rotate-180"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function RecipeFilters({ groups, selected, activeCount, ingredient }: RecipeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  function toggleValue(key: FilterGroupKey, value: string) {
    const current = selected[key];
    const next: SelectedFilters = {
      ...selected,
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    };
    router.push(buildFilterHref(pathname, next, ingredient), { scroll: false });
  }

  function reset() {
    router.push(pathname, { scroll: false });
  }

  function renderGroups() {
    return (
      <div className="flex flex-col gap-1">
        {groups.map((group) => (
          <details
            key={group.key}
            open
            className="group border-b border-plum/10 py-4 first:pt-0 last:border-0 last:pb-0"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-wide text-plum">
              {group.label}
              <ChevronIcon />
            </summary>
            <div className="mt-3 flex flex-col gap-2.5">
              {group.options.length === 0 ? (
                <p className="text-xs text-ink/50">Nothing tagged yet</p>
              ) : (
                group.options.map((option) => {
                  const checked = selected[group.key].includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center justify-between gap-2 text-sm text-ink/80 hover:text-plum"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleValue(group.key, option.value)}
                          className="h-4 w-4 rounded border-plum/40 text-plum accent-plum focus:ring-plum"
                        />
                        {option.label}
                      </span>
                      <span className="text-xs text-ink/40">{option.count}</span>
                    </label>
                  );
                })
              )}
            </div>
          </details>
        ))}
      </div>
    );
  }

  return (
    <aside className="mb-8 lg:mb-0 lg:w-64 lg:shrink-0">
      {/* Mobile / tablet: filters collapse into a single dropdown menu */}
      <details className="rounded-2xl border border-plum/15 bg-white/60 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-5 py-4 font-display text-lg text-plum">
          <span>Filters{activeCount > 0 ? ` (${activeCount})` : ""}</span>
          <ChevronIcon />
        </summary>
        <div className="border-t border-plum/10 px-5 pb-5 pt-1">
          {renderGroups()}
          <button
            type="button"
            onClick={reset}
            className="mt-4 w-full rounded-full border border-plum/30 py-2 text-sm font-semibold text-plum transition-colors hover:bg-lavender"
          >
            Reset Filters
          </button>
        </div>
      </details>

      {/* Desktop: persistent sidebar */}
      <div className="hidden lg:sticky lg:top-8 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-plum">Filters</h2>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-plum/30 px-3 py-1 text-xs font-semibold text-plum transition-colors hover:bg-lavender"
          >
            Reset Filters
          </button>
        </div>
        {renderGroups()}
      </div>
    </aside>
  );
}
