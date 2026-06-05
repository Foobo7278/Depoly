import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a16] text-[#eeeeff] font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-3xl top-1/4 left-1/4 animate-pulse" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl bottom-1/4 right-1/4" />
      </div>
      <div className="max-w-md w-full text-center relative z-10 border border-slate-900 bg-[#0c0c20]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
        <h1 className="text-8xl font-black tracking-widest text-[#00e5ff] drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">404</h1>
        <h2 className="text-xl font-bold mt-4 text-white">Relay Coordinate Unreachable</h2>
        <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto">
          The connection handshake sequence failed to resolve this routing node on our regional relays.
        </p>
        <div className="mt-8">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] text-white hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            Re-route Gateway
          </Link>
        </div>
      </div>
    </div>
  );
}
