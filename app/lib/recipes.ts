import { pool } from "./db";
import { formatIngredientLine, type RecipeIngredient } from "./recipe-format";

export { formatIngredientLine, type RecipeIngredient };

export type Recipe = {
  id: string;
  title: string;
  cuisine: string | null;
  mealType: string | null;
  tags: string[];
  ingredients: string[];
  imageUrl: string | null;
  popularity: number | null;
};

// Shown wherever the recipe grid would otherwise be empty (no recipes in the
// database yet), so pages still render something representative.
export const placeholderRecipes: Recipe[] = [
  { id: "placeholder-1", title: "Sample Recipe", cuisine: "Italian", mealType: null, tags: [], ingredients: [], imageUrl: null, popularity: null },
  { id: "placeholder-2", title: "Sample Recipe", cuisine: "Breakfast", mealType: null, tags: [], ingredients: [], imageUrl: null, popularity: null },
  { id: "placeholder-3", title: "Sample Recipe", cuisine: "Dessert", mealType: null, tags: [], ingredients: [], imageUrl: null, popularity: null },
  { id: "placeholder-4", title: "Sample Recipe", cuisine: "Vegan", mealType: null, tags: [], ingredients: [], imageUrl: null, popularity: null },
];

// Sorts by popularity (highest first); recipes without a popularity score
// keep their existing relative order, which is newest-first from getRecipes.
// This naturally falls back to "newest" until popularity data is filled in.
export function pickFeaturedRecipes(recipes: Recipe[], limit: number): Recipe[] {
  return [...recipes]
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, limit);
}

export type RecipeDetail = {
  id: string;
  title: string;
  cuisine: string | null;
  mealType: string | null;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageUrl: string | null;
  description: string | null;
  prepTime: string | null;
  cookTime: string | null;
  totalTime: string | null;
  servings: string | null;
  notes: string | null;
  parentRecipeId: string | null;
  parentRecipeTitle: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sugarG: number | null;
};

export type RecipeOption = {
  id: string;
  title: string;
};

// numeric columns come back from pg as strings to avoid precision loss.
function parseNumeric(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const num = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(num) ? num : null;
}

// Ingredients are stored as jsonb — either an array of plain strings, or
// objects like { name, amount, unit }.
function parseIngredients(raw: unknown): RecipeIngredient[] {
  if (!Array.isArray(raw)) return [];

  const ingredients: RecipeIngredient[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const name = item.trim();
      if (name) ingredients.push({ name, amount: null, unit: null });
      continue;
    }

    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      const name = typeof obj.name === "string" ? obj.name.trim() : "";
      if (!name) continue;
      const amount =
        typeof obj.amount === "string" || typeof obj.amount === "number" ? String(obj.amount).trim() : null;
      const unit = typeof obj.unit === "string" ? obj.unit.trim() : null;
      ingredients.push({ name, amount: amount || null, unit: unit || null });
    }
  }

  return ingredients;
}

// Instructions are stored as jsonb — either an array of plain strings, or
// objects like { step, text } / { step, instruction }.
function parseInstructions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const steps: string[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const text = item.trim();
      if (text) steps.push(text);
      continue;
    }

    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      const text =
        (typeof obj.text === "string" && obj.text) ||
        (typeof obj.instruction === "string" && obj.instruction) ||
        (typeof obj.step === "string" && obj.step) ||
        null;
      if (text && text.trim()) steps.push(text.trim());
    }
  }

  return steps;
}

export async function getRecipes(): Promise<Recipe[]> {
  const result = await pool.query<{
    id: string;
    title: string;
    cuisine: string | null;
    meal_type: string | null;
    tags: string[] | null;
    ingredients: unknown;
    image_url: string | null;
    popularity: number | null;
  }>(
    `SELECT id, title, cuisine, meal_type, tags, ingredients, image_url, popularity
     FROM recipes
     ORDER BY created_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    cuisine: row.cuisine,
    mealType: row.meal_type,
    tags: row.tags ?? [],
    ingredients: parseIngredients(row.ingredients).map((ingredient) => ingredient.name),
    imageUrl: row.image_url,
    popularity: row.popularity,
  }));
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getRecipeById(id: string): Promise<RecipeDetail | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const result = await pool.query<{
    id: string;
    title: string;
    cuisine: string | null;
    meal_type: string | null;
    tags: string[] | null;
    ingredients: unknown;
    instructions: unknown;
    image_url: string | null;
    description: string | null;
    prep_time: string | null;
    cook_time: string | null;
    total_time: string | null;
    servings: string | null;
    notes: string | null;
    parent_recipe_id: string | null;
    parent_recipe_title: string | null;
    calories: number | null;
    protein_g: string | null;
    carbs_g: string | null;
    fat_g: string | null;
    fiber_g: string | null;
    sugar_g: string | null;
  }>(
    `SELECT r.id, r.title, r.cuisine, r.meal_type, r.tags, r.ingredients, r.instructions, r.image_url,
            r.description, r.prep_time, r.cook_time, r.total_time, r.servings, r.notes,
            r.parent_recipe_id, p.title AS parent_recipe_title,
            r.calories, r.protein_g, r.carbs_g, r.fat_g, r.fiber_g, r.sugar_g
     FROM recipes r
     LEFT JOIN recipes p ON p.id = r.parent_recipe_id
     WHERE r.id = $1`,
    [id]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    cuisine: row.cuisine,
    mealType: row.meal_type,
    tags: row.tags ?? [],
    ingredients: parseIngredients(row.ingredients),
    instructions: parseInstructions(row.instructions),
    imageUrl: row.image_url,
    description: row.description,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    totalTime: row.total_time,
    servings: row.servings,
    notes: row.notes,
    parentRecipeId: row.parent_recipe_id,
    parentRecipeTitle: row.parent_recipe_title,
    calories: row.calories,
    proteinG: parseNumeric(row.protein_g),
    carbsG: parseNumeric(row.carbs_g),
    fatG: parseNumeric(row.fat_g),
    fiberG: parseNumeric(row.fiber_g),
    sugarG: parseNumeric(row.sugar_g),
  };
}

// Options for the "Parent Recipe" picker — every recipe, listed by title.
export async function getRecipeOptions(): Promise<RecipeOption[]> {
  const result = await pool.query<{ id: string; title: string }>(
    `SELECT id, title FROM recipes ORDER BY title ASC`
  );
  return result.rows;
}

export type RecipeVariation = {
  id: string;
  title: string;
  imageUrl: string | null;
};

// Other recipes that name this one as their parent_recipe_id — shown as
// "Variations" on the base recipe's page.
export async function getRecipeVariations(parentId: string): Promise<RecipeVariation[]> {
  const result = await pool.query<{ id: string; title: string; image_url: string | null }>(
    `SELECT id, title, image_url FROM recipes WHERE parent_recipe_id = $1 ORDER BY title ASC`,
    [parentId]
  );
  return result.rows.map((row) => ({ id: row.id, title: row.title, imageUrl: row.image_url }));
}
