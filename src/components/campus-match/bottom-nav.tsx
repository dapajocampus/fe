"use client";

import React from "react";
import { GraduationCap, Compass, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount?: number;
}

export function BottomNav({ activeTab, setActiveTab, unreadCount = 1 }: BottomNavProps) {
  const navItems = [
    { id: "discover", label: "Discover", icon: GraduationCap },
    { id: "nearby", label: "Nearby", icon: Compass },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/80 bg-white/95 backdrop-blur-2xl px-3 py-2 pb-safe shadow-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium transition-all duration-200 cursor-pointer select-none",
                isActive ? "text-rose-600 font-bold" : "text-stone-500 hover:text-stone-800"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-2 h-1 w-10 rounded-full bg-rose-500 shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "scale-110 text-rose-500 fill-current" : "fill-none"
                  )}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </div>

              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
