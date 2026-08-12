"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mic, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DapajoLogo } from "@/components/campus-match/dapajo-logo";

interface OnboardingFlowProps {
  onComplete: () => void;
  onGoLogin: () => void;
}

export function OnboardingFlow({ onComplete, onGoLogin }: OnboardingFlowProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 1,
      icon: ShieldCheck,
      buttonBg: "bg-emerald-600 hover:bg-emerald-700",
      dotBg: "bg-emerald-600",
      title: "Khusus Mahasiswa Terverifikasi",
      description:
        "Bebas dari akun palsu! Semua pengguna tervalidasi menggunakan email kampus (.ac.id) & NIM untuk menjaga komunitas yang aman.",
    },
    {
      id: 2,
      icon: DapajoLogo,
      buttonBg: "bg-rose-500 hover:bg-rose-600",
      dotBg: "bg-rose-500",
      title: "Matching Berbasis Minat & Kampus",
      description:
        "Temukan teman nugas, mabar, & ngopi yang satu frekuensi berdasarkan kesamaan hobi, universitas, jurusan, dan lokasi sekitar.",
    },
    {
      id: 3,
      icon: Mic,
      buttonBg: "bg-purple-600 hover:bg-purple-700",
      dotBg: "bg-purple-600",
      title: "Kirim Voice & Video Note",
      description:
        "Interaksi lebih dekat dan hangat lewat pesan suara dan rekaman mini video note melingkar secara langsung.",
    },
  ];

  const currentSlide = slides[activeSlide];
  const Icon = currentSlide.icon;

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between bg-[#f7f4ee] px-6 py-10 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="w-full flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <DapajoLogo className="h-7 w-7" />
          <span className="text-sm font-bold text-stone-900">DAPAJO CAMPUS</span>
        </div>

        <button
          onClick={onComplete}
          className="text-xs font-semibold text-stone-500 hover:text-stone-900 cursor-pointer"
        >
          Lewati
        </button>
      </div>

      {/* Slide Content Carousel */}
      <div className="w-full flex-1 flex flex-col items-center justify-center my-auto text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-6"
          >
            {/* Slide Icon Illustration */}
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white border border-stone-200 shadow-md">
              {activeSlide === 1 ? (
                <DapajoLogo className="h-16 w-16" />
              ) : (
                <Icon className="h-12 w-12 text-stone-900 fill-current" />
              )}
            </div>

            <div className="space-y-2 max-w-xs">
              <h2 className="text-xl font-bold tracking-tight text-stone-900">{currentSlide.title}</h2>
              <p className="text-xs text-stone-600 leading-relaxed">{currentSlide.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation Controls */}
      <div className="w-full space-y-6 pb-4">
        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === activeSlide ? `w-8 ${currentSlide.dotBg}` : "w-2 bg-stone-300"
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          <Button
            onClick={handleNext}
            size="lg"
            className={`w-full text-xs font-bold gap-2 text-white shadow-md rounded-2xl py-3 ${currentSlide.buttonBg}`}
          >
            <span>{activeSlide === slides.length - 1 ? "Mulai Sekarang" : "Lanjutkan"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <button
            onClick={onGoLogin}
            className="w-full text-xs text-stone-600 hover:text-stone-900 py-1 transition-colors font-medium cursor-pointer"
          >
            Sudah punya akun? <strong className="text-rose-600">Masuk</strong>
          </button>
        </div>
      </div>
    </div>
  );
}
