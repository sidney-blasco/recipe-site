"use server";

import { revalidatePath } from "next/cache";
import { pool } from "../lib/db";
import { uploadImageIfProvided } from "../lib/blob";
import { requireAdminSession } from "../lib/require-admin";
import { getAboutContent, type AboutContent } from "../lib/about";

export type UpdateAboutResult = {
  error: string | null;
  about: AboutContent | null;
};

export async function updateAboutInline(formData: FormData): Promise<UpdateAboutResult> {
  await requireAdminSession();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Body text is required.", about: null };

  let uploadedImageUrl: string | null;
  try {
    uploadedImageUrl = await uploadImageIfProvided(formData, "image", "about");
  } catch {
    return { error: "Image upload failed. Please try again.", about: null };
  }

  if (uploadedImageUrl) {
    await pool.query(`UPDATE about SET body = $1, image_url = $2, updated_at = now() WHERE id = 1`, [
      body,
      uploadedImageUrl,
    ]);
  } else {
    await pool.query(`UPDATE about SET body = $1, updated_at = now() WHERE id = 1`, [body]);
  }

  revalidatePath("/about");

  const about = await getAboutContent();
  return { error: null, about };
}
