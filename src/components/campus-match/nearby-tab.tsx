"use client";

import React, { useState } from "react";
import { Compass, MapPin, Heart, Building2, Crown, Sparkles, Check, X, ShieldCheck, Lock, CheckCircle2, ChevronLeft, ChevronRight, Image } from "lucide-react";
import { NearbyStudent } from "@/lib/types";
import { isVideoUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NearbyTabProps {
  students: NearbyStudent[];
  onSelectStudent: (student: NearbyStudent) => void;
  onLikeStudent: (student: NearbyStudent) => void;
  isRajaMember?: boolean;
  onUpgradeRaja?: () => void;
}

export function NearbyTab({
  students,
  onSelectStudent,
  onLikeStudent,
  isRajaMember: externalIsRaja,
  onUpgradeRaja,
}: NearbyTabProps) {
  const [internalIsRaja, setInternalIsRaja] = useState(false);
  const isRaja = externalIsRaja ?? internalIsRaja;

  const [selectedCampus, setSelectedCampus] = useState("Semua Kampus");
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<NearbyStudent | null>(null);
  const [activeModalPhotoIndex, setActiveModalPhotoIndex] = useState(0);

  const campuses = ["Semua Kampus", "UGM", "Amikom", "UI", "UNY", "ITB"];

  const filteredStudents = students.filter((s) => {
    if (selectedCampus === "Semua Kampus") return true;
    return s.university.toLowerCase().includes(selectedCampus.toLowerCase());
  });

  const handleUpgrade = () => {
    if (onUpgradeRaja) {
      onUpgradeRaja();
    }
    setInternalIsRaja(true);
  };

  const handleOpenStudentModal = (student: NearbyStudent) => {
    setSelectedStudentForModal(student);
    setActiveModalPhotoIndex(0);
  };

  const handleLikeAndMatch = (student: NearbyStudent) => {
    setSelectedStudentForModal(null);
    onLikeStudent(student);
  };

  return (
    <div className="relative min-h-[85vh] mx-auto max-w-lg px-4 py-4 pb-32 overflow-hidden bg-[#f7f4ee]">
      {/* 1. BLURRED PAGE CONTENT IF NOT RAJA MEMBER */}
      <div className={`space-y-4 transition-all duration-500 ${!isRaja ? "blur-xl opacity-20 pointer-events-none select-none filter" : ""}`}>
        {/* Simplified Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Compass className="h-5 w-5 text-rose-500 fill-rose-500/20" />
              <span>Mahasiswa Sekitar</span>
              {isRaja && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="h-3 w-3 text-amber-600 fill-amber-500" /> RAJA
                </span>
              )}
            </h2>
            <p className="text-xs text-stone-500">Koneksi mahasiswa aktif di sekitar kampustu</p>
          </div>

          <span className="text-[11px] font-bold text-stone-700 bg-white border border-stone-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
            Sleman, DIY
          </span>
        </div>

        {/* Campus Filter Horizontal Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {campuses.map((campus) => (
            <button
              key={campus}
              onClick={() => setSelectedCampus(campus)}
              className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                selectedCampus === campus
                  ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                  : "bg-white text-stone-600 border-stone-200 hover:text-stone-900"
              }`}
            >
              {campus}
            </button>
          ))}
        </div>

        {/* Nearby Student Grid (Clean 2-Column) */}
        <div className="grid grid-cols-2 gap-3.5">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => handleOpenStudentModal(student)}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white hover:border-rose-500/40 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
            >
              {/* Student Photo */}
              <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                {isVideoUrl(student.photos[0]) ? (
                  <video
                    src={student.photos[0]}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none select-none"
                  />
                ) : (
                  <img
                    src={student.photos[0]}
                    alt={student.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none select-none"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

                {/* Online status indicator */}
                {student.isOnline && (
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-700">Online</span>
                  </div>
                )}

                {/* Distance badge */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[10px] font-bold text-white bg-stone-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                  <MapPin className="h-3 w-3 text-rose-400 fill-rose-400" />
                  ~{student.distanceApproxKm} km
                </div>

                {/* Quick Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeAndMatch(student);
                  }}
                  className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:scale-110 transition-all cursor-pointer"
                  title="Kirim Wave / Like untuk Match"
                >
                  <Heart className="h-4 w-4 fill-white" />
                </button>
              </div>

              {/* Student details */}
              <div className="p-3 space-y-1">
                <h3 className="font-bold text-stone-900 text-sm truncate">{student.name}, {student.age}</h3>
                <div className="flex items-center gap-1 text-[11px] text-stone-500 truncate">
                  <Building2 className="h-3 w-3 text-rose-500 shrink-0" />
                  <span className="truncate">{student.university}</span>
                </div>
                <p className="text-[10px] text-stone-600 line-clamp-1 italic">
                  "{student.bio}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STUDENT DETAIL CARD MODAL (SHOW ALL PHOTOS CAROUSEL + GALLERY THUMBNAILS) */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm max-h-[78vh] my-auto overflow-y-auto rounded-3xl border border-stone-200 bg-white shadow-2xl space-y-3 scrollbar-none flex flex-col">
            {/* Modal Header Photo Carousel */}
            <div className="relative h-52 w-full bg-stone-900 shrink-0">
              {isVideoUrl(selectedStudentForModal.photos[activeModalPhotoIndex] || selectedStudentForModal.photos[0]) ? (
                <video
                  src={selectedStudentForModal.photos[activeModalPhotoIndex] || selectedStudentForModal.photos[0]}
                  className="w-full h-full object-cover transition-transform duration-500 select-none pointer-events-none"
                  autoPlay muted loop playsInline
                />
              ) : (
                <img
                  src={selectedStudentForModal.photos[activeModalPhotoIndex] || selectedStudentForModal.photos[0]}
                  alt={selectedStudentForModal.name}
                  className="w-full h-full object-cover transition-transform duration-500 select-none pointer-events-none"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-transparent" />

              {/* Photo Indicator Bar */}
              {selectedStudentForModal.photos.length > 1 && (
                <div className="absolute top-3 left-4 right-14 z-20 flex gap-1 pointer-events-none">
                  {selectedStudentForModal.photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        idx === activeModalPhotoIndex ? "bg-white shadow-sm" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Carousel Left/Right Controls */}
              {selectedStudentForModal.photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveModalPhotoIndex((prev) =>
                        prev > 0 ? prev - 1 : selectedStudentForModal.photos.length - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/60 text-white hover:bg-stone-900 shadow-md cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveModalPhotoIndex((prev) =>
                        prev < selectedStudentForModal.photos.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/60 text-white hover:bg-stone-900 shadow-md cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900/70 text-white hover:bg-stone-900 cursor-pointer shadow-md z-30"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Verified Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 shadow-sm z-20">
                <ShieldCheck className="h-3.5 w-3.5 fill-emerald-500/20" />
                <span>Verified Student</span>
              </div>

              {/* Distance & Photo Counter Pill */}
              <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-stone-900/80 backdrop-blur-md px-2 py-0.5 rounded-xl border border-white/10">
                  <MapPin className="h-3 w-3 text-rose-400 fill-rose-400" />
                  ~{selectedStudentForModal.distanceApproxKm} km
                </div>

                <span className="text-[10px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded-xl shadow-sm">
                  {activeModalPhotoIndex + 1} / {selectedStudentForModal.photos.length} Media
                </span>
              </div>
            </div>

            {/* Student Info Body */}
            <div className="p-4 pt-1 pb-5 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  {selectedStudentForModal.name}, {selectedStudentForModal.age}
                </h3>
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {selectedStudentForModal.university}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {selectedStudentForModal.major}
                </p>
              </div>

              {/* ALL PHOTOS GALLERY THUMBNAILS GRID */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Image className="h-3 w-3 text-rose-500" />
                    Galeri Media ({selectedStudentForModal.photos.length} Media)
                  </span>
                  <span>Klik foto untuk melihat</span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {selectedStudentForModal.photos.map((photoUrl, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => setActiveModalPhotoIndex(pIdx)}
                      className={`relative shrink-0 h-14 w-14 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        pIdx === activeModalPhotoIndex
                          ? "border-rose-500 ring-2 ring-rose-500/30 scale-105 shadow-md opacity-100"
                          : "border-stone-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {isVideoUrl(photoUrl) ? (
                        <video src={photoUrl} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                      ) : (
                        <img src={photoUrl} alt={`Media ${pIdx + 1}`} className="h-full w-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio & Interests */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 space-y-1.5">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Bio & Minat</span>
                <p className="text-xs text-stone-700 italic">"{selectedStudentForModal.bio}"</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedStudentForModal.interests.map((interest) => (
                    <span
                      key={interest}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-stone-800 border border-stone-200"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match First Warning Notice */}
              <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Obrolan belum terbuka. Kamu & <strong>{selectedStudentForModal.name.split(" ")[0]}</strong> harus saling <strong>Match (Suka)</strong> untuk berkirim pesan!
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  onClick={() => handleLikeAndMatch(selectedStudentForModal)}
                  className="flex-1 text-xs font-bold gap-2 bg-rose-500 hover:bg-rose-600 text-white shadow-md rounded-2xl py-3 cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-white" />
                  Suka & Match Sekarang
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PREMIUM PAYWALL OVERLAY IF NOT RAJA MEMBER */}
      {!isRaja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-amber-500/40 bg-white p-5 text-center shadow-2xl space-y-3.5 my-auto">
            {/* Crown Icon */}
            <div className="relative inline-flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md animate-bounce">
                <Crown className="h-9 w-9 fill-current" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-amber-500 fill-amber-400" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                Fitur Eksklusif Member RAJA
              </span>
              <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                Halaman Nearby Terkunci 🔒
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fitur melihat & menyapa mahasiswa terdekat di sekitar kampustu secara real-time hanya dapat diakses oleh <strong>Member RAJA 👑</strong>.
              </p>
            </div>

            {/* Benefits List */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-stone-800 font-medium">
                <Check className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Buka Akses Lokasi & Jarak Mahasiswa Sekitar</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800 font-medium">
                <Check className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Unlimited Swipes, Like & Rewind</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800 font-medium">
                <Check className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Badge Emas Mahasiswa 'RAJA' Kampus</span>
              </div>
            </div>

            {/* Price Tag & Upgrade Action */}
            <div className="space-y-2 pt-1">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-bold text-amber-600">Rp 29.000</span>
                <span className="text-xs text-stone-500">/ bulan</span>
              </div>

              <Button
                onClick={handleUpgrade}
                size="lg"
                variant="glow"
                className="w-full text-xs font-bold gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all rounded-full py-3 cursor-pointer"
              >
                <Crown className="h-4 w-4 fill-current" />
                Upgrade ke Member RAJA Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
