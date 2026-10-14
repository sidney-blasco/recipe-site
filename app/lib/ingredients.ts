import type { Recipe } from "./recipes";
import { UNIT_ALIASES } from "./recipe-format";

export type IngredientRecipe = {
  id: string;
  title: string;
};

export type IngredientEntry = {
  name: string;
  recipes: IngredientRecipe[];
};

export type IngredientGroup = {
  letter: string;
  ingredients: IngredientEntry[];
};

// ---------------------------------------------------------------------------
// EDITABLE: ingredients left out of the Ingredient Index entirely.
// Compared case-insensitively against the cleaned name; plurals match too
// ("large egg" also hides "Large eggs").
// ---------------------------------------------------------------------------
export const EXCLUDED_INGREDIENTS = [
  "salt",
  "water",
  "baking powder",
  "baking soda",
  "cake flour",
  "large egg",
];

// ---------------------------------------------------------------------------
// EDITABLE: variant name (left) -> the single index entry it merges into
// (right). Left side is matched like the exclusion list above.
// ---------------------------------------------------------------------------
export const INGREDIENT_ALIASES: Record<string, string> = {
  "steel cut oats": "Oats",
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Comparison key: lowercase, hyphens as spaces, trailing plural "s" dropped,
// so "Steel-cut oats" / "steel cut oat" / "STEEL CUT OATS" all compare equal.
function matchKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-‐–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(?<=[a-z]{2})s$/, "");
}

const EXCLUDED_KEYS = new Set(EXCLUDED_INGREDIENTS.map(matchKey));
const ALIAS_KEYS = new Map(
  Object.entries(INGREDIENT_ALIASES).map(([variant, canonical]) => [matchKey(variant), canonical])
);

// Section labels like "Part I", "Part 2", or anything ending in ":" ("Extras:").
const SECTION_HEADER = /^part\s+(?:[ivxlcdm]+|\d+)\b|:\s*$/i;
// A label in front of an ingredient, e.g. "Extras: blueberries". No digits
// allowed in the label so things like "1:1 flour blend" aren't mistaken for one.
const LEADING_LABEL = /^[^:\d]{1,40}:\s*/;

// One amount: "2", "1.5", "1/2", "½", "1½". Ranges ("2-3", "2–3", "2 to 3")
// and mixed numbers ("1 1/2") are handled by repeating/joining these.
const QTY = String.raw`(?:\d+:\d+|\d+(?:\.\d+)?(?:\s*\/\s*\d+)?[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]?|[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])`;
const LEADING_QUANTITY = new RegExp(String.raw`^(?:${QTY}(?:\s*(?:-|–|—|to)\s*${QTY})?\s*)+`, "i");
const LEADING_WORD = /^([a-zA-Z]+)\.?(?:\s+|$)/;

// Reduces a free-typed ingredient line to its core name, e.g.
// "2 cups granulated sugar, sifted" -> "Granulated sugar". Returns "" when
// nothing recognizable is left.
export function cleanIngredientName(rawLine: string): string {
  const line = rawLine.trim();
  if (SECTION_HEADER.test(line)) return "";

  let name = line
    .replace(LEADING_LABEL, "")
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ") // parenthetical notes, e.g. "(about 2 lemons)"
    .split(",")[0] // trailing prep notes, e.g. ", sifted"
    .replace(/\s+/g, " ")
    .trim();

  name = name.replace(LEADING_QUANTITY, "");

  // Units, possibly several ("1 can 14 oz" after parens are gone), then "of".
  for (;;) {
    const match = name.match(LEADING_WORD);
    if (!match || !UNIT_ALIASES.has(match[1].toLowerCase())) break;
    const rest = name.slice(match[0].length).replace(LEADING_QUANTITY, "");
    if (!rest) break;
    name = rest;
  }
  name = name.replace(/^of\s+/i, "").replace(/[\s.;:]+$/, "").trim();

  return name ? name[0].toUpperCase() + name.slice(1) : "";
}

function letterFor(name: string): string {
  const first = name.normalize("NFD")[0]?.toUpperCase() ?? "#";
  return /[A-Z]/.test(first) ? first : "#";
}

export function buildIngredientIndex(recipes: Recipe[]): IngredientGroup[] {
  const byKey = new Map<string, IngredientEntry>();

  for (const recipe of recipes) {
    for (const line of recipe.ingredients) {
      const cleaned = cleanIngredientName(line);
      if (!cleaned) continue;
      const cleanedKey = matchKey(cleaned);
      if (EXCLUDED_KEYS.has(cleanedKey)) continue;
      const name = ALIAS_KEYS.get(cleanedKey) ?? cleaned;
      const key = name.toLowerCase();

      let entry = byKey.get(key);
      if (!entry) {
        entry = { name, recipes: [] };
        byKey.set(key, entry);
      }
      // A recipe that lists the same ingredient twice still counts once.
      if (!entry.recipes.some((r) => r.id === recipe.id)) {
        entry.recipes.push({ id: recipe.id, title: recipe.title });
      }
    }
  }

  const groups = new Map<string, IngredientEntry[]>();
  for (const entry of byKey.values()) {
    entry.recipes.sort((a, b) => a.title.localeCompare(b.title));
    const letter = letterFor(entry.name);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(entry);
  }

  return [...ALPHABET, "#"]
    .map((letter) => ({
      letter,
      ingredients: (groups.get(letter) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      ),
    }))
    .filter((group) => group.ingredients.length > 0);
}
