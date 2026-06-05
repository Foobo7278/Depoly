"use client";

import React from "react";
import { motion } from "motion/react";

interface PremiumLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

export default function PremiumLogo({ size = "md", animated = true }: PremiumLogoProps) {
  const dimensions = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  };

  const glowColors = {
    sm: "shadow-[0_0_15px_rgba(124,77,255,0.4)]",
    md: "shadow-[0_0_25px_rgba(124,77,255,0.5)]",
    lg: "shadow-[0_0_40px_rgba(124,77,255,0.6)]",
    xl: "shadow-[0_0_60px_rgba(124,77,255,0.7)]",
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Ambient background aura */}
      {animated && (
        <motion.div
          className={`absolute rounded-full bg-gradient-to-tr from-[#00e5ff]/20 to-[#7c4dff]/20 blur-xl ${
            size === "xl" ? "w-44 h-44" : size === "lg" ? "w-32 h-32" : "w-16 h-16"
          }`}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Styled vector interlocking loops of connection */}
      <motion.div
        className={`${dimensions[size]} relative z-10`}
        initial={animated ? { scale: 0.8, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]"
        >
          <defs>
            <linearGradient id="gradientCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#7c4dff" />
            </linearGradient>
            <linearGradient id="gradientPink" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4081" />
              <stop offset="100%" stopColor="#7c4dff" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connected infinity ring 1 */}
          <motion.path
            d="M 30,50 A 20,20 0 1,1 70,50 A 20,20 0 1,1 30,50 Z"
            stroke="url(#gradientCyan)"
            strokeWidth="6"
            strokeLinecap="round"
            initial={animated ? { strokeDasharray: "250", strokeDashoffset: "250" } : {}}
            animate={animated ? { strokeDashoffset: 0 } : {}}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Connected ring 2 (Interlocking) */}
          <motion.path
            d="M 50,30 A 20,20 0 1,1 50,70 A 20,20 0 1,1 50,30 Z"
            stroke="url(#gradientPink)"
            strokeWidth="5"
            strokeLinecap="round"
            initial={animated ? { strokeDasharray: "250", strokeDashoffset: "-250" } : {}}
            animate={animated ? { strokeDashoffset: 0 } : {}}
            transition={{ duration: 2.2, ease: "easeInOut", delay: 0.2 }}
          />

          {/* Inner crystal core */}
          <motion.circle
            cx="50"
            cy="50"
            r="10"
            fill="white"
            initial={animated ? { scale: 0 } : {}}
            animate={animated ? { scale: [0, 1.2, 1] } : {}}
            transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
            className="shadow-inner"
          />

          {/* Twinkly core spark */}
          <motion.polygon
            points="50,38 53,47 62,50 53,53 50,62 47,53 38,50 47,47"
            fill="#00e5ff"
            initial={animated ? { opacity: 0, scale: 0 } : {}}
            animate={animated ? { opacity: [0, 1, 0.8], scale: [0, 1.4, 1] } : {}}
            transition={{ delay: 1.8, duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
