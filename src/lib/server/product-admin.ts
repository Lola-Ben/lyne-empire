import "server-only";

import { auth } from "@/lib/auth";
import { getUserById, normalizePhoneNumber } from "@/lib/server/users";

export async function getProductAdminAccess() {
  const session = await auth();

  if (!session?.user) {
    return { status: "unauthenticated" as const };
  }

  const userId = session.user.id;
  if (typeof userId !== "string" || !userId) {
    return { status: "forbidden" as const };
  }

  const allowedPhones = (process.env.PRODUCT_ADMIN_PHONE_NUMBERS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (allowedPhones.length === 0) {
    return { status: "not-configured" as const };
  }

  const configuredPhones = allowedPhones
    .map((value) => normalizePhoneNumber(value))
    .filter((value): value is string => value !== null);
  const user = await getUserById(userId);
  if (!user) {
    return { status: "forbidden" as const };
  }

  const phone = normalizePhoneNumber(user.phone_number);
  if (!phone || !configuredPhones.includes(phone)) {
    return { status: "forbidden" as const };
  }

  return { status: "authorized" as const };
}
