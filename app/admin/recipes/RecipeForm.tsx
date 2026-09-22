"use client";

import { useActionState, useState } from "react";
import { TAG_VOCABULARY } from "../../lib/filters";
import { formatIngredientLine, type RecipeIngredient } from "../../lib/recipe-format";
import IngredientNutrition from "./IngredientNutrition";
import type { RecipeFormState } from "./actions";

type RecipeFormInitial = {
  title: string;
  cuisine: string;
  mealType: string;
  dietary: string[];
  occasion: string[];
  seasonal: string[];
  skillLevel: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageUrl: string | null;
  description: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  notes: string;
  parentRecipeId: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sugarG: number | null;
};

type RecipeOption = { id: string; title: string };

type RecipeFormProps = {
  formAction: (prevState: RecipeFormState, formData: FormData) => Promise<RecipeFormState>;
  submitLabel: string;
  initial?: RecipeFormInitial;
  recipeOptions: RecipeOption[];
};

const initialState: RecipeFormState = { error: null };
const inputClass =
  "rounded-lg border border-plum/20 bg-white/70 px-3 py-2 text-ink placeholder:text-ink/40 focus:border-plum/50 focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold text-plum">{label}</span>
      {children}
    </label>
  );
}

function CheckboxGroup({
  label,
  name,
  options,
  defaultValues,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValues: string[];
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold uppercase tracking-wide text-plum">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={defaultValues.includes(option)}
              className="h-4 w-4 rounded border-plum/40 text-plum accent-plum"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function RecipeForm({ formAction, submitLabel, initial, recipeOptions }: RecipeFormProps) {
  const [state, action, pending] = useActionState(formAction, initialState);
  const [servings, setServings] = useState(initial?.servings ?? "");

  const ingredientsText = initial?.ingredients.map(formatIngredientLine).join("\n") ?? "";
  const instructionsText = initial?.instructions.join("\n") ?? "";

  return (
    <form action={action} encType="multipart/form-data" className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input name="title" defaultValue={initial?.title} required className={inputClass} />
        </Field>
        <Field label="Cuisine">
          <input name="cuisine" defaultValue={initial?.cuisine} placeholder="e.g. Italian" className={inputClass} />
        </Field>
        <Field label="Type">
          <input
            name="type"
            defaultValue={initial?.mealType}
            placeholder="e.g. Breakfast, Main, Side, Drink, Dessert"
            className={inputClass}
          />
        </Field>
        <Field label="Skill Level">
          <select name="skillLevel" defaultValue={initial?.skillLevel ?? ""} className={inputClass}>
            <option value="">— None —</option>
            {TAG_VOCABULARY.skillLevel.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Parent Recipe">
          <select name="parentRecipeId" defaultValue={initial?.parentRecipeId ?? ""} className={inputClass}>
            <option value="">— None —</option>
            {recipeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-ink/50">Marks this recipe as a variation of another one.</p>
        </Field>
      </div>

      <Field label="Description">
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={4}
          placeholder="A short intro shown at the top of the recipe page — the story behind it, why you make it, what makes it work."
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Prep Time">
          <input name="prepTime" defaultValue={initial?.prepTime} placeholder="15 min" className={inputClass} />
        </Field>
        <Field label="Cook Time">
          <input name="cookTime" defaultValue={initial?.cookTime} placeholder="30 min" className={inputClass} />
        </Field>
        <Field label="Total Time">
          <input name="totalTime" defaultValue={initial?.totalTime} placeholder="45 min" className={inputClass} />
        </Field>
        <Field label="Servings">
          <input
            name="servings"
            value={servings}
            onChange={(event) => setServings(event.target.value)}
            placeholder="4"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-6">
        <CheckboxGroup
          label="Dietary"
          name="dietary"
          options={TAG_VOCABULARY.dietary}
          defaultValues={initial?.dietary ?? []}
        />
        <CheckboxGroup
          label="Occasion"
          name="occasion"
          options={TAG_VOCABULARY.occasion}
          defaultValues={initial?.occasion ?? []}
        />
        <CheckboxGroup
          label="Seasonal"
          name="seasonal"
          options={TAG_VOCABULARY.seasonal}
          defaultValues={initial?.seasonal ?? []}
        />
      </div>

      <IngredientNutrition initialIngredientsText={ingredientsText} servings={servings} />

      <Field label="Instructions">
        <textarea
          name="instructionsText"
          defaultValue={instructionsText}
          rows={10}
          placeholder={"Preheat the oven to 350°F.\nMix the dry ingredients.\nBake for 25 minutes."}
          className={inputClass}
        />
        <p className="text-xs text-ink/50">One step per line — no numbers needed, they&apos;re added automatically.</p>
      </Field>

      <Field label="Notes">
        <textarea
          name="notes"
          defaultValue={initial?.notes}
          rows={5}
          placeholder="Tips, substitutions, storage instructions, etc."
          className={inputClass}
        />
      </Field>

      <Field label="Photo">
        <div className="flex flex-col gap-3">
          {initial?.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={initial.imageUrl}
              alt="Current recipe photo"
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
      </Field>

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
