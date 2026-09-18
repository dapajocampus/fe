"use client";

import React from "react";
import { ShieldCheck, SlidersHorizontal, Bell } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { DapajoLogo } from "@/components/campus-match/dapajo-logo";

interface TopHeaderProps {
  currentUser: UserProfile;
  onOpenVerification: () => void;
  onOpenPreferences: () => void;
  onToggleVerification?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
  activeTab: string;
}

export function TopHeader({
  currentUser,
  onOpenVerification,
  onOpenPreferences,
  onOpenNotifications,
  unreadNotificationCount = 0,
  activeTab,
}: TopHeaderProps) {
  const isVerified = currentUser.verification?.isVerified;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#f7f4ee]/95 backdrop-blur-xl px-4 pt-10 sm:pt-3 pb-2.5">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        {/* Brand Logo & Compact Title */}
        <div className="flex items-center gap-2.5">
          <DapajoLogo className="h-9 w-9 shrink-0 drop-shadow-sm" />
          <div className="min-w-0">
            <span className="text-base font-bold tracking-tight text-stone-900 block leading-tight truncate">
              DAPAJO CAMPUS
            </span>
            <span className="text-[9px] text-stone-500 font-medium block leading-none truncate max-w-[140px] sm:max-w-none">
              student-only dating platform
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Notification Bell Button */}
          <button
            onClick={onOpenNotifications}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 hover:text-stone-900 shadow-2xs transition-all cursor-pointer hover:bg-stone-50"
            title="Notifikasi & Pengumuman Kampus"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-2xs animate-pulse">
                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Verified / Unverified Student Badge */}
          <button
            onClick={onOpenVerification}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              isVerified
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                : "border-amber-500/40 bg-amber-500/15 text-amber-800 hover:bg-amber-500/25"
            }`}
            title="Klik untuk melihat atau mengajukan Verifikasi KTM"
          >
            <ShieldCheck className={`h-3.5 w-3.5 ${isVerified ? "fill-emerald-500/20" : "text-amber-600 fill-amber-500/20"}`} />
            <span className="text-[11px]">{isVerified ? "Verified ✓" : "Verifikasi 🔒"}</span>
          </button>

          {/* Filter Button */}
          {activeTab === "discover" && (
            <button
              onClick={onOpenPreferences}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 hover:text-stone-900 shadow-2xs transition-all cursor-pointer hover:bg-stone-50"
              title="Filter Preferensi"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 fill-current" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
