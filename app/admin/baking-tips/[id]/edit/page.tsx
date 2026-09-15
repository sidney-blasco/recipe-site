import { notFound } from "next/navigation";
import TipForm from "../../TipForm";
import { updateTip } from "../../actions";
import { getTipById } from "../../../../lib/tips";

export default async function EditTipPage(props: PageProps<"/admin/baking-tips/[id]/edit">) {
  const { id } = await props.params;
  const tip = await getTipById(id);

  if (!tip) {
    notFound();
  }

  const boundUpdate = updateTip.bind(null, tip.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-8">
      <h1 className="text-4xl sm:text-5xl">Edit Tip</h1>
      <div className="mt-10">
        <TipForm
          formAction={boundUpdate}
          submitLabel="Save Changes"
          initial={{
            title: tip.title,
            body: tip.body,
            imageUrl: tip.imageUrl,
          }}
        />
      </div>
    </main>
  );
}
