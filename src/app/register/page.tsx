import { getSafeReturnPath } from "@/lib/auth-redirect";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;
  const returnPath = getSafeReturnPath(
    typeof callbackUrl === "string" ? callbackUrl : null,
  );

  return <RegisterForm callbackUrl={returnPath} />;
}
