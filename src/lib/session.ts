// src/lib/auth/session.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Gets the current user in a server component
 * Should only be called on protected routes (middleware ensures this)
 * @returns The authenticated user
 * @throws Error if no user is found (should never happen on protected routes)
 */
export async function getCurrentUser() {
  // Get session from auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return session.user;
}

/**
 * Gets the current user ID in a server component
 * @returns The authenticated user ID
 * @throws Error if no user is found
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  return user.id;
}

/**
 * Gets the current user if available, returns null if not
 * Safe to use on both protected and public pages
 */
export async function getOptionalUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session?.user || null;
  } catch (error) {
    return null;
  }
}
