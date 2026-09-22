"use server";

import { requireAdminSession } from "../../lib/require-admin";
import { matchIngredientLibrary, type LibraryMatch } from "../../lib/ingredient-library";

// Called live from the recipe form as ingredients are parsed, to pre-fill
// nutrition fields from previously-saved entries. Returns a plain object
// (not a Map) since that's what serializes cleanly across the Server Action
// boundary — keyed by the same `${name}|${unit}` scheme as libraryKey().
export async function lookupIngredientLibrary(
  items: { name: string; unit: string }[]
): Promise<Record<string, LibraryMatch>> {
  await requireAdminSession();
  const matches = await matchIngredientLibrary(items);
  return Object.fromEntries(matches);
}
