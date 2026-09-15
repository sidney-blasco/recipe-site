"use client";

import { useActionState } from "react";
import type { TipFormState } from "./actions";

type TipFormProps = {
  formAction: (prevState: TipFormState, formData: FormData) => Promise<TipFormState>;
  submitLabel: string;
  initial?: {
    title: string;
    body: string;
    imageUrl: string | null;
  };
};

const initialState: TipFormState = { error: null };
const inputClass =
  "rounded-lg border border-plum/20 bg-white/70 px-3 py-2 text-ink placeholder:text-ink/40 focus:border-plum/50 focus:outline-none";

export default function TipForm({ formAction, submitLabel, initial }: TipFormProps) {
  const [state, action, pending] = useActionState(formAction, initialState);

  return (
    <form action={action} encType="multipart/form-data" className="flex flex-col gap-6">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold text-plum">Title</span>
        <input name="title" defaultValue={initial?.title} required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold text-plum">Body</span>
        <textarea
          name="body"
          defaultValue={initial?.body}
          required
          rows={10}
          placeholder="Write the tip here. Leave a blank line between paragraphs."
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold text-plum">Photo (optional)</span>
        <div className="flex flex-col gap-3">
          {initial?.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={initial.imageUrl}
              alt="Current tip photo"
              className="h-32 w-32 rounded-lg object-cover"
            />
          )}
          <input
            type="file"
            name="image"
            accept="image/*"
            className="text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-lavender file:px-4 file:py-2 file:text-sm file:font-semibold file:text-plum"
          />
          {initial?.imageUrl && (
            <p className="text-xs text-ink/50">Choose a new file to replace the current photo, or leave blank to keep it.</p>
          )}
        </div>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-plum px-6 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
