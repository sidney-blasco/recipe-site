import { pool } from "./db";

export type Recipe = {
  id: string;
  title: string;
  cuisine: string | null;
  mealType: string | null;
  tags: string[];
  ingredients: string[];
  imageUrl: string | null;
};

export type RecipeIngredient = {
  name: string;
  amount: string | null;
  unit: string | null;
};

export type RecipeDetail = {
  id: string;
  title: string;
  cuisine: string | null;
  mealType: string | null;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageUrl: string | null;
};

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
  }>(
    `SELECT id, title, cuisine, meal_type, tags, ingredients, image_url
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
  }>(
    `SELECT id, title, cuisine, meal_type, tags, ingredients, instructions, image_url
     FROM recipes
     WHERE id = $1`,
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
  };
}
