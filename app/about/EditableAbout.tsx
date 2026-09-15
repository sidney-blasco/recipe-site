"use client";

import { useState } from "react";
import EditModeBar from "../components/EditModeBar";
import EditablePhoto from "../components/EditablePhoto";
import type { AboutContent } from "../lib/about";
import { updateAboutInline } from "./actions";

const inputClass =
  "w-full rounded-lg border border-plum/20 bg-white/70 px-3 py-2 text-ink placeholder:text-ink/40 focus:border-plum/50 focus:outline-none";

function PlaceholderPortrait() {
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
        className="h-16 w-16 text-plum/40"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    </div>
  );
}

export default function EditableAbout({ about: initialAbout, isAdmin }: { about: AboutContent; isAdmin: boolean }) {
  const [saved, setSaved] = useState(initialAbout);
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(initialAbout.body);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setBody(saved.body);
    setImageFile(null);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setBody(saved.body);
    setImageFile(null);
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set("body", body);
    if (imageFile) formData.set("image", imageFile);

    const result = await updateAboutInline(formData);
    setSaving(false);

    if (result.error || !result.about) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSaved(result.about);
    setBody(result.about.body);
    setImageFile(null);
    setEditing(false);
  }

  const displayBody = editing ? body : saved.body;
  const paragraphs = displayBody.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start lg:gap-12">
        <div className="mx-auto w-56 sm:w-64 lg:mx-0 lg:w-full">
          <EditablePhoto
            editing={editing}
            imageUrl={saved.imageUrl}
            alt="Sid"
            aspectClassName="aspect-[4/5]"
            placeholder={<PlaceholderPortrait />}
            onFileSelected={setImageFile}
          />
          {!saved.imageUrl && !editing && (
            <p className="mt-2 text-center text-xs text-ink/40 lg:text-left">Photo coming soon</p>
          )}
        </div>

        <div className="mt-8 lg:mt-0">
          {editing ? (
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={10}
              className={`${inputClass} text-lg`}
            />
          ) : (
            <div className="flex flex-col gap-4 text-lg text-ink/80">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <EditModeBar editing={editing} saving={saving} error={error} onToggle={startEditing} onSave={save} onCancel={cancel} />
      )}
    </>
  );
}
