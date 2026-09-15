"use client";

import { deletePhoto } from "./actions";

export default function DeletePhotoButton({ id, url, alt }: { id: string; url: string; alt: string }) {
  return (
    <form
      action={deletePhoto.bind(null, id, url)}
      onSubmit={(event) => {
        if (!confirm(`Delete "${alt}"? This can't be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="w-full rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
