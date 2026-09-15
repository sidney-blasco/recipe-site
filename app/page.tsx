import Link from "next/link";
import RecipeCard from "./components/RecipeCard";
import RecipeFilters from "./components/RecipeFilters";
import { getRecipes, placeholderRecipes } from "./lib/recipes";
import { buildFilterGroups, countActiveFilters, filterRecipes, parseSelectedFilters } from "./lib/filters";

export default async function Home(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const recipes = await getRecipes();
  const cards = recipes.length > 0 ? recipes : placeholderRecipes;

  const selected = parseSelectedFilters(searchParams);
  const activeCount = countActiveFilters(selected);
  const groups = buildFilterGroups(cards);
  const filtered = filterRecipes(cards, selected);

  return (
    <>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl">Sid Eats</h1>
        <p className="mt-4 text-lg text-ink/80">
          A running collection of the recipes I actually cook on repeat —
          organized by cuisine, occasion, and how much energy I have that day.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-8">
        <div className="lg:flex lg:items-start lg:gap-10">
          <RecipeFilters groups={groups} selected={selected} activeCount={activeCount} />

          <div className="flex-1">
            <p className="mb-6 text-sm text-ink/60">
              {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
              {activeCount > 0 ? " matching your filters" : ""}
            </p>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((recipe) => {
                  const card = (
                    <RecipeCard
                      title={recipe.title}
                      category={recipe.cuisine ?? recipe.mealType ?? "Recipe"}
                      imageUrl={recipe.imageUrl}
                    />
                  );
                  return recipes.length > 0 ? (
                    <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                      {card}
                    </Link>
                  ) : (
                    <div key={recipe.id}>{card}</div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-plum/20 px-6 py-16 text-center">
                <p className="text-lg text-plum">No recipes match those filters.</p>
                <p className="mt-2 text-sm text-ink/60">Try clearing a few to see more results.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
