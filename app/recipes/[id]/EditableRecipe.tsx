"use client";

import { useState } from "react";
import EditModeBar from "../../components/EditModeBar";
import EditablePhoto from "../../components/EditablePhoto";
import IngredientChecklist from "./IngredientChecklist";
import { formatIngredientLine } from "../../lib/recipe-format";
import type { RecipeDetail } from "../../lib/recipes";
import { updateRecipeInline } from "./actions";

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
        <path d="M7 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
        <path d="M9 12v9" />
        <path d="M17 3c-1.1 0-2 1.34-2 3v4c0 1.1.9 2 2 2s2-.9 2-2V6c0-1.66-.9-3-2-3Z" />
        <path d="M17 12v9" />
      </svg>
    </div>
  );
}

type Draft = {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  ingredientsText: string;
  instructionsText: string;
  notes: string;
};

function toDraft(recipe: RecipeDetail): Draft {
  return {
    title: recipe.title,
    description: recipe.description ?? "",
    prepTime: recipe.prepTime ?? "",
    cookTime: recipe.cookTime ?? "",
    totalTime: recipe.totalTime ?? "",
    servings: recipe.servings ?? "",
    ingredientsText: recipe.ingredients.map(formatIngredientLine).join("\n"),
    instructionsText: recipe.instructions.join("\n"),
    notes: recipe.notes ?? "",
  };
}

export default function EditableRecipe({
  recipe: initialRecipe,
  dietaryTags,
  isAdmin,
}: {
  recipe: RecipeDetail;
  dietaryTags: string[];
  isAdmin: boolean;
}) {
  const [saved, setSaved] = useState(initialRecipe);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(initialRecipe));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function startEditing() {
    setDraft(toDraft(saved));
    setImageFile(null);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setDraft(toDraft(saved));
    setImageFile(null);
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set("title", draft.title);
    formData.set("description", draft.description);
    formData.set("prepTime", draft.prepTime);
    formData.set("cookTime", draft.cookTime);
    formData.set("totalTime", draft.totalTime);
    formData.set("servings", draft.servings);
    formData.set("ingredientsText", draft.ingredientsText);
    formData.set("instructionsText", draft.instructionsText);
    formData.set("notes", draft.notes);
    if (imageFile) formData.set("image", imageFile);

    const result = await updateRecipeInline(saved.id, formData);
    setSaving(false);

    if (result.error || !result.recipe) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSaved(result.recipe);
    setDraft(toDraft(result.recipe));
    setImageFile(null);
    setEditing(false);
  }

  const displayDescription = editing ? draft.description : saved.description;
  const descriptionParagraphs = displayDescription
    ? displayDescription.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [];

  const formattedIngredients = saved.ingredients.map(formatIngredientLine);

  const FACT_FIELDS = [
    { key: "prepTime", label: "Prep Time", placeholder: "15 min" },
    { key: "cookTime", label: "Cook Time", placeholder: "30 min" },
    { key: "totalTime", label: "Total Time", placeholder: "45 min" },
    { key: "servings", label: "Servings", placeholder: "4" },
  ] as const;

  const visibleFacts = editing ? FACT_FIELDS : FACT_FIELDS.filter((field) => Boolean(saved[field.key]));

  return (
    <>
      {editing ? (
        <input
          value={draft.title}
          onChange={(event) => update("title", event.target.value)}
          className={`${inputClass} mt-4 font-display text-4xl sm:text-5xl`}
        />
      ) : (
        <h1 className="mt-4 text-4xl sm:text-5xl">{saved.title}</h1>
      )}
      <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-mauve">Convivial · Sid</p>

      {editing ? (
        <textarea
          value={draft.description}
          onChange={(event) => update("description", event.target.value)}
          rows={4}
          placeholder="A short intro shown at the top of the recipe page."
          className={`${inputClass} mt-6 text-lg`}
        />
      ) : (
        descriptionParagraphs.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 text-lg text-ink/80">
            {descriptionParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )
      )}

      <div className="mt-10">
        <EditablePhoto
          editing={editing}
          imageUrl={saved.imageUrl}
          alt={saved.title}
          aspectClassName="aspect-[16/9]"
          placeholder={<PlaceholderImage />}
          onFileSelected={setImageFile}
        />
      </div>

      <div className="mt-10 rounded-2xl border-2 border-plum/20 bg-white/60 p-6 sm:p-8">
        <h2 className="text-center font-display text-3xl text-plum">{saved.title}</h2>

        {displayDescription && (
          <p className="mx-auto mt-3 max-w-xl text-center text-sm italic text-ink/70">{displayDescription}</p>
        )}

        {visibleFacts.length > 0 && (
          <dl className="mt-6 flex flex-wrap justify-center divide-x divide-plum/15 border-y border-plum/15 py-4">
            {visibleFacts.map((field) => (
              <div key={field.key} className="flex-1 px-2 text-center">
                <dt className="text-xs font-semibold uppercase tracking-wide text-mauve">{field.label}</dt>
                {editing ? (
                  <input
                    value={draft[field.key]}
                    onChange={(event) => update(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className="mt-1 w-full rounded border border-plum/20 bg-white/70 px-1.5 py-1 text-center text-sm text-ink focus:border-plum/50 focus:outline-none"
                  />
                ) : (
                  <dd className="mt-1 text-ink/85">{saved[field.key]}</dd>
                )}
              </div>
            ))}
          </dl>
        )}

        {dietaryTags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {dietaryTags.map((tag) => (
              <span key={tag} className="rounded-full bg-lavender px-3 py-1 text-xs font-semibold text-plum">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
          <section>
            <h3 className="font-display text-xl text-plum">Ingredients</h3>
            {editing ? (
              <textarea
                value={draft.ingredientsText}
                onChange={(event) => update("ingredientsText", event.target.value)}
                rows={10}
                placeholder={"2 cups flour\n1 tsp salt\n3 eggs"}
                className={`${inputClass} mt-4`}
              />
            ) : formattedIngredients.length > 0 ? (
              <IngredientChecklist ingredients={formattedIngredients} />
            ) : (
              <p className="mt-4 text-sm text-ink/60">No ingredients listed yet.</p>
            )}
          </section>

          <section>
            <h3 className="font-display text-xl text-plum">Instructions</h3>
            {editing ? (
              <textarea
                value={draft.instructionsText}
                onChange={(event) => update("instructionsText", event.target.value)}
                rows={10}
                placeholder={"Preheat the oven.\nMix everything.\nBake for 20 minutes."}
                className={`${inputClass} mt-4`}
              />
            ) : saved.instructions.length > 0 ? (
              <ol className="mt-4 flex list-none flex-col gap-5">
                {saved.instructions.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-plum text-sm font-semibold text-cream">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-ink/85">{step}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-ink/60">No instructions listed yet.</p>
            )}
          </section>
        </div>

        {(editing || saved.notes) && (
          <section className="mt-10 border-t border-plum/15 pt-6">
            <h3 className="font-display text-xl text-plum">Notes</h3>
            {editing ? (
              <textarea
                value={draft.notes}
                onChange={(event) => update("notes", event.target.value)}
                rows={5}
                placeholder="Tips, substitutions, storage instructions, etc."
                className={`${inputClass} mt-3`}
              />
            ) : (
              <p className="mt-3 whitespace-pre-line text-ink/85">{saved.notes}</p>
            )}
          </section>
        )}
      </div>

      {isAdmin && (
        <EditModeBar editing={editing} saving={saving} error={error} onToggle={startEditing} onSave={save} onCancel={cancel} />
      )}
    </>
  );
}
