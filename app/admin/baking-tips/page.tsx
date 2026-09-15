import Link from "next/link";
import { getTips, formatTipDate } from "../../lib/tips";
import DeleteTipButton from "./DeleteTipButton";

export default async function AdminBakingTipsPage() {
  const tips = await getTips();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl sm:text-5xl">Manage Baking Tips</h1>
        <Link
          href="/admin/baking-tips/new"
          className="rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
        >
          + Add New Tip
        </Link>
      </div>

      {tips.length === 0 ? (
        <p className="mt-10 text-ink/60">No tips yet. Add your first one above.</p>
      ) : (
        <ul className="mt-10 flex flex-col divide-y divide-plum/10 border-t border-plum/10">
          {tips.map((tip) => (
            <li key={tip.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-display text-lg text-plum">{tip.title}</p>
                <p className="text-sm text-ink/60">{formatTipDate(tip.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/baking-tips/${tip.id}`}
                  className="rounded-full border border-plum/30 px-4 py-1.5 text-sm font-semibold text-plum transition-colors hover:bg-lavender"
                >
                  Edit
                </Link>
                <DeleteTipButton id={tip.id} title={tip.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
