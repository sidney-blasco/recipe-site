"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseIngredientLine, libraryKey, type LibraryMatch } from "../../lib/recipe-format";
import { lookupIngredientLibrary } from "./ingredient-library-actions";

const NUTRITION_FIELDS = [
  { key: "calories", label: "Calories", suffix: "" },
  { key: "proteinG", label: "Protein", suffix: "g" },
  { key: "carbsG", label: "Carbs", suffix: "g" },
  { key: "fatG", label: "Fat", suffix: "g" },
  { key: "fiberG", label: "Fiber", suffix: "g" },
  { key: "sugarG", label: "Sugar", suffix: "g" },
] as const;

type NutritionKey = (typeof NUTRITION_FIELDS)[number]["key"];
type NutritionValues = Record<NutritionKey, string>;

const EMPTY_VALUES: NutritionValues = {
  calories: "",
  proteinG: "",
  carbsG: "",
  fatG: "",
  fiberG: "",
  sugarG: "",
};

// Per-index, persists across renders independent of the current parse —
// `key` records which (name, unit) it was resolved for, so a row is only
// treated as matched/looked-up while the parsed line at that index still
// matches what the lookup was run for.
type LibraryLookupState = {
  key: string;
  lookedUp: boolean;
  matched: boolean;
  libraryQuantity: number | null;
  libraryValues: NutritionValues | null;
};

