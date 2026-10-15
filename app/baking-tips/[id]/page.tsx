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
    <main className="page max-w-[48rem] pt-6 pb-16">
      <Link
        href="/baking-tips"
        className="sc no-underline decoration-wine/40 underline-offset-4 hover:text-wine hover:underline"
      >
        ← Baking Tips
      </Link>

      <EditableTip tip={tip} isAdmin={isAdmin} />
    </main>
  );
}
