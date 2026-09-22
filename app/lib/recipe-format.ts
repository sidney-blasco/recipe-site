// Pure, DB-free module — safe to import from Client Components. Anything
// that imports "./db" (even transitively) pulls the `pg` driver into the
// browser bundle, which fails to build (it needs Node built-ins like `tls`).

export type RecipeIngredient = {
  name: string;
  amount: string | null;
  unit: string | null;
};

// Renders one ingredient as a single display/edit line, e.g. "2 cloves Garlic".
export function formatIngredientLine(ingredient: RecipeIngredient): string {
  return [ingredient.amount, ingredient.unit, ingredient.name].filter(Boolean).join(" ");
}

// Shared with app/lib/ingredient-library.ts, which does the actual DB
// lookup/upsert — kept here (not there) so client components can key their
// local match-state the same way without pulling `pg` into the browser bundle.
export type LibraryMatch = {
  quantity: number | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sugarG: number | null;
};

// Keys the lookup/upsert maps the same way the DB's unique index does:
// case-insensitive name, exact unit (empty string for unit-less ingredients).
export function libraryKey(name: string, unit: string): string {
  return `${name.trim().toLowerCase()}|${unit}`;
}

// Canonical unit -> every spelling that should normalize to it. Matching and
// ingredient_library lookups both key off the canonical form, so "2 tbsp" and
// "2 tablespoons" of the same thing land on the same library entry.
const UNIT_ALIAS_GROUPS: [string, string[]][] = [
  ["cup", ["cup", "cups", "c"]],
  ["tbsp", ["tbsp", "tbsps", "tbs", "tablespoon", "tablespoons"]],
  ["tsp", ["tsp", "tsps", "teaspoon", "teaspoons"]],
  ["oz", ["oz", "ounce", "ounces"]],
  ["lb", ["lb", "lbs", "pound", "pounds"]],
  ["g", ["g", "gram", "grams"]],
  ["kg", ["kg", "kilogram", "kilograms"]],
  ["ml", ["ml", "milliliter", "milliliters", "millilitre", "millilitres"]],
  ["l", ["l", "liter", "liters", "litre", "litres"]],
  ["clove", ["clove", "cloves"]],
  ["slice", ["slice", "slices"]],
  ["can", ["can", "cans"]],
  ["package", ["package", "packages", "pkg", "pkgs"]],
  ["stick", ["stick", "sticks"]],
  ["pinch", ["pinch", "pinches"]],
  ["dash", ["dash", "dashes"]],
  ["bunch", ["bunch", "bunches"]],
  ["head", ["head", "heads"]],
  ["qt", ["qt", "quart", "quarts"]],
  ["pt", ["pt", "pint", "pints"]],
  ["gal", ["gal", "gallon", "gallons"]],
];

const UNIT_ALIASES = new Map<string, string>();
for (const [canonical, aliases] of UNIT_ALIAS_GROUPS) {
  for (const alias of aliases) UNIT_ALIASES.set(alias, canonical);
}

const VULGAR_FRACTIONS: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅕": 0.2,
  "⅖": 0.4,
  "⅗": 0.6,
  "⅘": 0.8,
  "⅙": 1 / 6,
  "⅚": 5 / 6,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

function parseQuantityToken(token: string): number | null {
  if (token in VULGAR_FRACTIONS) return VULGAR_FRACTIONS[token];
  if (/^\d+\/\d+$/.test(token)) {
    const [a, b] = token.split("/").map(Number);
    return b === 0 ? null : a / b;
  }
  if (/^\d+(\.\d+)?$/.test(token)) return Number(token);
  return null;
}

export type ParsedIngredientLine = {
  quantity: number | null;
  unit: string | null;
  name: string;
};

// Best-effort split of a free-typed ingredient line into quantity, unit, and
// name, e.g. "2 cups all-purpose flour" -> { quantity: 2, unit: "cup", name:
// "all-purpose flour" }. Unmatched leading tokens are left in `name` rather
// than dropped, so parsing never loses information.
export function parseIngredientLine(rawLine: string): ParsedIngredientLine {
  const line = rawLine.trim();
  if (!line) return { quantity: null, unit: null, name: "" };

  const quantityMatch = line.match(
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*/
  );

  let quantity: number | null = null;
  let rest = line;

  if (quantityMatch) {
    const token = quantityMatch[1];
    rest = line.slice(quantityMatch[0].length);
    if (token.includes(" ")) {
      const [wholePart, fracPart] = token.split(/\s+/);
      const frac = parseQuantityToken(fracPart);
      quantity = frac !== null ? Number(wholePart) + frac : Number(wholePart);
    } else {
      quantity = parseQuantityToken(token);
    }
  }

  rest = rest.trim();

  let unit: string | null = null;
  const unitMatch = rest.match(/^([a-zA-Z]+)\.?(?:\s+|$)/);
  if (unitMatch) {
    const canonical = UNIT_ALIASES.get(unitMatch[1].toLowerCase());
    if (canonical) {
      unit = canonical;
      rest = rest.slice(unitMatch[0].length).trim();
    }
  }

  rest = rest.replace(/^of\s+/i, "");

  return { quantity, unit, name: rest };
}
