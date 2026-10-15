"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { FilterGroup, FilterGroupKey, SelectedFilters } from "../lib/filters";
import { buildFilterHref } from "../lib/filters";
import CheckBox from "./CheckBox";

type RecipeFiltersProps = {
  groups: FilterGroup[];
  selected: SelectedFilters;
  activeCount: number;
};

const DEFAULT_OPEN_GROUPS = new Set<FilterGroupKey>(["cuisine", "type"]);

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-ink-faded group-open:rotate-180"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function RecipeFilters({ groups, selected, activeCount }: RecipeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQueries, setSearchQueries] = useState<Partial<Record<FilterGroupKey, string>>>({});

  function toggleValue(key: FilterGroupKey, value: string) {
    const current = selected[key];
    const next: SelectedFilters = {
      ...selected,
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    };
    router.push(buildFilterHref(pathname, next), { scroll: false });
  }

  function reset() {
    router.push(pathname, { scroll: false });
  }

  function renderGroups() {
    return (
      <div className="flex flex-col">
        {groups.map((group) => {
          const query = (searchQueries[group.key] ?? "").trim().toLowerCase();
          const visibleOptions = query
            ? group.options.filter((option) => option.label.toLowerCase().includes(query))
            : group.options;

          return (
            <details
              key={group.key}
              open={DEFAULT_OPEN_GROUPS.has(group.key)}
              className="group dotted-rule py-4 first:pt-0 last:bg-none last:pb-0"
            >
              <summary className="sc flex cursor-pointer list-none items-center justify-between text-[1.05rem] text-ink">
                {group.label}
                <ChevronIcon />
              </summary>
              <div className="mt-3 flex flex-col gap-2.5">
                {group.searchable && group.options.length > 0 && (
                  <input
                    type="text"
                    value={searchQueries[group.key] ?? ""}
                    onChange={(event) =>
                      setSearchQueries((prev) => ({ ...prev, [group.key]: event.target.value }))
                    }
                    placeholder={`Search ${group.label.toLowerCase()}...`}
                    className="field mb-1 py-1.5 text-[0.95rem]"
                  />
                )}

                {group.options.length === 0 ? (
                  <p className="m-0 text-small italic text-ink-faded">Nothing yet</p>
                ) : visibleOptions.length === 0 ? (
                  <p className="m-0 text-small italic text-ink-faded">No matches for &ldquo;{searchQueries[group.key]}&rdquo;</p>
                ) : (
                  <div
                    className={
                      group.searchable
                        ? "flex max-h-56 flex-col gap-2.5 overflow-y-auto pr-1"
                        : "flex flex-col gap-2.5"
                    }
                  >
                    {visibleOptions.map((option) => {
                      const checked = selected[group.key].includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center justify-between gap-2 text-[0.95rem] text-ink transition-colors duration-200 hover:text-wine"
                        >
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleValue(group.key, option.value)}
                              className="peer sr-only"
                            />
                            <CheckBox />
                            {option.label}
                          </span>
                          <span className="text-small text-ink-faded">{option.count}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    );
  }

  function renderResetButton(className: string) {
    return (
      <button type="button" onClick={reset} className={className}>
        Reset Filters
      </button>
    );
  }

  return (
    <aside className="mb-8 lg:mb-0 lg:w-72 lg:shrink-0">
      {/* Mobile / tablet: filters collapse into a single dropdown menu */}
      <details className="rounded-panel bg-stone lg:hidden">
        <summary className="display flex cursor-pointer list-none items-center justify-between rounded-panel px-6 py-4 text-[1.3rem] text-ink">
          <span>Filters{activeCount > 0 ? ` (${activeCount})` : ""}</span>
          <ChevronIcon />
        </summary>
        <div className="px-6 pb-6 pt-1">
          <hr aria-hidden="true" className="dots mb-4" />
          {renderGroups()}
          {renderResetButton(
            "btn-secondary mt-5 w-full bg-ground"
          )}
        </div>
      </details>

      {/* Desktop: persistent sidebar */}
      <div className="hidden lg:sticky lg:top-24 lg:block">
        <h2 className="mt-0 mb-4 text-h4 leading-tight">Filters</h2>
        {renderGroups()}
        {renderResetButton(
          "btn-secondary mt-6 w-full"
        )}
      </div>
    </aside>
  );
}
