import Link from "next/link";

const links = [
  { href: "/admin/recipes", label: "Manage Recipes", description: "Add, edit, or remove recipes." },
  { href: "/admin/baking-tips", label: "Manage Baking Tips", description: "Add, edit, or remove tip posts." },
  { href: "/admin/photos", label: "Manage Photos", description: "Add or remove gallery photos." },
];

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
      <h1 className="text-4xl sm:text-5xl">Dashboard</h1>
      <p className="mt-4 text-lg text-ink/80">What would you like to manage?</p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col gap-2 rounded-2xl border border-plum/15 bg-white/60 p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="font-display text-xl text-plum group-hover:underline">{link.label}</h2>
            <p className="text-sm text-ink/70">{link.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
