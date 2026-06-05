"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a16] text-[#eeeeff] font-sans">
        <div className="max-w-md w-full text-center border border-red-500/20 bg-[#0c0c20]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
          <h1 className="text-6xl font-black text-red-500">Fatal</h1>
          <h2 className="text-xl font-bold mt-4 text-white">Critical Handshake Terminal Failure</h2>
          <p className="text-slate-400 text-sm mt-3">
            A fatal hardware sync packet termination occurred inside of our central gateway loop.
          </p>
          <div className="mt-8">
            <button
              id="global-reset-btn"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00e5ff] text-black hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              Reboot Relay Gateway
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
