"use client";

import React, { useActionState } from "react";
import { registerUser, FormState } from "./action";
import Link from "next/link";

const initialState: FormState = { errors: {} };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <div className="min-h-screen bg-[#F9F9F6] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-100 p-8 shadow-sm rounded-md">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-widest text-neutral-900">
            Create Account
          </h2>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">
            Join Lyns Fashion with your phone number
          </p>
        </div>

        {/* Global Errors (e.g., Database connection issues, unique constraints) */}
        {state?.globalError && (
          <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-3 py-2.5 rounded">
            {state.globalError}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {/* 1. Full Name Input Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="e.g., Brenda Lum"
              required
              className={`w-full text-sm px-3 py-2.5 bg-neutral-50 border rounded focus:outline-none transition-colors ${
                state?.errors?.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-black'
              }`}
            />
            {state?.errors?.name && (
              <p className="mt-1 text-xs text-red-500 font-medium pl-1">{state.errors.name[0]}</p>
            )}
          </div>

          {/* 2. Mobile Telephone Input Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Mobile Number
            </label>
            <input
              name="phone_number"
              type="tel"
              placeholder="e.g., 67XXXXXXX"
              required
              className={`w-full text-sm px-3 py-2.5 bg-neutral-50 border rounded focus:outline-none transition-colors ${
                state?.errors?.phone_number ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-black'
              }`}
            />
            {state?.errors?.phone_number && (
              <p className="mt-1 text-xs text-red-500 font-medium pl-1">{state.errors.phone_number[0]}</p>
            )}
          </div>

          {/* 3. Optional Email Input Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Email Address <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="e.g., client@domain.com"
              className={`w-full text-sm px-3 py-2.5 bg-neutral-50 border rounded focus:outline-none transition-colors ${
                state?.errors?.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-black'
              }`}
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-500 font-medium pl-1">{state.errors.email[0]}</p>
            )}
          </div>

          {/* 4. Password Input Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Create Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className={`w-full text-sm px-3 py-2.5 bg-neutral-50 border rounded focus:outline-none transition-colors ${
                state?.errors?.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-black'
              }`}
            />
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-500 font-medium pl-1">{state.errors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 mt-2"
          >
            {isPending ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="underline font-semibold text-black hover:text-neutral-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
