import { pool } from "./db";

export type Photo = {
  id: string;
  src: string | null;
  alt: string;
};

// Placeholder gallery — mixes food shots and behind-the-scenes photos with no
// distinction in the data model. Shown only when no real photos have been
// uploaded yet (see getPhotos below).
export const placeholderPhotos: Photo[] = Array.from({ length: 10 }, (_, index) => ({
  id: `placeholder-photo-${index + 1}`,
  src: null,
  alt: `Placeholder photo ${index + 1}`,
}));

export async function getPhotos(): Promise<Photo[]> {
  const result = await pool.query<{ id: string; url: string; alt: string }>(
    `SELECT id, url, alt FROM photos ORDER BY created_at DESC`
  );

  return result.rows.map((row) => ({ id: row.id, src: row.url, alt: row.alt }));
}
