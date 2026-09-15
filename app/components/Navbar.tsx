import Link from "next/link";

const navLinks = [
  { href: "/", label: "All Recipes" },
  { href: "/ingredients", label: "Ingredient Index" },
  { href: "/baking-tips", label: "Baking Tips" },
  { href: "/photos", label: "Photos" },
];

export default function Navbar() {
  return (
    <header className="border-b border-plum/15">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
        <Link href="/about" className="font-display text-2xl text-plum">
          Convivial
        </Link>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-plum underline decoration-plum/40 underline-offset-4 transition-colors hover:decoration-plum"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/search"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-plum/30 text-plum transition-colors hover:bg-lavender"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}
