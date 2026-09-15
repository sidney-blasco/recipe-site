import { put } from "@vercel/blob";

// Returns the new image URL, `null` if no file was provided (keep existing),
// or throws if a file was provided but the upload failed.
export async function uploadImageIfProvided(
  formData: FormData,
  fieldName: string,
  pathPrefix: string
): Promise<string | null> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) return null;

  const blob = await put(`${pathPrefix}/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}
