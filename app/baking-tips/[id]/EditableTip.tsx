"use client";

import { useState } from "react";
import EditModeBar from "../../components/EditModeBar";
import EditablePhoto from "../../components/EditablePhoto";
import { formatDate } from "../../lib/format-date";
import type { Tip } from "../../lib/tips";
import { updateTipInline } from "./actions";

const inputClass = "field";

function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-stone">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-14 w-14 text-ink-faded/50"
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
      <p className="sc mt-8 mb-2 text-center text-[1.05rem]">{formatDate(saved.createdAt)}</p>

      {editing ? (
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={`${inputClass} display text-center text-h1 leading-[1.02]`}
        />
      ) : (
        <h1 className="m-0 text-center text-h1 leading-[1.02]">{saved.title}</h1>
      )}

      <figure className="mt-8 mb-0 rounded-panel bg-mat p-[clamp(.9rem,2.5vw,1.6rem)]">
        <EditablePhoto
          editing={editing}
          imageUrl={saved.imageUrl}
          alt={saved.title}
          aspectClassName="aspect-[3/2]"
          placeholder={<PlaceholderImage />}
          onFileSelected={setImageFile}
        />
      </figure>

      {editing ? (
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={12}
          placeholder="Write the tip here. Leave a blank line between paragraphs."
          className={`${inputClass} mt-8`}
        />
      ) : (
        <div className="panel mt-8 bg-sage">
          <div className="mx-auto max-w-measure">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className={`mt-0 mb-[1.1rem] last:mb-0 ${index === 0 ? "drop-cap" : ""}`}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <EditModeBar editing={editing} saving={saving} error={error} onToggle={startEditing} onSave={save} onCancel={cancel} />
      )}
    </>
  );
}
