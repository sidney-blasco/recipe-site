import Link from "next/link";
import { notFound } from "next/navigation";
import { getTipById } from "../../lib/tips";
import { checkIsAdmin } from "../../lib/require-admin";
import EditableTip from "./EditableTip";

export default async function TipPage(props: PageProps<"/baking-tips/[id]">) {
  const { id } = await props.params;
  const tip = await getTipById(id);

  if (!tip) {
    notFound();
  }

  const isAdmin = await checkIsAdmin();

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-12 sm:px-8">
      <Link
        href="/baking-tips"
        className="text-sm text-mauve underline decoration-mauve/40 underline-offset-4 hover:text-plum"
      >
        ← Baking Tips
      </Link>

      <EditableTip tip={tip} isAdmin={isAdmin} />
    </main>
  );
}
