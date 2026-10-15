"use client";

import { useState } from "react";
import CheckBox from "../../components/CheckBox";
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
              <CheckBox className="translate-y-[.15em] self-start" />
              <span className={isChecked ? "text-ink-faded line-through" : "text-wine"}>{quantity}</span>
              <span className={isChecked ? "text-ink-faded line-through" : "text-ink"}>{ingredient.name}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
