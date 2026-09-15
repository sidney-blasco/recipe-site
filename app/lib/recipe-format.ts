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
