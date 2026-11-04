"use server";

import { signOut } from "@/lib/auth";

export async function signOutAccount() {
  await signOut({ redirectTo: "/" });
}
