"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pool } from "../../lib/db";
import { splitLines, textOrNull, numberOrNull } from "../../lib/form-fields";
import { uploadImageIfProvided } from "../../lib/blob";
import { requireAdminSession } from "../../lib/require-admin";
import { upsertIngredientLibraryEntries, type LibraryUpsertEntry } from "../../lib/ingredient-library";

export type RecipeFormState = {
  error: string | null;
};

// The ingredientLibraryUpserts hidden field is client-computed JSON — treat
// it as untrusted input and rebuild each entry field-by-field rather than
// trusting its shape.
function parseLibraryUpserts(formData: FormData): LibraryUpsertEntry[] {
  const raw = String(formData.get("ingredientLibraryUpserts") ?? "");
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const toNumberOrNull = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

  const entries: LibraryUpsertEntry[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const unit = typeof record.unit === "string" ? record.unit : "";
    if (!name) continue;
    entries.push({
      name,
      unit,
      quantity: toNumberOrNull(record.quantity),
      calories: toNumberOrNull(record.calories),
      proteinG: toNumberOrNull(record.proteinG),
      carbsG: toNumberOrNull(record.carbsG),
      fatG: toNumberOrNull(record.fatG),
      fiberG: toNumberOrNull(record.fiberG),
      sugarG: toNumberOrNull(record.sugarG),
    });
  }
  return entries;
}

function collectCuratedTags(formData: FormData): string[] {
  const dietary = formData.getAll("dietary").map(String);
  const occasion = formData.getAll("occasion").map(String);
  const seasonal = formData.getAll("seasonal").map(String);
  const skillLevel = formData.get("skillLevel");
  const tags = [...dietary, ...occasion, ...seasonal];
  if (typeof skillLevel === "string" && skillLevel.trim()) {
    tags.push(skillLevel.trim());
  }
  return tags;
}

export async function createRecipe(_prevState: RecipeFormState, formData: FormData): Promise<RecipeFormState> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const ingredients = splitLines(formData, "ingredientsText");
  if (ingredients.length === 0) return { error: "Add at least one ingredient." };

  const instructions = splitLines(formData, "instructionsText");
  if (instructions.length === 0) return { error: "Add at least one instruction step." };

  const cuisine = String(formData.get("cuisine") ?? "").trim() || null;
  const mealType = String(formData.get("type") ?? "").trim() || null;
  const tags = collectCuratedTags(formData);

  const description = textOrNull(formData, "description");
  const prepTime = textOrNull(formData, "prepTime");
  const cookTime = textOrNull(formData, "cookTime");
  const totalTime = textOrNull(formData, "totalTime");
  const servings = textOrNull(formData, "servings");
  const notes = textOrNull(formData, "notes");
  const parentRecipeId = textOrNull(formData, "parentRecipeId");
  const calories = numberOrNull(formData, "calories");
  const proteinG = numberOrNull(formData, "proteinG");
  const carbsG = numberOrNull(formData, "carbsG");
  const fatG = numberOrNull(formData, "fatG");
  const fiberG = numberOrNull(formData, "fiberG");
  const sugarG = numberOrNull(formData, "sugarG");

  let imageUrl: string | null;
  try {
    imageUrl = await uploadImageIfProvided(formData, "image", "recipes");
  } catch (error) {
    console.error("createRecipe: image upload failed", error);
    return { error: "Image upload failed. Please try again." };
  }

  await pool.query(
    `INSERT INTO recipes (
       title, cuisine, meal_type, tags, ingredients, instructions, image_url,
       description, prep_time, cook_time, total_time, servings, notes,
       parent_recipe_id, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g
     )
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
    [
      title,
      cuisine,
      mealType,
      tags,
      JSON.stringify(ingredients),
      JSON.stringify(instructions),
      imageUrl,
      description,
      prepTime,
      cookTime,
      totalTime,
      servings,
      notes,
      parentRecipeId,
      calories,
      proteinG,
      carbsG,
      fatG,
      fiberG,
      sugarG,
    ]
  );

  const libraryUpserts = parseLibraryUpserts(formData);
  if (libraryUpserts.length > 0) {
    await upsertIngredientLibraryEntries(libraryUpserts);
  }

  revalidatePath("/admin/recipes");
  revalidatePath("/");
  redirect("/admin/recipes");
}

export async function deleteRecipe(id: string) {
  await requireAdminSession();
  await pool.query(`DELETE FROM recipes WHERE id = $1`, [id]);
  revalidatePath("/admin/recipes");
  revalidatePath("/");
}
