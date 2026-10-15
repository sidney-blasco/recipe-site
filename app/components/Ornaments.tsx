// Decorative ornaments from the Convivial v3 specimen. SVG paths are copied
// exactly from convivial-specimen-v3.html (#curl and #sprig symbols).

function Curl() {
  return (
    <svg
      viewBox="0 0 44 44"
      className="block size-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 40 C4 20 10 6 34 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 30 C12 20 17 13 25 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity=".7"
      />
      <circle cx="39" cy="4" r="2.1" fill="currentColor" />
      <circle cx="4" cy="40" r="2.1" fill="currentColor" />
      <circle cx="19" cy="21" r="1.4" fill="currentColor" opacity=".8" />
    </svg>
  );
}

const corners = [
  "top-3.5 left-3.5",
  "top-3.5 right-3.5 -scale-x-100",
  "bottom-3.5 left-3.5 -scale-y-100",
  "bottom-3.5 right-3.5 -scale-100",
];

/**
 * Curl ornaments at all four corners. Place inside a `relative` panel.
 * Reserved for the home title panel and the recipe card only.
 */
export function CornerCurls() {
  return (
    <>
      {corners.map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={`pointer-events-none absolute corner text-wine opacity-85 ${position}`}
        >
          <Curl />
        </span>
      ))}
    </>
  );
}

/** Wavy line with dots, used under the wordmark, between sections, in the footer. */
export function Sprig({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex justify-center text-wine ${className}`}
    >
      <svg width="120" height="20" viewBox="0 0 120 20" focusable="false">
        <path
          d="M8 10 C30 2 44 18 60 10 C76 2 90 18 112 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="3" cy="10" r="2" fill="currentColor" />
        <circle cx="117" cy="10" r="2" fill="currentColor" />
        <circle cx="60" cy="10" r="2.6" fill="currentColor" />
      </svg>
    </div>
  );
}

/** Standalone dotted separator between stacked blocks. */
export function DottedRule({ className = "" }: { className?: string }) {
  return <hr aria-hidden="true" className={`dots ${className}`} />;
}
