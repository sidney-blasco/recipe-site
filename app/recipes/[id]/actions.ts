"use server";

import { revalidatePath } from "next/cache";
import { pool } from "../../lib/db";
import type { Comment } from "../../lib/comments";

export type SubmitCommentResult = {
  error: string | null;
  comment: Comment | null;
};

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
