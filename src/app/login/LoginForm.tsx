"use client";

import Link from "next/link";
import React, { useState } from "react";
import { authenticate } from "./action";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const result = await authenticate(formData);

    if (result) {
      setErrorMessage(result);
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md rounded border border-[#EFECE6] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold uppercase tracking-widest text-[#262524]">
            Welcome to Lyns Fashion
          </h1>
          <p className="mt-1 text-xs uppercase tracking-wider text-[#7A746F]">
            Sign in with your mobile number
          </p>
        </div>
        {errorMessage && (
          <div role="alert" className="mb-4 rounded border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="callback_url" value={callbackUrl} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#262524]">
              Mobile Number
            </span>
            <input
              name="phone_number"
              type="tel"
              autoComplete="tel"
              placeholder="e.g., +237670000000"
              required
              className="w-full rounded border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm transition-colors focus:border-[#935F4C] focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#262524]">
              Password
            </span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm transition-colors focus:border-[#935F4C] focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20"
            />
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded bg-[#935F4C] py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#7A4E3E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Verifying..." : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#5F5A56]">
          No account?{" "}
          <Link
            href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-semibold text-[#935F4C] underline underline-offset-2"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
