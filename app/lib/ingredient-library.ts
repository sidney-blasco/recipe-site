import { pool } from "./db";
import { libraryKey, type LibraryMatch } from "./recipe-format";

export type { LibraryMatch };
export { libraryKey };

// numeric columns come back from pg as strings to avoid precision loss.
function parseNumeric(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const num = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(num) ? num : null;
}

// Batched exact-match lookup for (name, unit) pairs against the personal
// ingredient library, keyed by libraryKey() for the caller to consume.
export async function matchIngredientLibrary(
  items: { name: string; unit: string }[]
): Promise<Map<string, LibraryMatch>> {
  const map = new Map<string, LibraryMatch>();
  if (items.length === 0) return map;

  const names = items.map((item) => item.name);
  const units = items.map((item) => item.unit);

  const result = await pool.query<{
    name: string;
    unit: string;
    quantity: string | null;
    calories: string | null;
    protein_g: string | null;
    carbs_g: string | null;
    fat_g: string | null;
    fiber_g: string | null;
    sugar_g: string | null;
  }>(
    `SELECT il.name, il.unit, il.quantity, il.calories, il.protein_g, il.carbs_g, il.fat_g, il.fiber_g, il.sugar_g
     FROM ingredient_library il
     JOIN unnest($1::text[], $2::text[]) AS q(name, unit)
       ON lower(il.name) = lower(q.name) AND il.unit = q.unit`,
    [names, units]
  );

  for (const row of result.rows) {
    map.set(libraryKey(row.name, row.unit), {
      quantity: parseNumeric(row.quantity),
      calories: parseNumeric(row.calories),
      proteinG: parseNumeric(row.protein_g),
      carbsG: parseNumeric(row.carbs_g),
      fatG: parseNumeric(row.fat_g),
      fiberG: parseNumeric(row.fiber_g),
      sugarG: parseNumeric(row.sugar_g),
    });
  }
  return map;
}

export type LibraryUpsertEntry = {
  name: string;
  unit: string;
  quantity: number | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sugarG: number | null;
};

// Saves a new entry, or overwrites the existing one for the same
// (lower(name), unit) pair — the caller decides which rows qualify (new or
// user-corrected), so every entry passed here is written unconditionally.
export async function upsertIngredientLibraryEntries(entries: LibraryUpsertEntry[]): Promise<void> {
  for (const entry of entries) {
    await pool.query(
      `INSERT INTO ingredient_library (name, unit, quantity, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (lower(name), unit) DO UPDATE SET
         quantity = EXCLUDED.quantity,
         calories = EXCLUDED.calories,
         protein_g = EXCLUDED.protein_g,
         carbs_g = EXCLUDED.carbs_g,
         fat_g = EXCLUDED.fat_g,
         fiber_g = EXCLUDED.fiber_g,
         sugar_g = EXCLUDED.sugar_g`,
      [
        entry.name,
        entry.unit,
        entry.quantity,
        entry.calories,
        entry.proteinG,
        entry.carbsG,
        entry.fatG,
        entry.fiberG,
        entry.sugarG,
      ]
    );
  }
}
