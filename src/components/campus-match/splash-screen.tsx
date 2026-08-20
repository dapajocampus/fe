"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DapajoLogo } from "@/components/campus-match/dapajo-logo";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#f7f4ee] px-6 py-12 text-center animate-in fade-in duration-300">
          <div className="w-full flex-1 flex flex-col items-center justify-center space-y-6">
            {/* Official Logo Display */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <DapajoLogo className="h-28 w-28 drop-shadow-md" />
            </motion.div>

            {/* Title */}
            <div className="space-y-1">
              <motion.h1
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold tracking-tight text-stone-900"
              >
                DAPAJO CAMPUS
              </motion.h1>

              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-rose-600 font-semibold"
              >
                student-only dating & connection platform
              </motion.p>
            </div>
          </div>

          {/* Loading Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center space-y-3"
          >
            <div className="h-1 w-24 rounded-full bg-stone-200 overflow-hidden">
              <div className="h-full w-full bg-rose-500" />
            </div>
            <span className="text-[10px] text-stone-500 font-medium">Khusus Mahasiswa Terverifikasi Indonesia</span>
          </motion.div>
    </div>
  );
}
