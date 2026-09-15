import LoginForm from "./LoginForm";
import { sanitizeAdminRedirect } from "../lib/auth";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const rawNext = searchParams.next;
  const next = sanitizeAdminRedirect(Array.isArray(rawNext) ? rawNext[0] : rawNext);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm rounded-2xl border border-plum/15 bg-white/60 p-8">
        <h1 className="text-center text-3xl">Log In</h1>
        <p className="mt-2 text-center text-sm text-ink/60">Admin access only.</p>
        <div className="mt-8">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
