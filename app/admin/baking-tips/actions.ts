"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { pool } from "../../lib/db";
import { requireAdminSession } from "../../lib/require-admin";

export type TipFormState = {
  error: string | null;
};

// Returns the new image URL, `null` if no file was provided (keep existing),
// or throws if a file was provided but the upload failed.
async function uploadImageIfProvided(formData: FormData): Promise<string | null> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return null;

  const blob = await put(`tips/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function createTip(_prevState: TipFormState, formData: FormData): Promise<TipFormState> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Body text is required." };

  let imageUrl: string | null;
  try {
    imageUrl = await uploadImageIfProvided(formData);
  } catch {
    return { error: "Image upload failed. Please try again." };
  }

  await pool.query(`INSERT INTO tips (title, body, image_url) VALUES ($1, $2, $3)`, [title, body, imageUrl]);

  revalidatePath("/admin/baking-tips");
  revalidatePath("/baking-tips");
  redirect("/admin/baking-tips");
}

export async function updateTip(
  id: string,
  _prevState: TipFormState,
  formData: FormData
): Promise<TipFormState> {
  await requireAdminSession();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Body text is required." };

  let uploadedImageUrl: string | null;
  try {
    uploadedImageUrl = await uploadImageIfProvided(formData);
  } catch {
    return { error: "Image upload failed. Please try again." };
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

  revalidatePath("/admin/baking-tips");
  revalidatePath(`/baking-tips/${id}`);
  revalidatePath("/baking-tips");
  redirect("/admin/baking-tips");
}

export async function deleteTip(id: string) {
  await requireAdminSession();
  await pool.query(`DELETE FROM tips WHERE id = $1`, [id]);
  revalidatePath("/admin/baking-tips");
  revalidatePath("/baking-tips");
}
