"use client";

import { useState } from "react";
import EditModeBar from "../../components/EditModeBar";
import EditablePhoto from "../../components/EditablePhoto";
import { formatDate } from "../../lib/format-date";
import type { Tip } from "../../lib/tips";
import { updateTipInline } from "./actions";

const inputClass =
  "w-full rounded-lg border border-plum/20 bg-white/70 px-3 py-2 text-ink placeholder:text-ink/40 focus:border-plum/50 focus:outline-none";

function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lavender to-mauve/40">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-14 w-14 text-plum/40"
        aria-hidden="true"
      >
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a6 6 0 0 0-4 10.5c.6.5 1 1.2 1 2.1V16h6v-1.4c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 2Z" />
      </svg>
    </div>
  );
}

export default function EditableTip({ tip: initialTip, isAdmin }: { tip: Tip; isAdmin: boolean }) {
  const [saved, setSaved] = useState(initialTip);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTip.title);
  const [body, setBody] = useState(initialTip.body);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setTitle(saved.title);
    setBody(saved.body);
    setImageFile(null);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setTitle(saved.title);
    setBody(saved.body);
    setImageFile(null);
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("body", body);
    if (imageFile) formData.set("image", imageFile);

    const result = await updateTipInline(saved.id, formData);
    setSaving(false);

    if (result.error || !result.tip) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSaved(result.tip);
    setTitle(result.tip.title);
    setBody(result.tip.body);
    setImageFile(null);
    setEditing(false);
  }

  const displayBody = editing ? body : saved.body;
  const paragraphs = displayBody.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-mauve">
        {formatDate(saved.createdAt)}
      </p>

      {editing ? (
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={`${inputClass} mt-2 font-display text-4xl sm:text-5xl`}
        />
      ) : (
        <h1 className="mt-2 text-4xl sm:text-5xl">{saved.title}</h1>
      )}

      <div className="mt-8">
        <EditablePhoto
          editing={editing}
          imageUrl={saved.imageUrl}
          alt={saved.title}
          aspectClassName="aspect-[16/9]"
          placeholder={<PlaceholderImage />}
          onFileSelected={setImageFile}
        />
      </div>

      {editing ? (
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={12}
          placeholder="Write the tip here. Leave a blank line between paragraphs."
          className={`${inputClass} mt-8 text-lg`}
        />
      ) : (
        <div className="mt-8 flex flex-col gap-4 text-lg text-ink/85">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      {isAdmin && (
        <EditModeBar editing={editing} saving={saving} error={error} onToggle={startEditing} onSave={save} onCancel={cancel} />
      )}
    </>
  );
}
