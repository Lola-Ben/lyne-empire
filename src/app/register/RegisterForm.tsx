"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { registerUser, type FormState } from "./action";

const initialState: FormState = { errors: {} };

export default function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-md rounded-md border border-[#EFECE6] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold uppercase tracking-widest text-[#262524]">
            Create Account
          </h1>
          <p className="mt-1 text-xs uppercase tracking-wider text-[#7A746F]">
            Join Lyns Fashion with your phone number
          </p>
        </div>
        {state?.globalError && (
          <div role="alert" className="mb-5 rounded border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
            {state.globalError}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="callback_url" value={callbackUrl} />
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#262524]">
              Full Name
            </span>
            <input name="name" type="text" autoComplete="name" required className="w-full rounded border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm focus:border-[#935F4C] focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20" />
            {state?.errors?.name && <span className="mt-1 block text-xs text-red-500">{state.errors.name[0]}</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#262524]">
              Mobile Number
            </span>
            <input name="phone_number" type="tel" autoComplete="tel" placeholder="e.g., 67XXXXXXX" required className="w-full rounded border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm focus:border-[#935F4C] focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20" />
            {state?.errors?.phone_number && <span className="mt-1 block text-xs text-red-500">{state.errors.phone_number[0]}</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#262524]">
              Email Address <span className="font-normal lowercase text-[#7A746F]">(optional)</span>
            </span>
            <input name="email" type="email" autoComplete="email" className="w-full rounded border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm focus:border-[#935F4C] focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20" />
            {state?.errors?.email && <span className="mt-1 block text-xs text-red-500">{state.errors.email[0]}</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#262524]">
              Create Password
            </span>
            <input name="password" type="password" autoComplete="new-password" required className="w-full rounded border border-[#EFECE6] bg-[#FAFAFA] px-3 py-2.5 text-sm focus:border-[#935F4C] focus:outline-none focus:ring-2 focus:ring-[#935F4C]/20" />
            {state?.errors?.password && <span className="mt-1 block text-xs text-red-500">{state.errors.password[0]}</span>}
          </label>
          <button type="submit" disabled={isPending} className="mt-2 w-full rounded bg-[#935F4C] py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#7A4E3E] disabled:cursor-not-allowed disabled:opacity-60">
            {isPending ? "Creating Account..." : "Register Now"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-[#5F5A56]">
          Already have an account?{" "}
          <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-[#935F4C] underline underline-offset-2">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
