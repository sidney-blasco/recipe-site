import type { Recipe } from "./recipes";

export type IngredientEntry = {
  name: string;
  count: number;
};

export type IngredientGroup = {
  letter: string;
  ingredients: IngredientEntry[];
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function buildIngredientIndex(recipes: Recipe[]): IngredientGroup[] {
  const byKey = new Map<string, IngredientEntry>();

  for (const recipe of recipes) {
    // Dedupe within a single recipe so a doubled ingredient doesn't inflate its count.
    const seen = new Set<string>();
    for (const name of recipe.ingredients) {
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const existing = byKey.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        byKey.set(key, { name, count: 1 });
      }
    }
  }

  const groups = new Map<string, IngredientEntry[]>();
  for (const entry of byKey.values()) {
    const first = entry.name[0]?.toUpperCase() ?? "#";
    const letter = /[A-Z]/.test(first) ? first : "#";
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(entry);
  }

  return [...ALPHABET, "#"]
    .map((letter) => ({
      letter,
      ingredients: (groups.get(letter) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.ingredients.length > 0);
}
