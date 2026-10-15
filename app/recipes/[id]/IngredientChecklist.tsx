"use client";

import { useState } from "react";
import type { RecipeIngredient } from "../../lib/recipe-format";

export default function IngredientChecklist({ ingredients }: { ingredients: RecipeIngredient[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <ul className="mt-4 max-w-measure">
      {ingredients.map((ingredient, index) => {
        const isChecked = checked.has(index);
        const quantity = [ingredient.amount, ingredient.unit].filter(Boolean).join(" ");
        return (
          <li key={index} className="dotted-rule">
            <label className="grid cursor-pointer grid-cols-[1.05rem_5rem_1fr] items-baseline gap-x-3 py-1.5 sm:grid-cols-[1.05rem_6.5rem_1fr]">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(index)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="flex size-[1.05rem] translate-y-[.15em] items-center justify-center self-start rounded-[5px] border border-wine/60 bg-ground text-ground transition-colors duration-200 peer-checked:border-wine peer-checked:bg-wine peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine"
              >
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-2.5">
                  <path d="M2.5 6.2 5 8.5l4.5-5" />
                </svg>
              </span>
              <span className={isChecked ? "text-ink-faded line-through" : "text-wine"}>{quantity}</span>
              <span className={isChecked ? "text-ink-faded line-through" : "text-ink"}>{ingredient.name}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
