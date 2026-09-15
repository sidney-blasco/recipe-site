"use client";

import { useActionState } from "react";
import { uploadPhotos, type PhotoFormState } from "./actions";

const initialState: PhotoFormState = { error: null };

export default function UploadPhotosForm() {
  const [state, action, pending] = useActionState(uploadPhotos, initialState);

  return (
    <form action={action} encType="multipart/form-data" className="flex flex-wrap items-center gap-4">
      <input
        type="file"
        name="images"
        accept="image/*"
        multiple
        required
        className="text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-lavender file:px-4 file:py-2 file:text-sm file:font-semibold file:text-plum"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Uploading…" : "Upload"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
