import type { Recipe } from "./recipes";

export const FILTER_GROUP_KEYS = [
  "cuisine",
  "type",
  "dietary",
  "ingredients",
  "occasion",
  "seasonal",
  "skillLevel",
  "other",
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
  /** Whether the option list is browsable/searchable rather than a short fixed set. */
  searchable: boolean;
  options: FilterOption[];
};

const GROUP_LABELS: Record<FilterGroupKey, string> = {
  cuisine: "Cuisine",
  type: "Type",
  dietary: "Dietary",
  ingredients: "Ingredients",
  occasion: "Occasion",
  seasonal: "Seasonal",
  skillLevel: "Skill Level",
  other: "Other",
};

type CuratedTagGroupKey = "dietary" | "occasion" | "seasonal" | "skillLevel";

// These facets don't have dedicated columns, so they're matched against the
// free-form `tags` array using a fixed, curated vocabulary. Any tag on a
// recipe that isn't part of one of these lists surfaces under "Other".
const TAG_VOCABULARY: Record<CuratedTagGroupKey, string[]> = {
  dietary: ["Healthy", "Dairy Free", "Egg Free", "Gluten Free", "Vegan"],
  occasion: ["Birthday", "Dinner Party", "Snack", "Carb Heavy", "Protein Heavy", "Breakfast"],
  seasonal: ["Spring", "Summer", "Fall", "Winter"],
  skillLevel: ["Beginner", "Intermediate", "Advanced"],
};

const CURATED_TAGS_LOWER = new Set(
  Object.values(TAG_VOCABULARY)
    .flat()
    .map((tag) => tag.toLowerCase())
);

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

export function buildFilterHref(pathname: string, selected: SelectedFilters): string {
  const params = new URLSearchParams();
  for (const key of FILTER_GROUP_KEYS) {
    for (const value of selected[key]) {
      params.append(key, value);
    }
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

// Counts distinct, case-insensitively-deduped values (ingredient names, or
// free-form "other" tags), keeping the first-seen casing for display.
function countDistinct(values: Iterable<string>[]): FilterOption[] {
  const byKey = new Map<string, FilterOption>();
  for (const recipeValues of values) {
    const seen = new Set<string>();
    for (const value of recipeValues) {
      const key = value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const existing = byKey.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        byKey.set(key, { value, label: value, count: 1 });
      }
    }
  }
  return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function buildFilterGroups(recipes: Recipe[]): FilterGroup[] {
  return FILTER_GROUP_KEYS.map((key) => {
    if (key === "cuisine" || key === "type") {
      const counts = new Map<string, number>();
      for (const recipe of recipes) {
        const value = key === "cuisine" ? recipe.cuisine : recipe.mealType;
        if (!value) continue;
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
      const options = [...counts.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([value, count]) => ({ value, label: value, count }));
      return { key, label: GROUP_LABELS[key], searchable: false, options };
    }

    if (key === "ingredients") {
      const options = countDistinct(recipes.map((recipe) => recipe.ingredients));
      return { key, label: GROUP_LABELS[key], searchable: true, options };
    }

    if (key === "other") {
      const options = countDistinct(
        recipes.map((recipe) => recipe.tags.filter((tag) => !CURATED_TAGS_LOWER.has(tag.toLowerCase())))
      );
      return { key, label: GROUP_LABELS[key], searchable: true, options };
    }

    const options = TAG_VOCABULARY[key].map((tag) => ({
      value: tag,
      label: tag,
      count: recipes.filter((recipe) => hasTag(recipe, tag)).length,
    }));
    return { key, label: GROUP_LABELS[key], searchable: false, options };
  });
}

export function filterRecipes(recipes: Recipe[], selected: SelectedFilters): Recipe[] {
  return recipes.filter((recipe) => {
    if (
      selected.cuisine.length > 0 &&
      (!recipe.cuisine || !selected.cuisine.includes(recipe.cuisine))
    ) {
      return false;
    }
    if (
      selected.type.length > 0 &&
      (!recipe.mealType || !selected.type.includes(recipe.mealType))
    ) {
      return false;
    }
    for (const key of ["dietary", "occasion", "seasonal", "skillLevel", "other"] as const) {
      const values = selected[key];
      if (values.length > 0 && !values.some((value) => hasTag(recipe, value))) {
        return false;
      }
    }
    if (
      selected.ingredients.length > 0 &&
      !selected.ingredients.some((value) =>
        recipe.ingredients.some((name) => name.toLowerCase() === value.toLowerCase())
      )
    ) {
      return false;
    }
    return true;
  });
}

export function countActiveFilters(selected: SelectedFilters): number {
  return FILTER_GROUP_KEYS.reduce((total, key) => total + selected[key].length, 0);
}
