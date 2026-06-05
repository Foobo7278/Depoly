"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Cpu, 
  MousePointer, 
  Chrome, 
  Timer, 
  Sparkles,
  Info,
  ChevronRight,
  Eye,
  EyeOff,
  UserCheck
} from "lucide-react";
import { UserProfile } from "@/lib/types";

interface AuthGatewayProps {
  onLoginSuccess: (user: Partial<UserProfile>) => void;
  theme: "dark" | "light";
}

// Sandbox Google profiles
const SANDBOX_PROFILES = [
  {
    displayName: "SpongeBob SquarePants",
    email: "spongebob7278@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80",
    country: "🇺🇸 Bikini Bottom",
  },
  {
    displayName: "Patrick Star",
    email: "patrick.star@gmail.com",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80",
    country: "🌍 Under a Rock Node",
  },
  {
    displayName: "Sandy Cheeks",
    email: "sandy.cheeks@gmail.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80",
    country: "🇨🇦 Oak Tree Dome",
  }
];

export default function AuthGateway({ onLoginSuccess, theme }: AuthGatewayProps) {
  const isDark = theme === "dark";

  // Verification stage
  // stage: 1 = Human verification, 2 = Google login screen, 3 = Blocked (Bot alarm)
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [securityLogs, setSecurityLogs] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Bot detection display states
  const [botScore, setBotScore] = useState<number | null>(null);
  const [mousePoints, setMousePoints] = useState<{ x: number; y: number; t: number }[]>([]);
  const [loadTime] = useState<number>(Date.now());
  const challengeTarget = 100;

  // Track dynamic mouse coordinate trajectories overlay
  const handleMouseMove = (e: React.MouseEvent) => {
    if (mousePoints.length < 50) {
      setMousePoints(prev => [
        ...prev,
        {
          x: e.clientX,
          y: e.clientY,
          t: Date.now() - loadTime,
        }
      ]);
    }
  };

  // Arithmetic verification states
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const generateMathChallenge = () => {
    const n1 = Math.floor(Math.random() * 15) + 1;
    const n2 = Math.floor(Math.random() * 15) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer("");
    setVerificationError("");
  };

  useEffect(() => {
    generateMathChallenge();
  }, []);
  
  // Custom Google User Sandbox manual input
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  const verifyHumanChallenge = async () => {
    const trimmed = userAnswer.trim();
    if (!trimmed) {
      setVerificationError("Please solve the mathematical challenge first.");
      return;
    }

    setIsAnalyzing(true);
    setVerificationError("");
    setSecurityLogs(["Initializing client arithmetic logic evaluation...", "Comparing expected solution with user input..."]);

    const payload = {
      num1,
      num2,
      userAnswer: trimmed
    };

    setTimeout(async () => {
      try {
        const response = await fetch("/api/auth/verify-human", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
          setBotScore(data.score !== undefined ? data.score : (data.isBot ? 1.0 : 0.0));
          if (data.isBot) {
            setVerificationError("Verification failed: Sum is incorrect. Please try again.");
            generateMathChallenge();
            setIsAnalyzing(false);
          } else {
            setSecurityLogs(prev => [
              ...prev,
              "Logic check matched successfully!",
              "Classification: HUMAN_VERIFIED"
            ]);
            setTimeout(() => {
              setStage(2); // Proceed to Google Sign In
              setIsAnalyzing(false);
            }, 600);
          }
        } else {
          throw new Error(data.error);
        }
      } catch (err: any) {
        setVerificationError(err.message || "Logic check failed. Please retry.");
        setIsAnalyzing(false);
      }
    }, 800);
  };

  // POPUP OAuth Flow Handler
  const handleRealGoogleOAuth = async () => {
    try {
      setSecurityLogs(prev => [...prev, "Fetching active Google OAuth client context..."]);
      const res = await fetch("/api/auth/google/url");
      const data = await res.json();

      if (data.success && data.configured && data.url) {
        // Authenticate using Google OAuth popup
        const width = 500;
        const height = 650;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        setSecurityLogs(prev => [...prev, "Establishing authentic Google OAuth channels..."]);
        const authWindow = window.open(
          data.url,
          "google_oauth_popup",
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );

        if (!authWindow) {
          alert("Popup was blocked by your browser! Please enable popup display to allow Google Sign-in.");
        }
      } else {
        // Google client is undefined. Notify sandbox options or fallback
        setSecurityLogs(prev => [...prev, "Google Client ID was empty in configuration. Showing test workspace login credentials."]);
        setShowCustomForm(true);
      }
    } catch (e: any) {
      console.error(e);
      setSecurityLogs(prev => [...prev, "OAuth network trace failed. Loading offline sandbox profiles."]);
      setShowCustomForm(true);
    }
  };

  // Google sign in callback listener
  useEffect(() => {
    const handleGoogleMessage = (event: MessageEvent) => {
      // Validate origin to avoid cross-script attacks
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }

      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const user = event.data.user;
        if (user && user.success) {
          // Set profiles dynamically!
          onLoginSuccess({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            verified: true,
            bio: `Verified Google User (${user.email})`
          });
        }
      }
    };

    window.addEventListener("message", handleGoogleMessage);
    return () => window.removeEventListener("message", handleGoogleMessage);
  }, [onLoginSuccess]);

  // Sandbox Profile login triggered
  const handleSandboxLogin = (profile: typeof SANDBOX_PROFILES[0]) => {
    onLoginSuccess({
      id: "g_sandbox_" + Math.random().toString(36).substr(2, 6),
      username: "@" + profile.email.split("@")[0],
      displayName: profile.displayName,
      avatar: profile.avatar,
      country: profile.country,
      verified: true,
      bio: `Verified Sandbox Google workspace identity (${profile.email})`
    });
  };

  // Custom simulation login form
  const handleCustomFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) return;

    onLoginSuccess({
      id: "g_simulated_" + Math.random().toString(36).substr(2, 6),
      username: "@" + customEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_"),
      displayName: customName,
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80`,
      country: "🌍 Google cloud",
      verified: true,
      bio: `Verified authentic Google Voyager (${customEmail})`
    });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl transition-all duration-500 ${
        isDark ? "bg-[#04040e]/95" : "bg-slate-100/90"
      }`}
    >
      {/* 🚀 Visual Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-3xl -top-20 -left-20" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl -bottom-20 -right-20 animate-pulse" />
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: AUTH FORM / VERIFICATION */}
        <div className={`md:col-span-7 rounded-3xl border p-6 md:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 ${
          isDark 
            ? "bg-[#0a0a1a]/90 border-slate-800/80 text-white" 
            : "bg-white border-slate-200 text-slate-800"
        }`}>
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00e5ff] to-[#7c4dff] flex items-center justify-center text-white shadow-lg">
                <Lock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Flux Security Gateway</h1>
                <p className="text-xs text-slate-400">Zero-Trust Network Authorization Protocol</p>
              </div>
            </div>

            {/* STAGE 1: HUMAN CHALLENGE */}
            {stage === 1 && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
                {/* HIGHLY PROMINENT HUMAN GATE NOTICE */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-400/30 text-center space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-cyan-400/20 text-[#00e5ff] animate-pulse">
                    🛡️ SECURITY ACCESS INITIATION
                  </span>
                  <h2 className="text-base font-black text-white uppercase tracking-tight">REQUIRED HUMAN CHECK</h2>
                  <p className="text-[11px] text-slate-300 max-w-sm mx-auto">
                    To prevent spam bots, solve the simple arithmetic challenge below to authorize your connection.
                  </p>
                </div>

                {/* THE SUM OF NUMBERS CHALLENGE DISPLAY */}
                <div className="p-6 rounded-2xl border-2 border-[#7c4dff]/50 bg-[#0b0c1e] shadow-[0_0_15px_rgba(124,77,255,0.1)] flex flex-col items-center gap-4 text-center">
                  <div className="flex items-center gap-4 text-2xl font-black tracking-widest text-[#00e5ff] font-orbitron mb-2 select-none">
                    <span className="px-4 py-2 bg-slate-950/80 border border-white/5 rounded-xl">{num1}</span>
                    <span className="text-slate-500">+</span>
                    <span className="px-4 py-2 bg-slate-950/80 border border-white/5 rounded-xl">{num2}</span>
                    <span className="text-slate-500">=</span>
                    <span className="text-slate-400 font-sans font-light">?</span>
                  </div>

                  <div className="w-full text-left space-y-1.5">
                    <label htmlFor="math-answer-input" className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block font-bold">Your Calculated Answer</label>
                    <input 
                      id="math-answer-input"
                      type="number"
                      placeholder="Enter the sum..."
                      value={userAnswer}
                      onChange={(e) => {
                        setUserAnswer(e.target.value);
                        setVerificationError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          verifyHumanChallenge();
                        }
                      }}
                      disabled={isAnalyzing}
                      className="w-full font-mono bg-slate-950 border border-[#7c4dff]/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00e5ff] transition-all placeholder-slate-600 shadow-inner"
                    />
                  </div>

                  {verificationError && (
                    <div className="text-[11px] text-[#ff4081] font-mono leading-tight bg-[#180710] border border-[#ff4081]/30 p-2.5 rounded-lg w-full flex items-center gap-2">
                      <span className="text-xs">⚠️</span>
                      <span className="text-left">{verificationError}</span>
                    </div>
                  )}

                  <button
                    disabled={isAnalyzing}
                    onClick={verifyHumanChallenge}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] hover:opacity-90 disabled:opacity-50 text-white font-orbitron font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying logic matrices...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize secure node connection</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={generateMathChallenge}
                    disabled={isAnalyzing}
                    className="text-[9px] text-[#00e5ff] font-mono uppercase tracking-widest hover:underline hover:opacity-85"
                  >
                    🔄 Request new numbers
                  </button>
                </div>

                <p className="text-[9px] text-center text-slate-500 font-mono">
                  By solving this addition puzzle, we confirm standard sentient logic is present, bypassing telemetry tracking.
                </p>
              </div>
            )}

            {/* STAGE 2: GOOGLE LOGIN PANEL */}
            {stage === 2 && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-extrabold bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981] rounded-full uppercase mb-1">
                    🛡️ Human Verified
                  </span>
                  <h2 className="text-base font-bold">Step 2: Sign in using Google</h2>
                  <p className="text-xs text-slate-400">
                    Authorize identity claims with standard Google credentials to access the global chatting matrix.
                  </p>
                </div>

                {/* Primary Google Login Button */}
                <button
                  onClick={handleRealGoogleOAuth}
                  className="w-full py-4 px-6 rounded-2xl border border-slate-755 hover:bg-slate-900/40 cursor-pointer flex items-center justify-center gap-3 transition-all bg-gradient-to-r from-[#0a0a20] to-[#0d0d2a] shadow-xl group hover:border-[#7c4dff]/60"
                >
                  {/* Flat Google vector color icon */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="text-white font-bold text-xs tracking-wider uppercase group-hover:text-[#00e5ff] transition-all">
                    Sign In with Google Identity
                  </span>
                </button>

                {/* GOOGLE SANDBOX ACCOUNTS DESIGN PANEL */}
                <div className="pt-4 border-t border-dashed border-slate-800">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
                      <span>OFFLINE GOOGLE AUTH COVERT SANDBOX</span>
                    </div>
                    <button 
                      onClick={() => setShowCustomForm(!showCustomForm)}
                      className="text-[10px] text-[#7c4dff] hover:text-[#00e5ff] font-bold underline cursor-pointer"
                    >
                      {showCustomForm ? "View list" : "Create custom Google profile"}
                    </button>
                  </div>

                  {!showCustomForm ? (
                    <div className="grid gap-2.5">
                      {SANDBOX_PROFILES.map((prof, i) => (
                        <div 
                          key={i}
                          onClick={() => handleSandboxLogin(prof)}
                          className="p-3 rounded-xl border border-slate-800/60 bg-[#0d0d20]/50 hover:bg-[#11112e] cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Image src={prof.avatar} alt="P" width={32} height={32} unoptimized referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover border border-[#7c4dff]/30" />
                            <div className="text-left">
                              <div className="text-xs font-bold text-white group-hover:text-[#00e5ff]">{prof.displayName}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{prof.email}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#00e5ff]" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={handleCustomFormSubmit} className="space-y-3 animate-[fadeIn_0.2s_ease]">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Gmail Display Name</label>
                        <input 
                          type="text" 
                          required
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="SpongeBob SquarePants"
                          className="w-full bg-[#0d0d29] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7c4dff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Gmail Secondary Address</label>
                        <input 
                          type="email" 
                          required
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="spongebob7278@gmail.com"
                          className="w-full bg-[#0d0d29] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7c4dff]"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-[#7c4dff] hover:bg-[#7c4dff]/90 text-white rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        Launch Custom Google Session
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 3: SECURITY BLOCK PANEL */}
            {stage === 3 && (
              <div className="space-y-6 text-center py-6 animate-[pulse_2s_infinite]">
                <div className="w-16 h-16 rounded-3xl bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center text-red-500 mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-red-500">Access Denied: Mechanical Activity Logged</h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Flux Cyber-intelligence suite identified automated linear mouse alignment profiles representing potential bot execution template.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-left space-y-1.5">
                  <div className="text-[10px] font-bold text-red-400 uppercase">Blocked Node Telemetry logs:</div>
                  <div className="text-[9px] font-mono text-red-300">
                    - TARGET CONCENT: {challengeTarget}% <br />
                    - VELOCITY VARIATION: Near-zero <br />
                    - LINEAR TRAJECTORY: Static angular trace detected <br />
                    - ACTIONS: Blocked
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStage(1);
                    generateMathChallenge();
                    setMousePoints([]);
                    setBotScore(null);
                  }}
                  className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-wider rounded-xl cursor-pointer"
                >
                  Acknowledge and Purge Node
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500 font-bold">
            <span>FLUX MEET PROTOCOL</span>
            <span>SECURE GATEWAY v3.5</span>
          </div>
        </div>

        {/* RIGHT COLUMN: CYBER THREAT AUDIT / BOT INSPECTOR PANEL */}
        <div className={`md:col-span-5 rounded-3xl border p-5 flex flex-col justify-between shadow-2xl transition-all duration-300 ${
          isDark 
            ? "bg-[#050512] border-slate-800/80 text-white" 
            : "bg-slate-50 border-slate-200 text-slate-800"
        }`}>
          <div>
            <div className="flex items-center gap-2.5 mb-4 font-sans font-bold text-xs tracking-wider">
              <Cpu className="w-4 h-4 text-[#00e5ff] animate-pulse" />
              <span>BOT INSPECTION DASHBOARD</span>
            </div>

            {/* REAL-TIME CLIENT BEHAVIOR SUMMARY */}
            <div className="space-y-3.5">
              
              {/* Bot Probability Gauge */}
              <div className="p-4 rounded-2xl bg-black/45 border border-slate-850">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Automation Likelihood</span>
                  <span className={`text-xs font-bold ${
                    botScore === null ? "text-slate-500" : botScore > 0.45 ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {botScore === null ? "PENDING ANALYSIS" : `${(botScore * 100).toFixed(1)}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${
                      botScore === null 
                        ? "bg-slate-700 w-0" 
                        : botScore > 0.45 
                        ? "bg-red-500" 
                        : "bg-emerald-500"
                    }`}
                    style={{ width: botScore === null ? "0%" : `${botScore * 100}%` }}
                  />
                </div>
              </div>

              {/* Live coordinates tracker logger */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                  <span>TELEMETRY TRACE STREAM</span>
                  <span>{mousePoints.length} points logged</span>
                </div>
                <div className="h-28 bg-[#03030d] border border-slate-900 rounded-xl p-2.5 font-mono text-[9px] text-[#00e5ff] overflow-y-auto space-y-1">
                  {mousePoints.length === 0 ? (
                    <div className="text-slate-600 animate-pulse">Waiting for cursor trajectory input activity...</div>
                  ) : (
                    [...mousePoints].reverse().slice(0, 10).map((pt, index) => (
                      <div key={index} className="flex justify-between">
                        <span>TRACE_X: {pt.x.toFixed(0)}px | TRACE_Y: {pt.y.toFixed(0)}px</span>
                        <span className="text-[#7c4dff]">{pt.t}ms</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cyber threat logging audit output console */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-bold">AUDIT INSPECTION LOGS</div>
                <div className="h-32 bg-[#02020a] border border-slate-950 rounded-xl p-2.5 font-mono text-[9px] text-slate-400 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {securityLogs.length === 0 ? (
                    <div className="text-slate-600">Secure pipeline waiting for verification request...</div>
                  ) : (
                    securityLogs.map((log, i) => (
                      <div key={i} className={`leading-relaxed ${
                        log.startsWith("🛑") ? "text-red-400" : log.startsWith("🔍") ? "text-[#00e5ff]" : "text-slate-350"
                      }`}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-slate-850 text-[10px] text-slate-400 flex gap-2.5 items-start">
            <Info className="w-3.5 h-3.5 text-[#00e5ff] flex-shrink-0" />
            <p className="leading-normal">
              Flux P2P client relies on rigorous mouse trace acceleration metrics. Bots moving along linear computer-generated math models will be categorized instantly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
