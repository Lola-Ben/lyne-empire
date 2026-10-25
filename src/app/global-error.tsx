"use client"; // 👈 Add this exact string at the very top of the file

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-[#F9F9F6] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 mb-2">
          Something went wrong!
        </h2>
        <p className="text-xs text-neutral-400 mb-6 max-w-xs">
          An unexpected application runtime shift occurred.
        </p>
        <button
          onClick={() => reset()}
          className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-neutral-800 transition-colors"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
