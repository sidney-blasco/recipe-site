"use client";

import { deleteRecipe } from "./actions";

export default function DeleteRecipeButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deleteRecipe.bind(null, id)}
      onSubmit={(event) => {
        if (!confirm(`Delete "${title}"? This can't be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
