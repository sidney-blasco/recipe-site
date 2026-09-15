import Link from "next/link";
import TipCard from "../components/TipCard";
import { getTips, placeholderTips, formatTipDate } from "../lib/tips";

export default async function BakingTipsPage() {
  const tips = await getTips();
  const cards = tips.length > 0 ? tips : placeholderTips;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:px-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl">Baking Tips</h1>
        <p className="mt-4 text-lg text-ink/80">
          Short notes on technique, substitutions, and things I&apos;ve learned the hard way.
        </p>
      </div>

      <div className="mt-14 flex flex-col">
        {cards.map((tip) => {
          const card = (
            <TipCard
              title={tip.title}
              excerpt={tip.excerpt}
              date={formatTipDate(tip.createdAt)}
              imageUrl={tip.imageUrl}
            />
          );
          return tips.length > 0 ? (
            <Link key={tip.id} href={`/baking-tips/${tip.id}`}>
              {card}
            </Link>
          ) : (
            <div key={tip.id}>{card}</div>
          );
        })}
      </div>
    </main>
  );
}
