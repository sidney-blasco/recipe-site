"use client";

type EditModeBarProps = {
  editing: boolean;
  saving: boolean;
  error: string | null;
  onToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditModeBar({ editing, saving, error, onToggle, onSave, onCancel }: EditModeBarProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {error && <p className="max-w-xs rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 shadow-md">{error}</p>}

      {editing ? (
        <div className="flex items-center gap-2 rounded-full border border-plum/20 bg-white/95 p-1.5 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink/70 transition-colors hover:bg-lavender disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-full bg-plum px-5 py-2 text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 rounded-full bg-plum px-5 py-3 text-sm font-semibold text-cream shadow-lg transition-opacity hover:opacity-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Edit Mode
        </button>
      )}
    </div>
  );
}
