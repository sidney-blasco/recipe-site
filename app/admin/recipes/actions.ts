"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pool } from "../../lib/db";
import { splitLines, textOrNull } from "../../lib/form-fields";
import { uploadImageIfProvided } from "../../lib/blob";
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

  let imageUrl: string | null;
  try {
    imageUrl = await uploadImageIfProvided(formData, "image", "recipes");
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

export async function deleteRecipe(id: string) {
  await requireAdminSession();
  await pool.query(`DELETE FROM recipes WHERE id = $1`, [id]);
  revalidatePath("/admin/recipes");
  revalidatePath("/");
}
