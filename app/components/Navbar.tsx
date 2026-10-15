import Link from "next/link";

const navLinks = [
  { href: "/", label: "All Recipes" },
  { href: "/ingredients", label: "Ingredient Index" },
  { href: "/baking-tips", label: "Baking Tips" },
  { href: "/photos", label: "Photos" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 bg-ground">
      <div className="page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
        <Link
          href="/about"
          className="display text-[1.85rem] leading-none text-wine no-underline"
        >
          Convivial
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="sc text-[1.05rem] no-underline decoration-wine/40 underline-offset-4 transition-colors duration-200 hover:text-wine hover:underline"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/search"
            aria-label="Search"
            className="flex size-10 items-center justify-center rounded-pill bg-stone text-ink transition-colors duration-200 hover:bg-blush hover:text-wine"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[1.1rem]"
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
