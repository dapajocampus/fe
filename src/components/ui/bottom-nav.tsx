"use client";

import React, { useState } from "react";
import { Briefcase, Home, Bookmark, User, Smartphone } from "lucide-react";
import { usePWA } from "@/components/pwa-provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BottomNav() {
  const [activeTab, setActiveTab] = useState("home");
  const { isInstallable, installApp } = usePWA();

  const navItems = [
    { id: "home", label: "Beranda", icon: Home },
    { id: "jobs", label: "Lowongan", icon: Briefcase },
    { id: "saved", label: "Tersimpan", icon: Bookmark },
    { id: "profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl px-3 py-2 sm:hidden pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium transition-all duration-200 cursor-pointer select-none",
                isActive ? "text-indigo-400 font-semibold" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -top-2 h-1 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Quick PWA Install Tab if installable */}
        {isInstallable && (
          <button
            onClick={installApp}
            className="flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-semibold text-purple-400 animate-pulse"
          >
            <Smartphone className="h-5 w-5 text-purple-400" />
            <span>Install HP</span>
          </button>
        )}
      </div>
    </nav>
  );
}
