import { pool } from "./db";

export type Comment = {
  id: string;
  name: string;
  rating: number | null;
  comment: string;
  createdAt: string;
};

export async function getCommentsForRecipe(recipeId: string): Promise<Comment[]> {
  const result = await pool.query<{
    id: string;
    name: string;
    rating: number | null;
    comment: string;
    created_at: Date;
  }>(
    `SELECT id, name, rating, comment, created_at
     FROM comments
     WHERE recipe_id = $1
     ORDER BY created_at DESC`,
    [recipeId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at.toISOString(),
  }));
}