type IngredientRow = {
  name: string;
  unit: string; // "" when the line had no recognizable unit
  quantity: number | null;
  matched: boolean;
  lookedUp: boolean;
  libraryQuantity: number | null;
  libraryValues: NutritionValues | null;
  overrides: Partial<NutritionValues>;
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseServingsNumber(text: string): number | null {
  const match = text.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

// The value actually shown/submitted for one field of one row: a manual
// override if the admin typed one, otherwise the library value scaled by
// this recipe's quantity vs. the library entry's saved quantity.
function currentValue(row: IngredientRow, key: NutritionKey): string {
  if (row.overrides[key] !== undefined) return row.overrides[key]!;
  if (row.libraryValues) {
    const raw = row.libraryValues[key];
    if (raw === "") return "";
    const scale = row.quantity != null && row.libraryQuantity ? row.quantity / row.libraryQuantity : 1;
    return String(round(Number(raw) * scale));
  }
  return "";
}

function willSaveToLibrary(row: IngredientRow): boolean {
  return !row.matched || Object.keys(row.overrides).length > 0;
}

function numOrNull(value: string): number | null {
  if (value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

const rowInputClass =
  "w-full rounded-lg border border-plum/20 bg-white/70 px-2 py-1.5 text-sm text-ink placeholder:text-ink/40 focus:border-plum/50 focus:outline-none";

export default function IngredientNutrition({
  initialIngredientsText,
  servings,
}: {
  initialIngredientsText: string;
  servings: string;
}) {
  const [ingredientsText, setIngredientsText] = useState(initialIngredientsText);
  const [libraryState, setLibraryState] = useState<Record<number, LibraryLookupState>>({});
  const [overrides, setOverrides] = useState<Record<number, Partial<NutritionValues>>>({});
  const lookupRequestId = useRef(0);

  const parsedLines = useMemo(() => {
    return ingredientsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parsed = parseIngredientLine(line);
        return { name: parsed.name, unit: parsed.unit ?? "", quantity: parsed.quantity };
      });
  }, [ingredientsText]);

  // Derived, not stored: a row's library match only counts while its parsed
  // (name, unit) still matches what that lookup was run for. Editing the
  // ingredient text past that point makes it look "not looked up yet" again
  // until the lookup effect below catches up.
  const rows: IngredientRow[] = useMemo(() => {
    return parsedLines.map((parsed, index) => {
      const key = `${parsed.name}|${parsed.unit}`;
      const state = libraryState[index];
      const isCurrent = state?.key === key;
      return {
        name: parsed.name,
        unit: parsed.unit,
        quantity: parsed.quantity,
        matched: isCurrent ? state.matched : false,
        lookedUp: isCurrent ? state.lookedUp : false,
        libraryQuantity: isCurrent ? state.libraryQuantity : null,
        libraryValues: isCurrent ? state.libraryValues : null,
        overrides: overrides[index] ?? {},
      };
    });
  }, [parsedLines, libraryState, overrides]);

  // Debounced batch lookup for any row that hasn't been checked yet.
  useEffect(() => {
    const pending = rows
      .map((row, index) => ({ index, name: row.name, unit: row.unit, lookedUp: row.lookedUp }))
      .filter((item) => !item.lookedUp && item.name);

    if (pending.length === 0) return;

    const timeout = setTimeout(() => {
      const requestId = ++lookupRequestId.current;
      lookupIngredientLibrary(pending.map(({ name, unit }) => ({ name, unit }))).then(
        (matches: Record<string, LibraryMatch>) => {
          if (lookupRequestId.current !== requestId) return; // superseded by a newer edit
          setLibraryState((prev) => {
            const next = { ...prev };
            for (const { index, name, unit } of pending) {
              const match = matches[libraryKey(name, unit)];
              next[index] = {
                key: `${name}|${unit}`,
                lookedUp: true,
                matched: Boolean(match),
                libraryQuantity: match ? match.quantity : null,
                libraryValues: match
                  ? {
                      calories: match.calories === null ? "" : String(match.calories),
                      proteinG: match.proteinG === null ? "" : String(match.proteinG),
                      carbsG: match.carbsG === null ? "" : String(match.carbsG),
                      fatG: match.fatG === null ? "" : String(match.fatG),
                      fiberG: match.fiberG === null ? "" : String(match.fiberG),
                      sugarG: match.sugarG === null ? "" : String(match.sugarG),
                    }
                  : null,
              };
            }
            return next;
          });
        }
      );
    }, 500);

    return () => clearTimeout(timeout);
  }, [rows]);

  function updateOverride(index: number, key: NutritionKey, value: string) {
    setOverrides((prev) => ({ ...prev, [index]: { ...prev[index], [key]: value } }));
  }

  const totals = useMemo(() => {
    const sums: Record<NutritionKey, number> = {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      sugarG: 0,
    };
    const present: Record<NutritionKey, boolean> = {
      calories: false,
      proteinG: false,
      carbsG: false,
      fatG: false,
      fiberG: false,
      sugarG: false,
    };

    for (const row of rows) {
      for (const field of NUTRITION_FIELDS) {
        const raw = currentValue(row, field.key);
        if (raw === "") continue;
        const num = Number(raw);
        if (Number.isFinite(num)) {
          sums[field.key] += num;
          present[field.key] = true;
        }
      }
    }

    const servingsNum = parseServingsNumber(servings);
    const divisor = servingsNum && servingsNum > 0 ? servingsNum : 1;

    const result = { ...EMPTY_VALUES };
    for (const field of NUTRITION_FIELDS) {
      result[field.key] = present[field.key] ? String(round(sums[field.key] / divisor)) : "";
    }
    return result;
  }, [rows, servings]);

  const libraryUpserts = useMemo(() => {
    return rows
      .filter((row) => row.name && willSaveToLibrary(row))
      .map((row) => ({
        name: row.name,
        unit: row.unit,
        quantity: row.quantity,
        calories: numOrNull(currentValue(row, "calories")),
        proteinG: numOrNull(currentValue(row, "proteinG")),
        carbsG: numOrNull(currentValue(row, "carbsG")),
        fatG: numOrNull(currentValue(row, "fatG")),
        fiberG: numOrNull(currentValue(row, "fiberG")),
        sugarG: numOrNull(currentValue(row, "sugarG")),
      }));
  }, [rows]);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold text-plum">Ingredients</span>
        <textarea
          name="ingredientsText"
          value={ingredientsText}
          onChange={(event) => setIngredientsText(event.target.value)}
          rows={10}
          placeholder={"2 cups flour\n1 tsp salt\n3 eggs"}
          className="rounded-lg border border-plum/20 bg-white/70 px-3 py-2 text-ink placeholder:text-ink/40 focus:border-plum/50 focus:outline-none"
        />
        <p className="text-xs text-ink/50">One ingredient per line.</p>
      </label>

      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-ink/50">
            Nutrition per ingredient — matched from your ingredient library where possible.
          </p>
          {rows.map((row, index) => {
            if (!row.name) return null;
            const needsSave = willSaveToLibrary(row);
            const saveLabel = needsSave ? "New — will be saved" : "Auto-filled from library";
            return (
              <div key={index} className="rounded-xl border border-plum/15 bg-white/50 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-ink/85">
                    <span className="font-semibold text-plum">
                      {row.quantity != null ? row.quantity : ""} {row.unit}
                    </span>{" "}
                    {row.name}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      needsSave ? "bg-lavender text-plum" : "bg-plum/10 text-plum"
                    }`}
                  >
                    {saveLabel}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {NUTRITION_FIELDS.map((field) => (
                    <label key={field.key} className="flex flex-col gap-1 text-xs">
                      <span className="font-semibold text-ink/60">
                        {field.label}
                        {field.suffix && ` (${field.suffix})`}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step={field.key === "calories" ? "1" : "0.1"}
                        value={currentValue(row, field.key)}
                        onChange={(event) => updateOverride(index, field.key, event.target.value)}
                        className={rowInputClass}
                      />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input type="hidden" name="ingredientLibraryUpserts" value={JSON.stringify(libraryUpserts)} />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold uppercase tracking-wide text-plum">
          Nutrition <span className="font-normal normal-case text-ink/50">(per serving)</span>
        </legend>
        <p className="text-xs text-ink/50">Calculated automatically from the ingredients above.</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {NUTRITION_FIELDS.map((field) => (
            <label key={field.key} className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold text-plum">
                {field.label}
                {field.suffix && ` (${field.suffix})`}
              </span>
              <input
                type="number"
                name={field.key}
                readOnly
                value={totals[field.key]}
                className="rounded-lg border border-plum/20 bg-lavender/30 px-3 py-2 text-ink focus:outline-none"
              />
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
