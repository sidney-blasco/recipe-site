"use client";

import { useState } from "react";
import Link from "next/link";
import EditModeBar from "../../components/EditModeBar";
import EditablePhoto from "../../components/EditablePhoto";
import { CornerCurls } from "../../components/Ornaments";
import IngredientChecklist from "./IngredientChecklist";
import { formatIngredientLine } from "../../lib/recipe-format";
import type { RecipeDetail, RecipeOption } from "../../lib/recipes";
import { updateRecipeInline } from "./actions";

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
  parentRecipeId: string;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  fiberG: string;
  sugarG: string;
};

const NUTRITION_FIELDS = [
  { key: "calories", label: "Calories", suffix: "" },
  { key: "proteinG", label: "Protein", suffix: "g" },
  { key: "carbsG", label: "Carbs", suffix: "g" },
  { key: "fatG", label: "Fat", suffix: "g" },
  { key: "fiberG", label: "Fiber", suffix: "g" },
  { key: "sugarG", label: "Sugar", suffix: "g" },
] as const;

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
    parentRecipeId: recipe.parentRecipeId ?? "",
    calories: recipe.calories !== null ? String(recipe.calories) : "",
    proteinG: recipe.proteinG !== null ? String(recipe.proteinG) : "",
    carbsG: recipe.carbsG !== null ? String(recipe.carbsG) : "",
    fatG: recipe.fatG !== null ? String(recipe.fatG) : "",
    fiberG: recipe.fiberG !== null ? String(recipe.fiberG) : "",
    sugarG: recipe.sugarG !== null ? String(recipe.sugarG) : "",
  };
}

