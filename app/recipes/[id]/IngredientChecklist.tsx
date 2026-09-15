"use client";

import { useState } from "react";

export default function IngredientChecklist({ ingredients }: { ingredients: string[] }) {
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
    <ul className="mt-4 flex flex-col gap-2.5">
      {ingredients.map((ingredient, index) => {
        const isChecked = checked.has(index);
        return (
          <li key={index}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(index)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-plum/40 text-plum accent-plum"
              />
              <span className={isChecked ? "text-ink/40 line-through" : "text-ink/85"}>{ingredient}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
