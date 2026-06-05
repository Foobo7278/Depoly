"use client";

import React, { useEffect } from "react";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a16] text-[#eeeeff] font-sans">
      <div className="max-w-md w-full text-center border border-red-500/20 bg-[#0c0c20]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
        <h1 className="text-6xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">Error</h1>
        <h2 className="text-xl font-bold mt-4 text-white">Relay stream interrupted</h2>
        <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto">
          An unexpected handshake packet timeout occurred on our active gateway channels.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <button
            id="reset-handshake-btn"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00e5ff] text-black hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)]"
          >
            Reset Relay
          </button>
          <Link
            id="gateway-root-link"
            href="/"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-all"
          >
            Gateway Root
          </Link>
        </div>
      </div>
    </div>
  );
}
