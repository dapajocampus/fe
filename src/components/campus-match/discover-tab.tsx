"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Heart,
  X,
  RotateCcw,
  MessageSquareText,
  Mic,
  Info,
  Send,
  Video,
  CheckCircle2,
  Square,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { SwipeProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DiscoverTabProps {
  profiles: SwipeProfile[];
  onSwipeLike: (profile: SwipeProfile) => void;
  onSwipeSkip: (profile: SwipeProfile) => void;
  onSwipeSuperLike: (profile: SwipeProfile) => void;
  onRewind: () => void;
  canRewind: boolean;
  onReportUser: (userId: string, userName: string) => void;
  isVerified?: boolean;
  onOpenVerification?: () => void;
}

export function DiscoverTab({
  profiles,
  onSwipeLike,
  onSwipeSkip,
  onRewind,
  canRewind,
  onReportUser,
  isVerified = true,
  onOpenVerification,
}: DiscoverTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Exit Animation Direction ("right" for LIKE, "left" for SKIP)
  const [exitDirection, setExitDirection] = useState<"right" | "left" | null>(null);

  // Modals state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuickTextModal, setShowQuickTextModal] = useState(false);
  const [showMediaNoteModal, setShowMediaNoteModal] = useState(false);
  const [mediaNoteMode, setMediaNoteMode] = useState<"voice" | "video">("voice");

  // Form input state
  const [quickText, setQuickText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaSentSuccess, setMediaSentSuccess] = useState(false);

  const currentProfile = profiles[currentIndex];

  // Drag Motion Values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-20, 20]);
  const likeOpacity = useTransform(x, [15, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-15, -100], [0, 1]);
  const likeScale = useTransform(x, [15, 100], [0.85, 1.15]);
  const skipScale = useTransform(x, [-15, -100], [0.85, 1.15]);

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 90 || velocity > 300) {
      handleLike();
    } else if (offset < -90 || velocity < -300) {
      handleSkip();
    }
  };

  const handleLike = () => {
    if (!currentProfile) return;
    setExitDirection("right");
    onSwipeLike(currentProfile);
    setTimeout(() => {
      nextCard();
    }, 220);
  };

  const handleSkip = () => {
    if (!currentProfile) return;
    setExitDirection("left");
    onSwipeSkip(currentProfile);
    setTimeout(() => {
      nextCard();
    }, 220);
  };

  const nextCard = () => {
    setCurrentIndex((prev) => prev + 1);
    setPhotoIndex(0);
    setExitDirection(null);
    x.set(0);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentProfile) return;
    if (photoIndex < currentProfile.photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    } else {
      setPhotoIndex(0);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentProfile) return;
    if (photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    } else {
      setPhotoIndex(currentProfile.photos.length - 1);
    }
  };

  const handleSendQuickText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;
    setShowQuickTextModal(false);
    setQuickText("");
    handleLike();
  };

  const startRecordingSimulation = () => {
    setIsRecording(true);
    setRecordingSeconds(1);
    const interval = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsRecording(false);
          setMediaSentSuccess(true);
          setTimeout(() => {
            setMediaSentSuccess(false);
            setShowMediaNoteModal(false);
            handleLike();
          }, 1200);
          return 5;
        }
        return prev + 1;
      });
    }, 1000);
  };

  if (!currentProfile || currentIndex >= profiles.length) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30">
          <Sparkles className="h-8 w-8 text-rose-500 animate-pulse fill-rose-500/20" />
        </div>
        <div className="space-y-1 max-w-xs">
          <h3 className="text-lg font-bold text-stone-900">Semua Profil Telah Dilihat</h3>
          <p className="text-xs text-stone-600">
            Kamu sudah melihat seluruh rekomendasi mahasiswa di sekitarmu.
          </p>
        </div>
        <Button variant="glow" onClick={() => setCurrentIndex(0)} className="gap-2 text-xs bg-rose-500 hover:bg-rose-600 text-white">
          <RotateCcw className="h-3.5 w-3.5" />
          Ulangi Discover
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-[calc(100vh-175px)] max-w-md mx-auto px-3 pt-2 pb-2 overflow-hidden">
      {/* STUDENT VERIFICATION LOCK OVERLAY IF NOT VERIFIED */}
      {!isVerified && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md rounded-3xl animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-rose-500/40 bg-white p-5 text-center shadow-2xl space-y-4 my-auto">
            {/* Icon */}
            <div className="relative inline-flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg animate-bounce">
                <ShieldAlert className="h-9 w-9 fill-rose-500/20" />
              </div>
              <Lock className="absolute -top-2 -right-2 h-6 w-6 text-amber-500 fill-amber-400" />
            </div>

            {/* Text */}
            <div className="space-y-1.5">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Verifikasi Mahasiswa Diperlukan 🎓
              </span>
              <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                Belum Diberikan Akses Geser Card
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Demi keamanan, privasi, dan keaslian status sesama mahasiswa, kamu <strong>wajib memverifikasi NIM / Email Kampus</strong> sebelum dapat mulai mencari atau menggeser card mahasiswa.
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={onOpenVerification}
              size="lg"
              variant="glow"
              className="w-full text-xs font-bold gap-2 bg-rose-500 hover:bg-rose-600 text-white shadow-md rounded-full py-3 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              Verifikasi Identitas Mahasiswa Sekarang
            </Button>
          </div>
        </div>
      )}

      {/* Card Stack Container */}
      <div className={`relative w-full h-full flex-1 transition-all ${!isVerified ? "blur-xl opacity-20 pointer-events-none select-none filter" : ""}`}>
        {/* Next Card Background Preview */}
        {profiles[currentIndex + 1] && (
          <div className="absolute inset-0 rounded-3xl border border-stone-200 bg-white scale-95 translate-y-3 opacity-60 pointer-events-none overflow-hidden shadow-sm">
            <img
              src={profiles[currentIndex + 1].photos[0]}
              alt="Next Profile"
              className="h-full w-full object-cover opacity-50"
            />
          </div>
        )}

        {/* Current Active Swipe Card with Smooth Exit Animation */}
        <AnimatePresence>
          <motion.div
            key={currentProfile.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0.8, y: 15 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              x: exitDirection === "right" ? 500 : exitDirection === "left" ? -500 : 0,
              rotate: exitDirection === "right" ? 25 : exitDirection === "left" ? -25 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing rounded-3xl border border-stone-200 bg-white shadow-md overflow-hidden touch-none select-none"
          >
            {/* Photo background */}
            <div className="relative h-full w-full">
              <img
                src={currentProfile.photos[photoIndex]}
                alt={currentProfile.name}
                className="h-full w-full object-cover pointer-events-none select-none"
              />

              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none" />

              {/* Photo indicators bar */}
              {currentProfile.photos.length > 1 && (
                <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5 pointer-events-none">
                  {currentProfile.photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        idx === photoIndex ? "bg-white shadow-sm" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Photo navigation tap zone (top 33% only) */}
              <div className="absolute top-0 left-0 right-0 h-1/3 flex z-20 pointer-events-auto">
                <div className="w-1/2 h-full cursor-pointer" onClick={prevPhoto} title="Foto sebelumnya" />
                <div className="w-1/2 h-full cursor-pointer" onClick={nextPhoto} title="Foto selanjutnya" />
              </div>

              {/* FULL CARD EMERALD GLOW OVERLAY WITH HEART ICON (LIKE / RIGHT DRAG) */}
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-emerald-500/35 backdrop-blur-[2px] pointer-events-none transition-all"
              >
                <motion.div
                  style={{ scale: likeScale }}
                  className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-600/80 border-4 border-white/90"
                >
                  <Heart className="h-16 w-16 fill-white text-white" />
                </motion.div>
              </motion.div>

              {/* FULL CARD RED GLOW OVERLAY WITH X ICON (SKIP / LEFT DRAG) */}
              <motion.div
                style={{ opacity: skipOpacity }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-rose-500/35 backdrop-blur-[2px] pointer-events-none transition-all"
              >
                <motion.div
                  style={{ scale: skipScale }}
                  className="flex h-28 w-28 items-center justify-center rounded-full bg-rose-500 text-white shadow-2xl shadow-rose-600/80 border-4 border-white/90"
                >
                  <X className="h-16 w-16 stroke-[3.5]" />
                </motion.div>
              </motion.div>

              {/* Top Verified Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-white/95 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-emerald-700 shadow-sm pointer-events-none">
                <ShieldCheck className="h-3.5 w-3.5 fill-emerald-500/20" />
                <span>Verified Student</span>
              </div>

              {/* Profile Info Summary Overlay */}
              <div className="absolute bottom-18 left-0 right-0 z-20 p-5 space-y-2 pointer-events-none">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{currentProfile.name}</h2>
                      <span className="text-xl font-medium text-stone-200 drop-shadow-md">{currentProfile.age}</span>
                    </div>

                    <p className="text-xs text-rose-300 font-bold mt-0.5 drop-shadow-md">
                      {currentProfile.university} • {currentProfile.major}
                    </p>
                  </div>

                  {/* Info Detail Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetailModal(true);
                    }}
                    className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-800 border border-stone-200 hover:bg-white transition-all shadow-sm cursor-pointer"
                    title="Rincian Profil"
                  >
                    <Info className="h-4.5 w-4.5 text-rose-600 fill-rose-500/20" />
                  </button>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-stone-200 line-clamp-1 drop-shadow-md">
                  {currentProfile.bio}
                </p>

                {/* Interest Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentProfile.interests.slice(0, 3).map((interest) => (
                    <span
                      key={interest}
                      className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-stone-900 border border-stone-200 backdrop-blur-md shadow-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5-ACTION FLOATING CONTROLS */}
              <div className="absolute bottom-3 left-0 right-0 z-30 flex items-center justify-center gap-3 px-3 pointer-events-auto">
                {/* 1. BACK */}
                <button
                  onClick={onRewind}
                  disabled={!canRewind}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all shadow-md cursor-pointer ${
                    canRewind
                      ? "border-amber-500/40 bg-white/95 text-amber-600 hover:scale-105"
                      : "border-stone-200 bg-white/50 text-stone-400 cursor-not-allowed"
                  }`}
                  title="Back / Undo"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* 2. SKIP */}
                <button
                  onClick={handleSkip}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/40 bg-white/95 text-rose-500 hover:scale-105 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-md"
                  title="Skip"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* 3. LOVE */}
                <button
                  onClick={handleLike}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:scale-105 transition-all cursor-pointer"
                  title="Love / Like"
                >
                  <Heart className="h-7 w-7 fill-white" />
                </button>

                {/* 4. TEXT SINGKAT */}
                <button
                  onClick={() => setShowQuickTextModal(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/40 bg-white/95 text-purple-600 hover:scale-105 hover:bg-purple-600 hover:text-white transition-all cursor-pointer shadow-md"
                  title="Pesan Teks"
                >
                  <MessageSquareText className="h-4.5 w-4.5 fill-current" />
                </button>

                {/* 5. VOICE NOTE */}
                <button
                  onClick={() => {
                    setMediaNoteMode("voice");
                    setShowMediaNoteModal(true);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/40 bg-white/95 text-cyan-600 hover:scale-105 hover:bg-cyan-600 hover:text-white transition-all cursor-pointer shadow-md"
                  title="Voice Note"
                >
                  <Mic className="h-4.5 w-4.5 fill-current" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MODAL 1: TEXT SINGKAT */}
      <AnimatePresence>
        {showQuickTextModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-5 shadow-xl space-y-3 relative"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-bold text-stone-900">Kirim Pesan Teks</span>
                <button onClick={() => setShowQuickTextModal(false)} className="text-stone-400 hover:text-stone-900 text-xs cursor-pointer">
                  ✕
                </button>
              </div>

              <p className="text-xs text-stone-700">
                Pesan untuk <strong className="text-rose-600">{currentProfile.name}</strong>:
              </p>

              <form onSubmit={handleSendQuickText} className="space-y-3">
                <textarea
                  rows={2}
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  placeholder={`Hai ${currentProfile.name.split(" ")[0]}, suka ${currentProfile.interests[0] || "ngopi"} juga ya?`}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-900 placeholder-stone-400 focus:border-rose-500 focus:outline-none"
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowQuickTextModal(false)} className="text-xs border-stone-200 text-stone-700 rounded-xl">
                    Batal
                  </Button>
                  <Button type="submit" size="sm" variant="glow" disabled={!quickText.trim()} className="text-xs gap-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl">
                    <Send className="h-3 w-3 fill-white" />
                    Kirim & Like
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: VOICE & VIDEO NOTE */}
      <AnimatePresence>
        {showMediaNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-5 text-center shadow-xl space-y-3 relative"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-bold text-stone-900">
                  {mediaNoteMode === "voice" ? "🎙️ Voice Note" : "📹 Video Note"}
                </span>

                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-full border border-stone-200">
                  <button
                    onClick={() => setMediaNoteMode("voice")}
                    className={`p-1 rounded-full text-xs cursor-pointer ${mediaNoteMode === "voice" ? "bg-cyan-600 text-white" : "text-stone-500"}`}
                  >
                    <Mic className="h-3 w-3 fill-current" />
                  </button>
                  <button
                    onClick={() => setMediaNoteMode("video")}
                    className={`p-1 rounded-full text-xs cursor-pointer ${mediaNoteMode === "video" ? "bg-pink-600 text-white" : "text-stone-500"}`}
                  >
                    <Video className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </div>

              {mediaSentSuccess ? (
                <div className="py-4 space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto animate-bounce fill-emerald-500/20" />
                  <h4 className="text-xs font-bold text-stone-900">Pesan Media Terkirim!</h4>
                </div>
              ) : (
                <div className="py-2 space-y-3 flex flex-col items-center">
                  <p className="text-xs text-stone-700">
                    Rekam pesan singkat untuk <strong className="text-rose-600">{currentProfile.name}</strong>
                  </p>

                  <div className="text-xs text-stone-500 font-mono">
                    {isRecording ? `Merekam... 0:0${recordingSeconds}` : "Tekan untuk merekam"}
                  </div>

                  <button
                    onClick={startRecordingSimulation}
                    disabled={isRecording}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all cursor-pointer ${
                      isRecording ? "bg-rose-500 animate-ping" : "bg-cyan-600 hover:bg-cyan-700"
                    }`}
                  >
                    {isRecording ? <Square className="h-5 w-5 fill-white" /> : <Mic className="h-6 w-6 fill-white" />}
                  </button>

                  <button onClick={() => setShowMediaNoteModal(false)} className="text-xs text-stone-500 hover:text-stone-900 pt-1 cursor-pointer">
                    Batal
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Detail Drawer */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-sm p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-stone-200 bg-white p-5 shadow-xl max-h-[80vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <h3 className="text-lg font-bold text-stone-900">{currentProfile.name}, {currentProfile.age}</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-stone-400 hover:text-stone-900 text-xs cursor-pointer">
                  ✕
                </button>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2 text-xs">
                <span className="font-bold text-rose-600 block">Kecocokan Profile: {currentProfile.compatibility.totalScore}%</span>
                <p className="text-stone-700">{currentProfile.bio}</p>
                <div className="pt-1 flex flex-wrap gap-1">
                  {currentProfile.interests.map((i) => (
                    <Badge key={i} variant="outline" className="text-[10px] border-stone-200 text-stone-700">
                      {i}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <button onClick={() => onReportUser(currentProfile.id, currentProfile.name)} className="text-rose-600 hover:underline font-medium cursor-pointer">
                  Laporkan Profil
                </button>
                <Button size="sm" variant="secondary" onClick={() => setShowDetailModal(false)} className="text-xs border-stone-200 text-stone-700 rounded-xl">
                  Tutup
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
