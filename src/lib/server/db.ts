import "server-only";

import postgres from "postgres";

let database: ReturnType<typeof postgres> | undefined;

export function getDatabase() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL is not configured.");
  }

  database ??= postgres(connectionString, { ssl: "require" });
  return database;
}
