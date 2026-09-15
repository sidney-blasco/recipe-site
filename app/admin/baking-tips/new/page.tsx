import TipForm from "../TipForm";
import { createTip } from "../actions";

export default function NewTipPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-8">
      <h1 className="text-4xl sm:text-5xl">Add New Tip</h1>
      <div className="mt-10">
        <TipForm formAction={createTip} submitLabel="Create Tip" />
      </div>
    </main>
  );
}
