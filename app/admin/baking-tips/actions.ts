"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pool } from "../../lib/db";
import { uploadImageIfProvided } from "../../lib/blob";
import { requireAdminSession } from "../../lib/require-admin";

export type TipFormState = {
  error: string | null;
};

export async function createTip(_prevState: TipFormState, formData: FormData): Promise<TipFormState> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Body text is required." };

  let imageUrl: string | null;
  try {
    imageUrl = await uploadImageIfProvided(formData, "image", "tips");
  } catch {
    return { error: "Image upload failed. Please try again." };
  }

  await pool.query(`INSERT INTO tips (title, body, image_url) VALUES ($1, $2, $3)`, [title, body, imageUrl]);

  revalidatePath("/admin/baking-tips");
  revalidatePath("/baking-tips");
  redirect("/admin/baking-tips");
}

export async function deleteTip(id: string) {
  await requireAdminSession();
  await pool.query(`DELETE FROM tips WHERE id = $1`, [id]);
  revalidatePath("/admin/baking-tips");
  revalidatePath("/baking-tips");
}
