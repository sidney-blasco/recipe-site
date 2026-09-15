"use client";

import { useEffect, useRef, useState } from "react";

type EditablePhotoProps = {
  editing: boolean;
  imageUrl: string | null;
  alt: string;
  aspectClassName: string;
  placeholder: React.ReactNode;
  onFileSelected: (file: File | null) => void;
};

export default function EditablePhoto({
  editing,
  imageUrl,
  alt,
  aspectClassName,
  placeholder,
  onFileSelected,
}: EditablePhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Revoke the object URL when it's replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    onFileSelected(file);
  }

  const displayUrl = previewUrl ?? imageUrl;

  return (
    <div
      role={editing ? "button" : undefined}
      tabIndex={editing ? 0 : undefined}
      onClick={() => editing && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (editing && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`relative w-full overflow-hidden rounded-2xl bg-lavender ${aspectClassName} ${editing ? "cursor-pointer" : ""}`}
    >
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        placeholder
      )}

      {editing && (
        <div className="absolute inset-0 flex items-end justify-center pb-3">
          <span className="rounded-full bg-ink/70 px-4 py-1.5 text-xs font-semibold text-cream">
            Click to replace photo
          </span>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </div>
  );
}
