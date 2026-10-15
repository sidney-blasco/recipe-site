import Link from "next/link";
import PageHeader from "../components/PageHeader";
import TipCard from "../components/TipCard";
import { getTips, placeholderTips, formatTipDate } from "../lib/tips";

export default async function BakingTipsPage() {
  const tips = await getTips();
  const cards = tips.length > 0 ? tips : placeholderTips;

  return (
    <main className="page max-w-[52rem] pb-16">
      <PageHeader
        title="Baking Tips"
        dek={<>Short notes on technique, substitutions, and things I&apos;ve learned the hard way.</>}
      />

      <div className="mt-12 flex flex-col gap-6">
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
            <Link key={tip.id} href={`/baking-tips/${tip.id}`} className="block rounded-panel no-underline">
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
