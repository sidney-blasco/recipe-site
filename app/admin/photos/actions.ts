"use server";

import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";
import { pool } from "../../lib/db";
import { requireAdminSession } from "../../lib/require-admin";

export type PhotoFormState = {
  error: string | null;
};

function altFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^./\\]+$/, "");
  const spaced = withoutExt.replace(/[-_]+/g, " ").trim();
  return spaced || "Photo";
}

export async function uploadPhotos(_prevState: PhotoFormState, formData: FormData): Promise<PhotoFormState> {
  await requireAdminSession();

  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    return { error: "Choose at least one photo to upload." };
  }

  let uploadFailed = false;
  for (const file of files) {
    try {
      const blob = await put(`photos/${crypto.randomUUID()}-${file.name}`, file, {
        access: "public",
        addRandomSuffix: false,
      });
      await pool.query(`INSERT INTO photos (url, alt) VALUES ($1, $2)`, [blob.url, altFromFilename(file.name)]);
    } catch {
      uploadFailed = true;
    }
  }

  revalidatePath("/admin/photos");
  revalidatePath("/photos");

  if (uploadFailed) {
    return { error: "Some photos failed to upload. Please try again for any that are missing." };
  }
  return { error: null };
}

export async function deletePhoto(id: string, url: string) {
  await requireAdminSession();

  try {
    await del(url);
  } catch {
    // Blob may already be gone (e.g. deleted manually) — still remove the
    // database row so the admin isn't stuck with an orphaned entry.
  }

  await pool.query(`DELETE FROM photos WHERE id = $1`, [id]);
  revalidatePath("/admin/photos");
  revalidatePath("/photos");
}
