import { pool } from "./db";

export type AboutContent = {
  body: string;
  imageUrl: string | null;
};

const FALLBACK: AboutContent = {
  body: "[Placeholder] Write a bit about yourself here.",
  imageUrl: null,
};

// Singleton row (id is always 1) — there's only ever one About page.
export async function getAboutContent(): Promise<AboutContent> {
  const result = await pool.query<{ body: string; image_url: string | null }>(
    `SELECT body, image_url FROM about WHERE id = 1`
  );

  const row = result.rows[0];
  if (!row) return FALLBACK;

  return { body: row.body, imageUrl: row.image_url };
}
