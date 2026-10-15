import { requireAdminSession } from "../lib/require-admin";
import { logout } from "./actions";

export default async function AdminLayout(props: LayoutProps<"/admin">) {
  // Proxy already gates /admin/:path*, but Server Actions are reachable by
  // direct POST regardless of matcher config, so this is checked again here.
  await requireAdminSession();

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-hairline bg-stone">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-8">
          <span className="font-display text-xl text-wine">Admin</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-pill border border-hairline px-4 py-1.5 text-sm font-semibold text-wine transition-colors hover:bg-blush"
            >
              Log Out
            </button>
          </form>
        </div>
      </div>
      <div className="flex-1">{props.children}</div>
    </div>
  );
}
