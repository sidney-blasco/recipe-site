"use client";

import { useActionState, useState } from "react";
import { TAG_VOCABULARY } from "../../lib/filters";
import type { RecipeIngredient } from "../../lib/recipes";
import type { RecipeFormState } from "./actions";

type IngredientRow = { name: string; amount: string; unit: string };

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
};

type RecipeFormProps = {
  formAction: (prevState: RecipeFormState, formData: FormData) => Promise<RecipeFormState>;
  submitLabel: string;
  initial?: RecipeFormInitial;
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

export default function RecipeForm({ formAction, submitLabel, initial }: RecipeFormProps) {
  const [state, action, pending] = useActionState(formAction, initialState);

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initial && initial.ingredients.length > 0
      ? initial.ingredients.map((ingredient) => ({
          name: ingredient.name,
          amount: ingredient.amount ?? "",
          unit: ingredient.unit ?? "",
        }))
      : [{ name: "", amount: "", unit: "" }]
  );

  const [steps, setSteps] = useState<string[]>(
    initial && initial.instructions.length > 0 ? initial.instructions : [""]
  );

  function updateIngredient(index: number, field: keyof IngredientRow, value: string) {
    setIngredients((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addIngredient() {
    setIngredients((rows) => [...rows, { name: "", amount: "", unit: "" }]);
  }

  function removeIngredient(index: number) {
    setIngredients((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));
  }

  function updateStep(index: number, value: string) {
    setSteps((rows) => rows.map((row, i) => (i === index ? value : row)));
  }

  function addStep() {
    setSteps((rows) => [...rows, ""]);
  }

  function removeStep(index: number) {
    setSteps((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));
  }

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

      <section>
        <h2 className="font-display text-xl text-plum">Ingredients</h2>
        <div className="mt-3 flex flex-col gap-2">
          {ingredients.map((row, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <input
                name="ingredientAmount"
                value={row.amount}
                onChange={(event) => updateIngredient(index, "amount", event.target.value)}
                placeholder="Amount"
                className={`${inputClass} w-20`}
              />
              <input
                name="ingredientUnit"
                value={row.unit}
                onChange={(event) => updateIngredient(index, "unit", event.target.value)}
                placeholder="Unit"
                className={`${inputClass} w-24`}
              />
              <input
                name="ingredientName"
                value={row.name}
                onChange={(event) => updateIngredient(index, "name", event.target.value)}
                placeholder="Ingredient name"
                className={`${inputClass} min-w-0 flex-1`}
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
                className="rounded-full border border-plum/20 px-3 py-1.5 text-xs font-semibold text-ink/60 transition-colors hover:bg-lavender disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-3 rounded-full border border-plum/30 px-4 py-1.5 text-sm font-semibold text-plum transition-colors hover:bg-lavender"
        >
          + Add Ingredient
        </button>
      </section>

      <section>
        <h2 className="font-display text-xl text-plum">Instructions</h2>
        <div className="mt-3 flex flex-col gap-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-plum text-sm font-semibold text-cream">
                {index + 1}
              </span>
              <textarea
                name="instructionStep"
                value={step}
                onChange={(event) => updateStep(index, event.target.value)}
                rows={2}
                className={`${inputClass} min-w-0 flex-1`}
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                disabled={steps.length === 1}
                className="mt-2 rounded-full border border-plum/20 px-3 py-1.5 text-xs font-semibold text-ink/60 transition-colors hover:bg-lavender disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-3 rounded-full border border-plum/30 px-4 py-1.5 text-sm font-semibold text-plum transition-colors hover:bg-lavender"
        >
          + Add Step
        </button>
      </section>

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
