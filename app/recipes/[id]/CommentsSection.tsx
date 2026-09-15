"use client";

import { useState } from "react";
import type { Comment } from "../../lib/comments";
import { submitComment } from "./actions";

const inputClass =
  "rounded-lg border border-plum/20 bg-white/70 px-3 py-2 text-ink placeholder:text-ink/40 focus:border-plum/50 focus:outline-none";

function formatCommentDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M10 2l2.36 4.78 5.28.77-3.82 3.72.9 5.26L10 14.9l-4.72 2.63.9-5.26L2.36 7.55l5.28-.77L10 2z" />
    </svg>
  );
}

function StarDisplay({ rating }: { rating: number | null }) {
  if (rating == null) return null;
  return (
    <div className="flex gap-0.5 text-mauve" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= rating} />
      ))}
    </div>
  );
}

export default function CommentsSection({
  recipeId,
  initialComments,
}: {
  recipeId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("comment", commentText);
    if (rating != null) formData.set("rating", String(rating));

    const result = await submitComment(recipeId, formData);
    setPending(false);

    if (result.error || !result.comment) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setComments((prev) => [result.comment as Comment, ...prev]);
    setName("");
    setRating(null);
    setCommentText("");
  }

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl text-plum">Comments</h2>

      {comments.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-6">
          {comments.map((c) => (
            <li key={c.id} className="border-b border-plum/10 pb-6 last:border-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-plum">{c.name}</p>
                <span className="text-xs text-ink/50">{formatCommentDate(c.createdAt)}</span>
              </div>
              <div className="mt-1">
                <StarDisplay rating={c.rating} />
              </div>
              <p className="mt-2 text-ink/85">{c.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-ink/60">No comments yet. Be the first to leave one.</p>
      )}

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4 border-t border-plum/10 pt-8">
        <h3 className="font-display text-lg text-plum">Leave a Comment</h3>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-plum">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className={inputClass}
          />
        </label>

        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-plum">Rating (optional)</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating((current) => (current === n ? null : n))}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                aria-pressed={rating != null && n <= rating}
                className="text-mauve transition-transform hover:scale-110"
              >
                <Star filled={rating != null && n <= rating} />
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-plum">Comment</span>
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            required
            rows={4}
            className={inputClass}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-full bg-plum px-6 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Posting…" : "Post Comment"}
        </button>
      </form>
    </section>
  );
}
