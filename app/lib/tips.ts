import { pool } from "./db";
import { formatDate } from "./format-date";

export type Tip = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  imageUrl: string | null;
  createdAt: string;
};

// Shown when the tips table is empty, so you can see the intended layout.
export const placeholderTips: Tip[] = [
  {
    id: "placeholder-tip-1",
    title: "New Tip",
    excerpt:
      "This is a placeholder tip so you can see how the Baking Tips index and detail page look before adding real posts.",
    body: [
      "[Placeholder] This is where the full tip goes — a technique, a lesson learned the hard way, a substitution that actually works.",
      "Write in as many paragraphs as you like; each blank line becomes its own paragraph on the tip's page.",
    ].join("\n\n"),
    imageUrl: null,
    createdAt: new Date().toISOString(),
  },
];

function deriveExcerpt(body: string, maxLength = 160): string {
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length > maxLength ? `${clean.slice(0, maxLength).trimEnd()}…` : clean;
}

type TipRow = {
  id: string;
  title: string;
  excerpt: string | null;
  body: string;
  image_url: string | null;
  created_at: Date;
};

function mapRow(row: TipRow): Tip {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt?.trim() ? row.excerpt : deriveExcerpt(row.body),
    body: row.body,
    imageUrl: row.image_url,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getTips(): Promise<Tip[]> {
  const result = await pool.query<TipRow>(
    `SELECT id, title, excerpt, body, image_url, created_at
     FROM tips
     ORDER BY created_at DESC`
  );

  return result.rows.map(mapRow);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getTipById(id: string): Promise<Tip | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const result = await pool.query<TipRow>(
    `SELECT id, title, excerpt, body, image_url, created_at
     FROM tips
     WHERE id = $1`,
    [id]
  );

  const row = result.rows[0];
  return row ? mapRow(row) : null;
}

export const formatTipDate = formatDate;
