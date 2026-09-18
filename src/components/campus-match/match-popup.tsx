"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, MessageSquare, X } from "lucide-react";
import { SwipeProfile, UserProfile } from "@/lib/types";
import { isVideoUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MatchPopupProps {
  matchedProfile: SwipeProfile | null;
  currentUser: UserProfile;
  onClose: () => void;
  onOpenChat: () => void;
}

export function MatchPopup({ matchedProfile, currentUser, onClose, onOpenChat }: MatchPopupProps) {
  if (!matchedProfile) return null;

  const firstName = matchedProfile.name.split(" ")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-xs rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-xl space-y-5"
      >
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 text-stone-400 hover:text-stone-900"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Dual Avatars */}
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center -space-x-4">
            {isVideoUrl(currentUser.photos[0]) ? (
              <video
                src={currentUser.photos[0]}
                className="h-16 w-16 rounded-full object-cover border-2 border-rose-500 shadow-sm z-10"
                autoPlay muted loop playsInline
              />
            ) : (
              <img
                src={currentUser.photos[0]}
                alt={currentUser.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-rose-500 shadow-sm z-10"
              />
            )}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-md z-20">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            {isVideoUrl(matchedProfile.photos[0]) ? (
              <video
                src={matchedProfile.photos[0]}
                className="h-16 w-16 rounded-full object-cover border-2 border-rose-500 shadow-sm z-10"
                autoPlay muted loop playsInline
              />
            ) : (
              <img
                src={matchedProfile.photos[0]}
                alt={matchedProfile.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-rose-500 shadow-sm z-10"
              />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Mutual Match!</h2>
          <p className="text-xs text-stone-600">
            Kamu & <strong className="text-rose-600 font-bold">{firstName}</strong> saling menyukai.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <Button
            size="default"
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className="w-full text-xs font-bold gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full py-2.5 shadow-sm"
          >
            <MessageSquare className="h-4 w-4 fill-white" />
            Mulai Chat Sekarang
          </Button>

          <button
            onClick={onClose}
            className="w-full text-xs text-stone-500 hover:text-stone-900 py-1 transition-colors font-medium"
          >
            Lanjut Swipe
          </button>
        </div>
      </motion.div>
    </div>
  );
}
