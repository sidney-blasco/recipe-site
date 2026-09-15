"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { pool } from "../../lib/db";
import { classifyTags } from "../../lib/filters";
import { requireAdminSession } from "../../lib/require-admin";

export type RecipeFormState = {
  error: string | null;
};

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

// Splits a pasted textarea into one trimmed entry per non-empty line.
function splitLines(formData: FormData, fieldName: string): string[] {
  return String(formData.get(fieldName) ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function collectIngredients(formData: FormData): string[] {
  return splitLines(formData, "ingredientsText");
}

function collectInstructions(formData: FormData): string[] {
  return splitLines(formData, "instructionsText");
}

function textOrNull(formData: FormData, fieldName: string): string | null {
  const value = String(formData.get(fieldName) ?? "").trim();
  return value || null;
}

// Returns the new image URL, `null` if no file was provided (keep existing),
// or throws if a file was provided but the upload failed.
async function uploadImageIfProvided(formData: FormData): Promise<string | null> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return null;

  const blob = await put(`recipes/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function createRecipe(_prevState: RecipeFormState, formData: FormData): Promise<RecipeFormState> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const ingredients = collectIngredients(formData);
  if (ingredients.length === 0) return { error: "Add at least one ingredient." };

  const instructions = collectInstructions(formData);
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

  let imageUrl: string | null;
  try {
    imageUrl = await uploadImageIfProvided(formData);
  } catch {
    return { error: "Image upload failed. Please try again." };
  }

  await pool.query(
    `INSERT INTO recipes (
       title, cuisine, meal_type, tags, ingredients, instructions, image_url,
       description, prep_time, cook_time, total_time, servings, notes
     )
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11, $12, $13)`,
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
    ]
  );

  revalidatePath("/admin/recipes");
  revalidatePath("/");
  redirect("/admin/recipes");
}

export async function updateRecipe(
  id: string,
  _prevState: RecipeFormState,
  formData: FormData
): Promise<RecipeFormState> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const ingredients = collectIngredients(formData);
  if (ingredients.length === 0) return { error: "Add at least one ingredient." };

  const instructions = collectInstructions(formData);
  if (instructions.length === 0) return { error: "Add at least one instruction step." };

  const cuisine = String(formData.get("cuisine") ?? "").trim() || null;
  const mealType = String(formData.get("type") ?? "").trim() || null;

  const description = textOrNull(formData, "description");
  const prepTime = textOrNull(formData, "prepTime");
  const cookTime = textOrNull(formData, "cookTime");
  const totalTime = textOrNull(formData, "totalTime");
  const servings = textOrNull(formData, "servings");
  const notes = textOrNull(formData, "notes");

  // Preserve any custom "Other" tags this recipe already had — the form only
  // exposes the curated Dietary/Occasion/Seasonal/Skill Level vocabularies.
  const existing = await pool.query<{ tags: string[] | null }>(`SELECT tags FROM recipes WHERE id = $1`, [id]);
  const { other } = classifyTags(existing.rows[0]?.tags ?? []);
  const tags = [...collectCuratedTags(formData), ...other];

  let uploadedImageUrl: string | null;
  try {
    uploadedImageUrl = await uploadImageIfProvided(formData);
  } catch {
    return { error: "Image upload failed. Please try again." };
  }

  if (uploadedImageUrl) {
    await pool.query(
      `UPDATE recipes
       SET title = $1, cuisine = $2, meal_type = $3, tags = $4, ingredients = $5::jsonb, instructions = $6::jsonb,
           image_url = $7, description = $8, prep_time = $9, cook_time = $10, total_time = $11, servings = $12, notes = $13
       WHERE id = $14`,
      [
        title,
        cuisine,
        mealType,
        tags,
        JSON.stringify(ingredients),
        JSON.stringify(instructions),
        uploadedImageUrl,
        description,
        prepTime,
        cookTime,
        totalTime,
        servings,
        notes,
        id,
      ]
    );
  } else {
    await pool.query(
      `UPDATE recipes
       SET title = $1, cuisine = $2, meal_type = $3, tags = $4, ingredients = $5::jsonb, instructions = $6::jsonb,
           description = $7, prep_time = $8, cook_time = $9, total_time = $10, servings = $11, notes = $12
       WHERE id = $13`,
      [
        title,
        cuisine,
        mealType,
        tags,
        JSON.stringify(ingredients),
        JSON.stringify(instructions),
        description,
        prepTime,
        cookTime,
        totalTime,
        servings,
        notes,
        id,
      ]
    );
  }

  revalidatePath("/admin/recipes");
  revalidatePath(`/recipes/${id}`);
  revalidatePath("/");
  redirect("/admin/recipes");
}

export async function deleteRecipe(id: string) {
  await requireAdminSession();
  await pool.query(`DELETE FROM recipes WHERE id = $1`, [id]);
  revalidatePath("/admin/recipes");
  revalidatePath("/");
}
