"use client";

import React from "react";
import { usePWA } from "@/components/pwa-provider";
import { Button } from "@/components/ui/button";
import { X, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DapajoLogo } from "@/components/campus-match/dapajo-logo";

export function PWAInstallBanner() {
  const { showBanner, isInstalled, installApp, dismissInstallPrompt } = usePWA();

  return (
    <AnimatePresence>
      {!isInstalled && showBanner && (
        <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-20 sm:bottom-6 left-4 right-4 z-50 mx-auto max-w-md"
      >
        <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-4 shadow-xl backdrop-blur-2xl">
          <div className="relative flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-50 border border-stone-200 shadow-sm">
              <DapajoLogo className="h-9 w-9" />
            </div>

            <div className="flex-1 pr-6">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
                <span>Install DAPAJO CAMPUS</span>
                <Sparkles className="h-4 w-4 text-amber-500 fill-amber-400" />
              </div>
              <p className="mt-0.5 text-xs text-stone-600 leading-relaxed">
                Tambahkan ke Layar Utama HP untuk akses cepat & pengalaman aplikasi HP native.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" onClick={installApp} className="w-full sm:w-auto text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold gap-1 rounded-xl">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Install Sekarang
                </Button>
                <Button size="sm" variant="ghost" onClick={dismissInstallPrompt} className="text-xs text-stone-500 hover:text-stone-900 rounded-xl">
                  Nanti Saja
                </Button>
              </div>
            </div>

            <button
              onClick={dismissInstallPrompt}
              className="absolute top-0 right-0 p-1 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
