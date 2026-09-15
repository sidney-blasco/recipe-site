import Link from "next/link";
import RecipeCard from "../components/RecipeCard";
import { getRecipes, placeholderRecipes, pickFeaturedRecipes } from "../lib/recipes";

const FEATURED_LIMIT = 6;

function PlaceholderPortrait() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lavender to-mauve/40">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-16 w-16 text-plum/40"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    </div>
  );
}

export default async function AboutPage() {
  const recipes = await getRecipes();
  const cards = recipes.length > 0 ? recipes : placeholderRecipes;
  const featured = pickFeaturedRecipes(cards, FEATURED_LIMIT);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 sm:px-8">
      <h1 className="text-4xl sm:text-5xl">About</h1>

      <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start lg:gap-12">
        <div className="mx-auto w-56 sm:w-64 lg:mx-0 lg:w-full">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-lavender">
            <PlaceholderPortrait />
          </div>
          <p className="mt-2 text-center text-xs text-ink/40 lg:text-left">Photo coming soon</p>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-lg text-ink/80 lg:mt-0">
          <p>
            [Placeholder] Hi, I&apos;m Sid — welcome to my little corner of the internet where I keep
            track of every recipe I actually make more than once. This site started as a way to stop
            losing screenshots of recipes in my camera roll, and turned into a running record of what I
            cook, why, and what I&apos;d change next time.
          </p>
          <p>
            [Placeholder] I&apos;ll swap this paragraph out for the real story soon — for now, consider it
            a stand-in for who I am and why this site exists.
          </p>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-3xl text-plum">Favorites</h2>
        <p className="mt-2 text-ink/70">A handful of the recipes I keep coming back to.</p>

        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((recipe) => {
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
          <div className="mt-8 rounded-2xl border border-dashed border-plum/20 px-6 py-16 text-center">
            <p className="text-lg text-plum">No favorites yet.</p>
            <p className="mt-2 text-sm text-ink/60">Add some recipes and your favorites will show up here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
