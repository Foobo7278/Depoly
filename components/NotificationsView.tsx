"use client";

import React, { useState } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  X, 
  ShieldAlert, 
  Users, 
  Sparkles,
  CheckCheck
} from "lucide-react";
import { LiveNotification, Friend } from "@/lib/types";

interface NotificationsViewProps {
  notifications: LiveNotification[];
  onMarkAllRead: () => void;
  onClearNotification: (id: string) => void;
  onAcceptFriendRequest: (senderId: string, senderName: string, senderUsername: string) => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function NotificationsView({
  notifications,
  onMarkAllRead,
  onClearNotification,
  onAcceptFriendRequest,
  onToast,
}: NotificationsViewProps) {
  
  const handleAccept = (notif: LiveNotification) => {
    if (notif.actionPayload && notif.actionPayload.type === "friend_request") {
      const { senderId, senderName, senderUsername } = notif.actionPayload;
      onAcceptFriendRequest(senderId!, senderName!, senderUsername!);
      onClearNotification(notif.id);
      onToast(`✓ Accepted friend request from ${senderName}!`, "success");
    }
  };

  const handleDecline = (notif: LiveNotification) => {
    onClearNotification(notif.id);
    onToast(`Rejected friend request of peer node.`, "info");
  };

  return (
    <div className="flex-grow flex flex-col h-full min-h-0 bg-[#080816] p-6 overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#ff4081]" />
            <h1 className="font-orbitron font-black text-lg tracking-wide text-white uppercase">IN-APP ALERTS TERMINAL</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Incoming node handshake triggers, room invitations, system hardening telemetry alerts, and compliance requests.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onMarkAllRead}
            className="px-3.5 py-1.5 border border-[#ff4081]/30 hover:border-[#ff4081] text-[#ff4081] hover:bg-[#ff4081]/15 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all uppercase flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono text-xs max-w-sm mx-auto">
          <Bell className="w-10 h-10 text-slate-800 mb-2" />
          <span>No incoming handshake messages or active telemetry events in queue.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 max-w-xl">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 bg-[#0d0d22] border rounded-xl flex items-start gap-4 transition-all relative ${
                notif.read ? "border-slate-800/60 opacity-60" : "border-[#7c4dff]/40 shadow-[0_0_12px_rgba(124,77,255,0.05)]"
              }`}
            >
              {/* Pulse light indicator for unread */}
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-[#ff4081] absolute top-4 left-4 animate-ping pointer-events-none" />
              )}

              <span className="text-2xl pt-0.5">{notif.icon}</span>

              <div className="flex-grow mr-6">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white font-orbitron tracking-tight">{notif.title}</h4>
                  <span className="text-[9px] text-slate-500 font-mono">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-400 font-mono leading-relaxed mt-1.5">{notif.desc}</p>

                {/* Accept Actions */}
                {notif.actions && notif.actionPayload?.type === "friend_request" && (
                  <div className="flex gap-2.5 mt-3.5">
                    <button
                      onClick={() => handleAccept(notif)}
                      className="px-3.5 py-1.5 bg-[#00e676]/10 hover:bg-[#00e676] border border-[#00e676]/30 text-[#00e676] hover:text-black py-1 px-3 text-[10px] font-bold font-orbitron rounded cursor-pointer transition-all flex items-center gap-1 uppercase"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Handshake</span>
                    </button>

                    <button
                      onClick={() => handleDecline(notif)}
                      className="px-3.5 py-1.5 bg-[#ff4081]/10 hover:bg-[#ff4081]/25 border border-[#ff4081]/30 text-[#ff4081] hover:text-white py-1 px-3 text-[10px] font-bold font-orbitron rounded cursor-pointer transition-all flex items-center gap-1 uppercase"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Close/delete button */}
              <button
                onClick={() => onClearNotification(notif.id)}
                className="p-1 text-slate-500 hover:text-white hover:bg-[#1a1a3a] rounded cursor-pointer absolute top-4 right-4 transition-all"
                title="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
