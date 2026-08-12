"use client";

import React from "react";
import { usePWA } from "@/components/pwa-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Wifi, WifiOff, Smartphone, Bell } from "lucide-react";
import { motion } from "framer-motion";

export function TopHeader() {
  const { isOffline, isInstallable, isInstalled, installApp } = usePWA();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-500/30 text-white font-black text-lg tracking-wider"
          >
            DP
          </motion.div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
              DAPAJO
            </span>
            <span className="ml-2 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
              PWA
            </span>
          </div>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Status Badge */}
          {isOffline ? (
            <Badge variant="warning" className="animate-pulse">
              <WifiOff className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Mode Offline</span>
            </Badge>
          ) : (
            <Badge variant="success">
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Online</span>
            </Badge>
          )}

          {/* Installed Indicator or Install Button */}
          {isInstalled ? (
            <Badge variant="purple" className="hidden sm:flex">
              <Smartphone className="h-3.5 w-3.5" />
              <span>App Native</span>
            </Badge>
          ) : isInstallable ? (
            <Button
              size="sm"
              variant="glow"
              onClick={installApp}
              className="gap-1.5 text-xs font-semibold px-3"
            >
              <Download className="h-4 w-4" />
              <span>Install HP</span>
            </Button>
          ) : null}

          {/* Notification Button */}
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
