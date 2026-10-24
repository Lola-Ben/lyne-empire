"use client";

import React, { useState } from "react";
import { authenticate } from "./action";

export default function LoginPage() {
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

  return React.createElement(
    "div",
    { className: "min-h-screen bg-[#F9F9F6] flex items-center justify-center px-4" },
    React.createElement(
      "div",
      { className: "max-w-md w-full bg-white border border-gray-100 p-8 shadow-xs rounded" },
      React.createElement(
        "div",
        { className: "text-center mb-8" },
        React.createElement("h2", { className: "text-xl font-bold uppercase tracking-widest text-neutral-900" }, "Welcome to Lyns Fashion"),
        React.createElement("p", { className: "text-xs text-neutral-400 mt-1 uppercase tracking-wider" }, "Sign in with your mobile number"),
      ),
      errorMessage &&
        React.createElement("div", { className: "mb-4 bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-3 py-2.5 rounded" }, errorMessage),
      React.createElement(
        "form",
        { onSubmit: handleSubmit, className: "space-y-5" },
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5" }, "Mobile Number"),
          React.createElement("input", { name: "phone_number", type: "tel", placeholder: "e.g., +237670000000", required: true, className: "w-full text-sm px-3 py-2.5 bg-neutral-50 border border-gray-200 focus:outline-none focus:border-black transition-colors" }),
        ),
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5" }, "Password"),
          React.createElement("input", { name: "password", type: "password", placeholder: "••••••••", required: true, className: "w-full text-sm px-3 py-2.5 bg-neutral-50 border border-gray-200 focus:outline-none focus:border-black transition-colors" }),
        ),
        React.createElement(
          "button",
          { type: "submit", disabled: isPending, className: "w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors disabled:bg-neutral-400" },
          isPending ? "Verifying..." : "Sign In",
        ),
      ),
    ),
  );
}
