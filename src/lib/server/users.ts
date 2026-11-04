import "server-only";

import bcrypt from "bcrypt";
import { getDatabase } from "@/lib/server/db";

const cameroonPhonePattern = /^6[5-9]\d{7}$/;

export function normalizePhoneNumber(phone: string) {
  const cleaned = phone.trim().replace(/[\s()-]/g, "");
  const localNumber = cleaned.startsWith("+237")
    ? cleaned.slice(4)
    : cleaned;

  if (!cameroonPhonePattern.test(localNumber)) {
    return null;
  }

  return `+237${localNumber}`;
}

export async function getUserByPhoneNumber(phone: string) {
  const phoneNumber = normalizePhoneNumber(phone);
  if (!phoneNumber) {
    return null;
  }

  const sql = getDatabase();
  const [user] = await sql`
    SELECT id, name, email, phone_number, password
    FROM users
    WHERE phone_number = ${phoneNumber}
    LIMIT 1
  `;

  return user ?? null;
}

export async function getUserById(id: string) {
  const sql = getDatabase();
  const [user] = await sql`
    SELECT id, phone_number
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;

  return user ?? null;
}

export async function createUser(input: {
  name: string;
  phoneNumber: string;
  email: string | null;
  password: string;
}) {
  const phoneNumber = normalizePhoneNumber(input.phoneNumber);
  if (!phoneNumber) {
    throw new Error("A valid Cameroon mobile number is required.");
  }

  const sql = getDatabase();
  const hashedPassword = await bcrypt.hash(input.password, 10);
  const [user] = await sql`
    INSERT INTO users (name, phone_number, email, password)
    VALUES (${input.name}, ${phoneNumber}, ${input.email}, ${hashedPassword})
    RETURNING id, name, phone_number
  `;

  return user;
}

export function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
