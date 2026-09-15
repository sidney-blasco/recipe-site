import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "./auth";

// Server Actions are reachable by direct POST regardless of proxy's matcher,
// so every admin mutation must check this itself rather than trust the route
// having been reached through a protected page.
export async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    redirect("/login");
  }
}
