// Visual for a small rounded wine checkbox. Render it right after an
// `<input type="checkbox" className="peer sr-only" />` inside the same label.
export default function CheckBox({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-[1.05rem] shrink-0 items-center justify-center rounded-[5px] border border-wine/60 bg-ground text-ground transition-colors duration-200 peer-checked:border-wine peer-checked:bg-wine peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine ${className}`}
    >
      <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-2.5"
      >
        <path d="M2.5 6.2 5 8.5l4.5-5" />
      </svg>
    </span>
  );
}
