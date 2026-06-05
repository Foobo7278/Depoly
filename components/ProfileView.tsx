"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { 
  User, 
  ShieldCheck, 
  Globe, 
  Upload, 
  Check, 
  ImageIcon, 
  Trash2,
  Sparkles,
  Camera,
  Layers
} from "lucide-react";
import { UserProfile } from "@/lib/types";

interface ProfileViewProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
  theme: "dark" | "light";
  onLogout?: () => void;
}

export default function ProfileView({
  profile,
  onSaveProfile,
  onToast,
  theme,
  onLogout,
}: ProfileViewProps) {
  const isDark = theme === "dark";

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [country, setCountry] = useState(profile.country);
  const [age, setAge] = useState(profile.age);
  const [avatar, setAvatar] = useState(profile.avatar || "");
  const [saving, setSaving] = useState(false);

  // Gallery Upload Specifics
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const countries = [
    "🌍 Worldwide",
    "🇺🇸 USA Node",
    "🇬🇧 UK Node",
    "🇨🇦 Canada Node",
    "🇩🇪 Germany Node",
    "🇯🇵 Japan Node",
    "🇧🇷 Brazil Node",
    "🇮🇳 India Node",
    "🇦🇺 Australia Node",
    "🇸🇬 Singapore Node"
  ];

  const presetAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
  ];

  // Process selected file
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onToast("Selected file must be a valid image!", "error");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      onToast("Image must be smaller than 4MB!", "error");
      return;
    }

    // Start simulation progress
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setAvatar(reader.result as string);
        onToast("Profile image loaded from gallery successfully!", "success");
        setTimeout(() => setUploadProgress(null), 800);
      }, 600);
    };
    reader.onerror = () => {
      clearInterval(interval);
      setUploadProgress(null);
      onToast("Failed to read image file.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    setSaving(true);
    let finalUser = username.trim();
    if (!finalUser.startsWith("@")) {
      finalUser = `@${finalUser}`;
    }

    if (!displayName.trim()) {
      onToast("Display name cannot be blank!", "error");
      setSaving(false);
      return;
    }

    if (age < 18) {
      onToast("Warning: You must declare at least 18 years of age.", "error");
      setSaving(false);
      return;
    }

    setTimeout(() => {
      const updated: UserProfile = {
        ...profile,
        displayName: displayName.trim(),
        username: finalUser,
        bio: bio.trim(),
        country,
        age,
        avatar: avatar.trim() || null,
      };

      onSaveProfile(updated);
      setSaving(false);
      onToast("✓ Profile changes saved to secure local memory.", "success");
    }, 600);
  };

  return (
    <div className={`flex-grow flex flex-col h-full min-h-0 p-6 overflow-y-auto transition-colors duration-300 ${
      isDark ? "bg-[#080816] text-white" : "bg-[#f8fafc] text-slate-800"
    }`}>
      
      {/* Redesigned Minimal Glassmorphic Header */}
      <div className={`border-b pb-5 mb-6 ${isDark ? "border-slate-800/80" : "border-slate-200"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isDark ? "bg-white/5 text-[#00e5ff]" : "bg-[#00e5ff]/10 text-[#0c9cae]"}`}>
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg tracking-tight">Profile Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your handle, bio, and display photo. This identity is visible to people you get matched with.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side: Avatar Customization */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className={`border rounded-2xl p-5 ${
            isDark 
              ? "bg-[#0d0d22]/90 border-white/5 shadow-xl backdrop-blur-md" 
              : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>Profile Image</span>
            </h3>

            {/* Profile Avatar Frame */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className={`w-28 h-28 rounded-full overflow-hidden border-2 flex items-center justify-center transition-all ${
                  isDark ? "border-purple-500 bg-[#161633]" : "border-slate-300 bg-slate-50"
                }`}>
                  {avatar.trim() ? (
                    <Image src={avatar} alt="Avatar" width={112} height={112} unoptimized referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-slate-400 font-sans">
                      {displayName.substring(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                {avatar.trim() && (
                  <button
                    onClick={() => setAvatar("")}
                    className="absolute -top-1 -right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow cursor-pointer"
                    title="Remove avatar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Gallery Image Drag & Drop region */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? "border-[#00e5ff] bg-[#00e5ff]/5 scale-[0.98]" 
                    : isDark 
                    ? "border-slate-800/80 bg-white/2 hover:border-[#00e5ff]/50 hover:bg-white/5" 
                    : "border-slate-300 hover:border-[#00e5ff] hover:bg-[#00e5ff]/5"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <Upload className={`w-5 h-5 mx-auto mb-2 text-slate-400 ${
                  uploadProgress !== null ? "animate-bounce" : ""
                }`} />

                <span className="text-xs font-semibold block">
                  {uploadProgress !== null ? "Uploading..." : "Import photo from gallery"}
                </span>
                
                <span className="text-[10px] text-slate-500 block mt-1">
                  Drag and drop image or click to browse
                </span>

                {/* Progress bar info */}
                {uploadProgress !== null && (
                  <div className="w-full bg-slate-800/50 rounded-full h-1 mt-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Preset Avatars Selection */}
              <div className="w-full mt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
                  Or select a premium preset
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {presetAvatars.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setAvatar(url);
                        onToast("Designer avatar preset loaded!", "success");
                      }}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                        avatar === url 
                          ? "border-[#00e5ff] shadow-md scale-95" 
                          : isDark ? "border-transparent" : "border-slate-200"
                      }`}
                    >
                      <Image src={url} alt={`Preset ${i}`} width={48} height={48} unoptimized referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Identity Details Form */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className={`border rounded-2xl p-6 ${
            isDark 
              ? "bg-[#0d0d22]/90 border-white/5 shadow-xl backdrop-blur-md" 
              : "bg-white border-slate-200/80 shadow-sm"
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Personal Details</span>
            </h3>

            <div className="flex flex-col gap-4">
              
              {/* Display name + User handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl py-2.5 px-3 outline-none border transition-all ${
                      isDark 
                        ? "bg-[#11112b] border-[#1b1b45] focus:border-[#00e5ff] text-white" 
                        : "bg-slate-50 border-slate-200 focus:border-[#00e5ff] text-slate-850"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full text-xs font-mono rounded-xl py-2.5 px-3 outline-none border transition-all ${
                      isDark 
                        ? "bg-[#11112b] border-[#1b1b45] focus:border-[#00e5ff] text-white" 
                        : "bg-slate-50 border-slate-200 focus:border-[#00e5ff] text-slate-850"
                    }`}
                  />
                </div>
              </div>

              {/* Region Location node & Age slide block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Worldwide Region Node
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`w-full text-xs font-semibold rounded-xl py-2.5 px-3 outline-none border transition-all cursor-pointer ${
                      isDark 
                        ? "bg-[#11112b] border-[#1b1b45] focus:border-[#00e5ff] text-white" 
                        : "bg-slate-50 border-slate-200 focus:border-[#00e5ff] text-slate-850"
                    }`}
                  >
                    {countries.map((c, i) => (
                      <option key={i} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Age Verified: <span className="font-bold text-[#00e5ff] font-sans">{age} yrs</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-slate-400">18</span>
                    <input
                      type="range"
                      min={18}
                      max={100}
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value))}
                      className="flex-grow h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#7c4dff]"
                    />
                    <span className="text-[10px] font-semibold text-slate-400">100</span>
                  </div>
                </div>
              </div>

              {/* Bio description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  About Me / Biography
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`w-full text-xs rounded-xl py-2.5 px-3 outline-none border transition-all resize-none ${
                    isDark 
                      ? "bg-[#11112b] border-[#1b1b45] focus:border-[#00e5ff] text-white" 
                      : "bg-slate-50 border-slate-200 focus:border-[#00e5ff] text-slate-850"
                  }`}
                />
              </div>

              {/* Status banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between font-sans text-xs ${
                isDark 
                  ? "bg-white/2 border-white/5 text-slate-300" 
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Trust Score: <span className="font-bold">{profile.rating} / 5.0</span></span>
                </div>
                <div>Plan: <span className="text-[#ff4081] font-bold">{profile.memberType} Tier</span></div>
              </div>

              {/* Save trigger button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full mt-2 py-3 bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] hover:from-[#02b3c7] hover:to-[#5e2bff] text-white hover:scale-[1.01] font-bold text-xs rounded-xl cursor-pointer shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4.5 h-4.5" />
                )}
                <span>Save Profile Credentials</span>
              </button>

              {onLogout && (
                <div className="pt-3 border-t border-dashed border-slate-800 mt-2">
                  <button
                    onClick={onLogout}
                    className="w-full py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    🔐 Disconnect Google Session
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
