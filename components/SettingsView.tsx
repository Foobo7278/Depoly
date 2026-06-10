"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Wifi, 
  Trash2, 
  VolumeX, 
  Volume2, 
  Activity, 
  Terminal, 
  ToggleLeft, 
  ToggleRight,
  ShieldCheck,
  Compass,
  Play,
  RefreshCw
} from "lucide-react";

interface SettingsViewProps {
  settings: {
    audioEnabled: boolean;
    streamstats: boolean;
    telemetryLogging: boolean;
  };
  onSaveSettings: (next: any) => void;
  onClearCaches: () => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function SettingsView({
  settings,
  onSaveSettings,
  onClearCaches,
  onToast,
}: SettingsViewProps) {
  const toggleAudio = () => {
    const next = { ...settings, audioEnabled: !settings.audioEnabled };
    onSaveSettings(next);
    onToast(next.audioEnabled ? "🔊 System audio handshakes enabled." : "🔇 System audio handshakes muted.", "info");
  };

  const toggleStats = () => {
    const next = { ...settings, streamstats: !settings.streamstats };
    onSaveSettings(next);
    onToast(next.streamstats ? "📈 Stream stats activated on navbar." : "📉 Stream stats deactivated on navbar.", "info");
  };

  const toggleTelemetry = () => {
    const next = { ...settings, telemetryLogging: !settings.telemetryLogging };
    onSaveSettings(next);
    onToast(next.telemetryLogging ? "📝 Secure telemetry session logging enabled." : "🚫 Secure telemetry session logging disabled.", "info");
  };

  const clearCacheHandler = () => {
    if (confirm("Are you sure you want to purge all local node identities, friend configurations, and decrypted history files? This action is irreversible.")) {
      onClearCaches();
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full min-h-0 bg-[#080816] p-6 overflow-y-auto w-full">
      
      {/* Header */}
      <div className="border-b border-slate-900 pb-5 mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#00e5ff]" />
          <h1 className="font-orbitron font-black text-lg tracking-wide text-white uppercase font-bold">SYSTEM PROPERTIES</h1>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Adjust your account client indicators, sound elements, noise controls and manage local storage registry data.
        </p>
      </div>

      <div className="max-w-3xl flex flex-col gap-6">
        
        {/* Tunnel controls */}
        <div className="p-5 bg-[#0d0d22] border border-[#1b1b45] rounded-xl flex flex-col gap-4">
          <h2 className="font-orbitron font-bold text-xs text-[#00e5ff] uppercase flex items-center gap-2 tracking-wider">
            <Terminal className="w-4 h-4 text-[#7c4dff]" />
            <span>TUNNEL CONTROLS</span>
          </h2>

          {/* Preference item A */}
          <div className="flex items-center justify-between py-2 border-b border-[#1b1b45]/60 pb-3">
            <div>
              <h3 className="text-xs font-semibold text-white">Audio notifications</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Play sounds when a peer connects successfully or sends messages.</p>
            </div>
            <button onClick={toggleAudio} className="cursor-pointer">
              {settings.audioEnabled ? (
                <ToggleRight className="w-9 h-9 text-[#00e676]" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-600" />
              )}
            </button>
          </div>

          {/* Preference item B */}
          <div className="flex items-center justify-between py-2 border-b border-[#1b1b45]/60 pb-3">
            <div>
              <h3 className="text-xs font-semibold text-white">Show connection metrics</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Display live connection status and speed parameters on navigation bars.</p>
            </div>
            <button onClick={toggleStats} className="cursor-pointer">
              {settings.streamstats ? (
                <ToggleRight className="w-9 h-9 text-[#00e676]" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-600" />
              )}
            </button>
          </div>

          {/* Preference item C */}
          <div className="flex items-center justify-between py-2 pb-1">
            <div>
              <h3 className="text-xs font-semibold text-white">Save conversation history</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-mono">Retain completed room logs and text logs on your secure device storage.</p>
            </div>
            <button onClick={toggleTelemetry} className="cursor-pointer">
              {settings.telemetryLogging ? (
                <ToggleRight className="w-9 h-9 text-[#7c4dff]" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Destructive cache clearing */}
        <div className="p-5 bg-gradient-to-r from-[#ff4081]/5 to-transparent border border-[#ff4081]/25 rounded-xl flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold font-orbitron text-[#ff4081] uppercase tracking-wide">DANGER ZONE</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              Erase local files cached. This resets your permanent user ID hash and clears out all linked contacts and history logs completely.
            </p>
          </div>
          <button
            onClick={clearCacheHandler}
            className="w-fit px-4 py-2 bg-[#ff4081]/10 hover:bg-[#ff4081] text-[#ff4081] hover:text-white border border-[#ff4081]/30 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer"
          >
            PURGE ALL REGISTRY DATA
          </button>
        </div>

      </div>
    </div>
  );
}
