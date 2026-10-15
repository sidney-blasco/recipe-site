// Centered page header: Fraunces title with an optional Fraunces italic dek.
export default function PageHeader({ title, dek }: { title: string; dek?: React.ReactNode }) {
  return (
    <header className="pt-10 text-center">
      <h1 className="m-0 text-h1 leading-[1.02]">{title}</h1>
      {dek && (
        <p className="display-it mx-auto mt-4 mb-0 max-w-[32rem] text-[1.25rem] leading-[1.4] text-ink-faded">
          {dek}
        </p>
      )}
    </header>
  );
}
