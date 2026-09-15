import Link from "next/link";
import { notFound } from "next/navigation";
import { getTipById, formatTipDate } from "../../lib/tips";

function PlaceholderImage() {
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
        className="h-14 w-14 text-plum/40"
        aria-hidden="true"
      >
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a6 6 0 0 0-4 10.5c.6.5 1 1.2 1 2.1V16h6v-1.4c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 2Z" />
      </svg>
    </div>
  );
}

export default async function TipPage(props: PageProps<"/baking-tips/[id]">) {
  const { id } = await props.params;
  const tip = await getTipById(id);

  if (!tip) {
    notFound();
  }

  const paragraphs = tip.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-12 sm:px-8">
      <Link
        href="/baking-tips"
        className="text-sm text-mauve underline decoration-mauve/40 underline-offset-4 hover:text-plum"
      >
        ← Baking Tips
      </Link>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-mauve">
        {formatTipDate(tip.createdAt)}
      </p>
      <h1 className="mt-2 text-4xl sm:text-5xl">{tip.title}</h1>

      <div className="mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-lavender">
        {tip.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tip.imageUrl} alt={tip.title} className="h-full w-full object-cover" />
        ) : (
          <PlaceholderImage />
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4 text-lg text-ink/85">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </main>
  );
}
