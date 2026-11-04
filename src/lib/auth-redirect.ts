export function getSafeReturnPath(value: FormDataEntryValue | null) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/";
  }

  const destination = new URL(value, "https://lyne-empire.invalid");
  return destination.origin === "https://lyne-empire.invalid"
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : "/";
}
