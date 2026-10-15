import { Sprig } from "./Ornaments";

export default function Footer() {
  return (
    <footer className="page mt-auto pt-12 pb-10 text-center">
      <Sprig />
      <p className="mx-auto mt-3 max-w-[30rem] text-small italic text-ink-faded">
        Convivial. A kept book of recipes for the shared table.
      </p>
    </footer>
  );
}