export default function EditableRecipe({
  recipe: initialRecipe,
  dietaryTags,
  isAdmin,
  recipeOptions,
}: {
  recipe: RecipeDetail;
  dietaryTags: string[];
  isAdmin: boolean;
  recipeOptions: RecipeOption[];
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
    formData.set("parentRecipeId", draft.parentRecipeId);
    formData.set("calories", draft.calories);
    formData.set("proteinG", draft.proteinG);
    formData.set("carbsG", draft.carbsG);
    formData.set("fatG", draft.fatG);
    formData.set("fiberG", draft.fiberG);
    formData.set("sugarG", draft.sugarG);
    if (imageFile) formData.set("image", imageFile);

    try {
      const result = await updateRecipeInline(saved.id, formData);

      if (result.error || !result.recipe) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSaved(result.recipe);
      setDraft(toDraft(result.recipe));
      setImageFile(null);
      setEditing(false);
    } catch (error) {
      // Errors that never reach our server action's own try/catch — e.g. the
      // request body (photo) exceeding Next's Server Action size limit —
      // reject here instead of returning {error}. Without this catch, the
      // button was left stuck on "Saving…" forever with no feedback.
      console.error("Recipe save failed", error);
      setError(
        error instanceof Error && /body exceeded/i.test(error.message)
          ? "That photo is too large. Try a smaller image (under ~4MB)."
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const displayDescription = editing ? draft.description : saved.description;
  const descriptionParagraphs = displayDescription
    ? displayDescription.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [];

  const category = saved.cuisine ?? saved.mealType;

  const FACT_FIELDS = [
    { key: "prepTime", label: "Prep Time", placeholder: "15 min" },
    { key: "cookTime", label: "Cook Time", placeholder: "30 min" },
    { key: "totalTime", label: "Total Time", placeholder: "45 min" },
    { key: "servings", label: "Servings", placeholder: "4" },
  ] as const;

  const visibleFacts = editing ? FACT_FIELDS : FACT_FIELDS.filter((field) => Boolean(saved[field.key]));
  const showNoteCard = !editing && Boolean(saved.notes);

  return (
    <>
      {/* Header + intro, on the page ground */}
      <header className="mt-8 text-center">
        {category && <span className="sc mb-2 block text-[1.05rem]">{category}</span>}
        {editing ? (
          <input
            value={draft.title}
            onChange={(event) => update("title", event.target.value)}
            className={`${inputClass} display text-center text-h1 leading-[1.02]`}
          />
        ) : (
          <h1 className="m-0 text-h1 leading-[1.02]">{saved.title}</h1>
        )}
        <p className="sc mt-3">Convivial · Sid</p>

        {editing ? (
          <label className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="sc">Parent recipe</span>
            <select
              value={draft.parentRecipeId}
              onChange={(event) => update("parentRecipeId", event.target.value)}
              className={`${inputClass} w-auto py-1.5`}
            >
              <option value="">— None —</option>
              {recipeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>
        ) : (
          saved.parentRecipeTitle && (
            <p className="mt-2 text-ink-faded">
              Part of{" "}
              <Link href={`/recipes/${saved.parentRecipeId}`} className="display-it text-[1.15rem]">
                {saved.parentRecipeTitle}
              </Link>
            </p>
          )
        )}
      </header>

      <figure className="mt-8 rounded-panel bg-mat p-[clamp(.9rem,2.5vw,1.6rem)] transition-colors duration-300">
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
          value={draft.description}
          onChange={(event) => update("description", event.target.value)}
          rows={4}
          placeholder="A short intro shown at the top of the recipe page."
          className={`${inputClass} mt-8`}
        />
      ) : (
        descriptionParagraphs.length > 0 && (
          <div className="mx-auto mt-8 max-w-measure">
            {descriptionParagraphs.map((paragraph, index) => (
              <p key={index} className={`mb-[1.1rem] ${index === 0 ? "drop-cap" : ""}`}>
                {paragraph}
              </p>
            ))}
          </div>
        )
      )}

      {/* The recipe card */}
      <article className="panel mt-10 bg-stone">
        <CornerCurls />

        <header className="text-center">
          <span className="sc mb-1 block text-[1.05rem]">The recipe</span>
          <h2 className="m-0 text-h2 leading-[1.1]">{saved.title}</h2>
          {displayDescription && (
            <p className="display-it mx-auto mt-3 max-w-[30rem] text-[1.25rem] leading-snug text-ink-faded">
              {displayDescription}
            </p>
          )}
        </header>

        {visibleFacts.length > 0 && (
          <dl className="mt-7 flex flex-wrap justify-center gap-3">
            {visibleFacts.map((field) => (
              <div key={field.key} className="rounded-pill bg-ground px-5 py-2 text-center">
                <dt className="sc inline">{field.label}</dt>
                {editing ? (
                  <input
                    value={draft[field.key]}
                    onChange={(event) => update(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    aria-label={field.label}
                    className={`${inputClass} ml-2 inline-block w-24 px-2 py-0.5 text-center`}
                  />
                ) : (
                  <dd className="ml-2 inline">{saved[field.key]}</dd>
                )}
              </div>
            ))}
          </dl>
        )}

        {(editing || NUTRITION_FIELDS.some((field) => saved[field.key] !== null)) && (
          <div className="mt-6 text-center">
            <h3 className="sc m-0 text-[1.05rem]">Nutrition, per serving</h3>
            {editing ? (
              <div className="mt-3 grid grid-cols-2 gap-4 text-left sm:grid-cols-3">
                {NUTRITION_FIELDS.map((field) => (
                  <label key={field.key} className="flex flex-col gap-1.5">
                    <span className="sc">
                      {field.label}
                      {field.suffix && ` (${field.suffix})`}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step={field.key === "calories" ? "1" : "0.1"}
                      value={draft[field.key]}
                      onChange={(event) => update(field.key, event.target.value)}
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>
            ) : (
              <dl className="mt-2 flex flex-wrap justify-center gap-2">
                {NUTRITION_FIELDS.filter((field) => saved[field.key] !== null).map((field) => (
                  <div key={field.key} className="rounded-pill bg-blush px-3.5 py-1 text-small">
                    <dt className="sc inline">{field.label}</dt>
                    <dd className="ml-1.5 inline">
                      {saved[field.key]}
                      {field.suffix}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}

        {dietaryTags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {dietaryTags.map((tag) => (
              <span key={tag} className="rounded-pill bg-ground px-3.5 py-1 text-small text-olive">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          className={`mt-10 grid grid-cols-1 gap-x-10 ${showNoteCard ? "lg:grid-cols-[minmax(0,1fr)_12rem]" : ""}`}
        >
          <section className="min-w-0">
            <h3 className="m-0 text-h3 leading-[1.1]">Ingredients</h3>
            {editing ? (
              <textarea
                value={draft.ingredientsText}
                onChange={(event) => update("ingredientsText", event.target.value)}
                rows={10}
                placeholder={"2 cups flour\n1 tsp salt\n3 eggs"}
                className={`${inputClass} mt-4`}
              />
            ) : saved.ingredients.length > 0 ? (
              <IngredientChecklist ingredients={saved.ingredients} />
            ) : (
              <p className="mt-4 text-small italic text-ink-faded">No ingredients listed yet.</p>
            )}
          </section>

          {/* Cook's note: margin column on desktop, inline below ingredients on mobile */}
          {showNoteCard && (
            <aside
              aria-label="Cook’s note"
              className="mt-8 ml-3 max-w-[18rem] -rotate-[1.5deg] self-start rounded-[18px_22px_16px_24px] bg-ground px-[1.1rem] pt-[1.2rem] pb-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-16 lg:ml-0 lg:max-w-none"
            >
              <p className="m-0 whitespace-pre-line font-hand text-base leading-[1.95] text-pen">{saved.notes}</p>
            </aside>
          )}

          <section className="mt-12 min-w-0">
            <h3 className="m-0 text-h3 leading-[1.1]">Instructions</h3>
            {editing ? (
              <textarea
                value={draft.instructionsText}
                onChange={(event) => update("instructionsText", event.target.value)}
                rows={10}
                placeholder={"Preheat the oven.\nMix everything.\nBake for 20 minutes."}
                className={`${inputClass} mt-4`}
              />
            ) : saved.instructions.length > 0 ? (
              <ol className="mt-4 max-w-measure list-none p-0">
                {saved.instructions.map((step, index) => (
                  <li key={index} className="dotted-rule grid grid-cols-[2.25rem_1fr] gap-3 py-4 last:bg-none">
                    <span className="display text-[1.6rem] leading-none text-wine">{index + 1}</span>
                    <p className="m-0">{step}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-small italic text-ink-faded">No instructions listed yet.</p>
            )}
          </section>
        </div>

        {editing && (
          <section className="mt-10">
            <h3 className="m-0 text-h3 leading-[1.1]">Notes</h3>
            <textarea
              value={draft.notes}
              onChange={(event) => update("notes", event.target.value)}
              rows={5}
              placeholder="Tips, substitutions, storage instructions, etc."
              className={`${inputClass} mt-3`}
            />
          </section>
        )}
      </article>

      {isAdmin && (
        <EditModeBar editing={editing} saving={saving} error={error} onToggle={startEditing} onSave={save} onCancel={cancel} />
      )}
    </>
  );
}
