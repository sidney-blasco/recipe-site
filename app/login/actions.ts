"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isCorrectPassword,
  sanitizeAdminRedirect,
} from "../lib/auth";

export type LoginState = {
  error: string | null;
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  const next = sanitizeAdminRedirect(formData.get("next") as string | null);

  if (typeof password !== "string" || password.length === 0) {
    return { error: "Enter your password." };
  }

  if (!isCorrectPassword(password)) {
    return { error: "Incorrect password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect(next);
}
