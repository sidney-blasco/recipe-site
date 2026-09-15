"use server";

import { revalidatePath } from "next/cache";
import { pool } from "../../lib/db";
import { uploadImageIfProvided } from "../../lib/blob";
import { requireAdminSession } from "../../lib/require-admin";
import { getTipById, type Tip } from "../../lib/tips";

export type UpdateTipInlineResult = {
  error: string | null;
  tip: Tip | null;
};

export async function updateTipInline(id: string, formData: FormData): Promise<UpdateTipInlineResult> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required.", tip: null };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Body text is required.", tip: null };

  let uploadedImageUrl: string | null;
  try {
    uploadedImageUrl = await uploadImageIfProvided(formData, "image", "tips");
  } catch {
    return { error: "Image upload failed. Please try again.", tip: null };
  }

  if (uploadedImageUrl) {
    await pool.query(`UPDATE tips SET title = $1, body = $2, image_url = $3 WHERE id = $4`, [
      title,
      body,
      uploadedImageUrl,
      id,
    ]);
  } else {
    await pool.query(`UPDATE tips SET title = $1, body = $2 WHERE id = $3`, [title, body, id]);
  }

  revalidatePath(`/baking-tips/${id}`);
  revalidatePath("/baking-tips");

  const tip = await getTipById(id);
  return { error: null, tip };
}
