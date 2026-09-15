import type { Recipe } from "./recipes";

export const FILTER_GROUP_KEYS = [
  "cuisine",
  "mealType",
  "dietary",
  "occasion",
  "seasonal",
  "skillLevel",
] as const;

export type FilterGroupKey = (typeof FILTER_GROUP_KEYS)[number];

export type SelectedFilters = Record<FilterGroupKey, string[]>;

export type FilterOption = {
  value: string;
  label: string;
  count: number;
};

export type FilterGroup = {
  key: FilterGroupKey;
  label: string;
  options: FilterOption[];
};

const GROUP_LABELS: Record<FilterGroupKey, string> = {
  cuisine: "Cuisine",
  mealType: "Meal Type",
  dietary: "Dietary",
  occasion: "Occasion",
  seasonal: "Seasonal",
  skillLevel: "Skill Level",
};

type TagGroupKey = "dietary" | "occasion" | "seasonal" | "skillLevel";

// These four facets don't have dedicated columns yet, so they're matched
// against the free-form `tags` array using a fixed, curated vocabulary.
const TAG_VOCABULARY: Record<TagGroupKey, string[]> = {
  dietary: ["Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb", "Nut-Free"],
  occasion: ["Weeknight", "Weekend", "Holiday", "Party", "Meal Prep", "Date Night"],
  seasonal: ["Spring", "Summer", "Fall", "Winter"],
  skillLevel: ["Beginner", "Intermediate", "Advanced"],
};

function hasTag(recipe: Recipe, tag: string): boolean {
  return recipe.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
}

// Picks out the subset of a recipe's free-form tags that are recognized
// dietary tags, using the same curated vocabulary as the sidebar filter.
export function getDietaryTags(tags: string[]): string[] {
  const lowerTags = tags.map((tag) => tag.toLowerCase());
  return TAG_VOCABULARY.dietary.filter((tag) => lowerTags.includes(tag.toLowerCase()));
}

export function parseSelectedFilters(
  searchParams: Record<string, string | string[] | undefined>
): SelectedFilters {
  const selected = {} as SelectedFilters;
  for (const key of FILTER_GROUP_KEYS) {
    const raw = searchParams[key];
    selected[key] = raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];
  }
  return selected;
}

// The ingredient filter is a deep link from the Ingredient Index rather than
// one of the sidebar facets, so it's tracked separately from SelectedFilters.
export function parseIngredientFilter(
  searchParams: Record<string, string | string[] | undefined>
): string | null {
  const raw = searchParams.ingredient;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.trim() ? value.trim() : null;
}

export function buildFilterHref(
  pathname: string,
  selected: SelectedFilters,
  ingredient?: string | null
): string {
  const params = new URLSearchParams();
  for (const key of FILTER_GROUP_KEYS) {
    for (const value of selected[key]) {
      params.append(key, value);
    }
  }
  if (ingredient) {
    params.set("ingredient", ingredient);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildFilterGroups(recipes: Recipe[]): FilterGroup[] {
  return FILTER_GROUP_KEYS.map((key) => {
    if (key === "cuisine" || key === "mealType") {
      const counts = new Map<string, number>();
      for (const recipe of recipes) {
        const value = key === "cuisine" ? recipe.cuisine : recipe.mealType;
        if (!value) continue;
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
      const options = [...counts.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([value, count]) => ({ value, label: value, count }));
      return { key, label: GROUP_LABELS[key], options };
    }

    const options = TAG_VOCABULARY[key].map((tag) => ({
      value: tag,
      label: tag,
      count: recipes.filter((recipe) => hasTag(recipe, tag)).length,
    }));
    return { key, label: GROUP_LABELS[key], options };
  });
}

export function filterRecipes(
  recipes: Recipe[],
  selected: SelectedFilters,
  ingredient?: string | null
): Recipe[] {
  const ingredientKey = ingredient?.toLowerCase() ?? null;

  return recipes.filter((recipe) => {
    if (
      selected.cuisine.length > 0 &&
      (!recipe.cuisine || !selected.cuisine.includes(recipe.cuisine))
    ) {
      return false;
    }
    if (
      selected.mealType.length > 0 &&
      (!recipe.mealType || !selected.mealType.includes(recipe.mealType))
    ) {
      return false;
    }
    for (const key of ["dietary", "occasion", "seasonal", "skillLevel"] as const) {
      const values = selected[key];
      if (values.length > 0 && !values.some((value) => hasTag(recipe, value))) {
        return false;
      }
    }
    if (
      ingredientKey &&
      !recipe.ingredients.some((name) => name.toLowerCase() === ingredientKey)
    ) {
      return false;
    }
    return true;
  });
}

export function countActiveFilters(selected: SelectedFilters): number {
  return FILTER_GROUP_KEYS.reduce((total, key) => total + selected[key].length, 0);
}
