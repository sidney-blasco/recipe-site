import Link from "next/link";
import { CornerCurls, Sprig } from "./components/Ornaments";
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
      <div className="page pt-6">
        <header className="panel bg-ground pt-[clamp(3rem,8vw,5rem)] pb-[clamp(2.5rem,6vw,4rem)] text-center">
          <CornerCurls />
          <h1 className="display m-0 text-display leading-[.95] tracking-[-.015em] text-wine">Convivial</h1>
          <Sprig className="my-[1.6rem]" />
          <p className="display-it mx-auto mt-0 max-w-[30rem] text-[1.3rem] leading-[1.4] text-ink-faded">
            A running collection of the recipes I actually cook on repeat —
            organized by cuisine, occasion, and how much energy I have that day.
          </p>
        </header>
      </div>

      <section className="page mt-10 pb-16">
        <div className="lg:flex lg:items-start lg:gap-10">
          <RecipeFilters groups={groups} selected={selected} activeCount={activeCount} />

          <div className="flex-1">
            <p className="mt-0 mb-5 text-small italic text-ink-faded">
              {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
              {activeCount > 0 ? " matching your filters" : ""}
            </p>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((recipe) => {
                  const card = (
                    <RecipeCard
                      title={recipe.title}
                      category={recipe.cuisine ?? recipe.mealType ?? "Recipe"}
                      imageUrl={recipe.imageUrl}
                    />
                  );
                  return recipes.length > 0 ? (
                    <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block rounded-panel no-underline">
                      {card}
                    </Link>
                  ) : (
                    <div key={recipe.id}>{card}</div>
                  );
                })}
              </div>
            ) : (
              <div className="panel bg-stone text-center">
                <p className="display-it m-0 text-h4 text-ink">No recipes match those filters.</p>
                <p className="mt-2 mb-0 text-small italic text-ink-faded">Try clearing a few to see more results.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
