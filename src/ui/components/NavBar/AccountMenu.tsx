import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import { auth } from "@/lib/auth";
import { signOutAccount } from "@/app/account-actions";

export default async function AccountMenu() {
  const session = await auth();
  const user = session?.user;

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 transition-colors hover:text-[#935F4C]">
        <UserIcon aria-hidden="true" className="h-5 w-5 text-gray-600" />
        <span>{user ? user.name?.split(" ")[0] || "Account" : "Sign In"}</span>
      </summary>
      <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-lg border border-[#EFECE6] bg-white p-4 text-left shadow-xl">
        {user ? (
          <>
            <p className="font-semibold text-[#262524]">{user.name || "Your account"}</p>
            {user.phone && <p className="mt-1 text-sm text-gray-600">{user.phone}</p>}
            {user.email && <p className="mt-1 break-all text-sm text-gray-600">{user.email}</p>}
            <form action={signOutAccount}>
              <button
                type="submit"
                className="mt-3 w-full rounded border border-[#EFECE6] px-3 py-2 text-sm font-medium text-[#935F4C] hover:bg-[#F7F4F0]"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">Sign in or create an account to continue.</p>
            <Link
              href="/login"
              className="mt-3 block w-full rounded bg-[#935F4C] px-3 py-2 text-center text-sm font-medium text-white hover:bg-[#7A4E3E]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="mt-2 block text-center text-sm text-[#935F4C] underline underline-offset-2"
            >
              Create account
            </Link>
          </>
        )}
      </div>
    </details>
  );
}
