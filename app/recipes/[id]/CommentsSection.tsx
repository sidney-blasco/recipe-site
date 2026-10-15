"use client";

import { useState } from "react";
import { formatDate } from "../../lib/format-date";
import type { Comment } from "../../lib/comments";
import { submitComment } from "./actions";

const inputClass = "field";

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
    <div className="flex gap-0.5 text-ochre" aria-label={`${rating} out of 5 stars`}>
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
    <section className="panel mt-10 bg-stone">
      <h2 className="m-0 text-h2 leading-[1.1]">Comments</h2>

      {comments.length > 0 ? (
        <ul className="mt-4 max-w-measure">
          {comments.map((c) => (
            <li key={c.id} className="dotted-rule py-5 last:bg-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="display m-0 text-[1.2rem] text-ink">{c.name}</p>
                <span className="text-small italic text-ink-faded">{formatDate(c.createdAt)}</span>
              </div>
              <div className="mt-1">
                <StarDisplay rating={c.rating} />
              </div>
              <p className="mt-2 mb-0">{c.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 italic text-ink-faded">No comments yet. Be the first to leave one.</p>
      )}

      <hr aria-hidden="true" className="dots mt-8" />
      <form onSubmit={handleSubmit} className="mt-8 flex max-w-measure flex-col gap-4">
        <h3 className="display-it m-0 text-h4 leading-tight">Leave a comment</h3>

        <label className="flex flex-col gap-1.5">
          <span className="sc">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className={inputClass}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="sc">Rating (optional)</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating((current) => (current === n ? null : n))}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                aria-pressed={rating != null && n <= rating}
                className="rounded-full text-ochre transition-colors duration-200 hover:text-wine"
              >
                <Star filled={rating != null && n <= rating} />
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="sc">Comment</span>
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            required
            rows={4}
            className={inputClass}
          />
        </label>

        {error && <p className="m-0 text-small text-wine">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="btn-primary self-start"
        >
          {pending ? "Posting…" : "Post Comment"}
        </button>
      </form>
    </section>
  );
}
