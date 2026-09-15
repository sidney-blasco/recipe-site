"use server";

import { revalidatePath } from "next/cache";
import { pool } from "../../lib/db";
import { splitLines, textOrNull } from "../../lib/form-fields";
import { uploadImageIfProvided } from "../../lib/blob";
import { requireAdminSession } from "../../lib/require-admin";
import { getRecipeById, type RecipeDetail } from "../../lib/recipes";
import type { Comment } from "../../lib/comments";

export type SubmitCommentResult = {
  error: string | null;
  comment: Comment | null;
};

export type UpdateRecipeInlineResult = {
  error: string | null;
  recipe: RecipeDetail | null;
};

// Inline "Edit Mode" save from the live recipe page. Deliberately only
// touches the fields exposed there (title, description, timing, servings,
// ingredients, instructions, notes, photo) — cuisine, type, and the curated
// tags are set only at creation time via /admin/recipes/new and are left
// untouched here.
export async function updateRecipeInline(id: string, formData: FormData): Promise<UpdateRecipeInlineResult> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required.", recipe: null };

  const ingredients = splitLines(formData, "ingredientsText");
  if (ingredients.length === 0) return { error: "Add at least one ingredient.", recipe: null };

  const instructions = splitLines(formData, "instructionsText");
  if (instructions.length === 0) return { error: "Add at least one instruction step.", recipe: null };

  const description = textOrNull(formData, "description");
  const prepTime = textOrNull(formData, "prepTime");
  const cookTime = textOrNull(formData, "cookTime");
  const totalTime = textOrNull(formData, "totalTime");
  const servings = textOrNull(formData, "servings");
  const notes = textOrNull(formData, "notes");

  let uploadedImageUrl: string | null;
  try {
    uploadedImageUrl = await uploadImageIfProvided(formData, "image", "recipes");
  } catch {
    return { error: "Image upload failed. Please try again.", recipe: null };
  }

  if (uploadedImageUrl) {
    await pool.query(
      `UPDATE recipes
       SET title = $1, description = $2, prep_time = $3, cook_time = $4, total_time = $5,
           servings = $6, notes = $7, ingredients = $8::jsonb, instructions = $9::jsonb, image_url = $10
       WHERE id = $11`,
      [
        title,
        description,
        prepTime,
        cookTime,
        totalTime,
        servings,
        notes,
        JSON.stringify(ingredients),
        JSON.stringify(instructions),
        uploadedImageUrl,
        id,
      ]
    );
  } else {
    await pool.query(
      `UPDATE recipes
       SET title = $1, description = $2, prep_time = $3, cook_time = $4, total_time = $5,
           servings = $6, notes = $7, ingredients = $8::jsonb, instructions = $9::jsonb
       WHERE id = $10`,
      [
        title,
        description,
        prepTime,
        cookTime,
        totalTime,
        servings,
        notes,
        JSON.stringify(ingredients),
        JSON.stringify(instructions),
        id,
      ]
    );
  }

  revalidatePath(`/recipes/${id}`);
  revalidatePath("/");
  revalidatePath("/ingredients");

  const recipe = await getRecipeById(id);
  return { error: null, recipe };
}

export async function submitComment(recipeId: string, formData: FormData): Promise<SubmitCommentResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required.", comment: null };

  const commentText = String(formData.get("comment") ?? "").trim();
  if (!commentText) return { error: "Comment is required.", comment: null };

  let rating: number | null = null;
  const ratingRaw = formData.get("rating");
  if (typeof ratingRaw === "string" && ratingRaw.trim()) {
    const parsed = Number(ratingRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
      return { error: "Rating must be between 1 and 5.", comment: null };
    }
    rating = parsed;
  }

  const result = await pool.query<{
    id: string;
    name: string;
    rating: number | null;
    comment: string;
    created_at: Date;
  }>(
    `INSERT INTO comments (recipe_id, name, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, rating, comment, created_at`,
    [recipeId, name, rating, commentText]
  );

  const row = result.rows[0];

  revalidatePath(`/recipes/${recipeId}`);

  return {
    error: null,
    comment: {
      id: row.id,
      name: row.name,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at.toISOString(),
    },
  };
}
