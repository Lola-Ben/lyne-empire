import { getSafeReturnPath } from "@/lib/auth-redirect";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;
  const returnPath = getSafeReturnPath(
    typeof callbackUrl === "string" ? callbackUrl : null,
  );

  return <LoginForm callbackUrl={returnPath} />;
}
