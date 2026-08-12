"use client";

import React, { useState } from "react";
import { ShieldCheck, Mail, CheckCircle2, Lock, X, Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_UNIVERSITIES } from "@/lib/mock-data";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { email: string; university: string; nim: string }) => void;
}

export function VerificationModal({ isOpen, onClose, onSuccess }: VerificationModalProps) {
  const [step, setStep] = useState<"email" | "otp" | "university" | "success">("email");
  const [email, setEmail] = useState("rizky.r@mail.ugm.ac.id");
  const [otp, setOtp] = useState(["4", "8", "2", "9", "1", "0"]);
  const [university, setUniversity] = useState("Universitas Gadjah Mada (UGM)");
  const [nim, setNim] = useState("21/478291/TK/52109");
  const [ktmUploaded, setKtmUploaded] = useState(true);

  if (!isOpen) return null;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("university");
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("success");
    setTimeout(() => {
      onSuccess({ email, university, nim });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-900"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600">
            <ShieldCheck className="h-7 w-7 fill-emerald-500/20" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Verifikasi Status Mahasiswa</h3>
            <p className="text-xs text-stone-500">Pastikan komunitas aman & bebas akun palsu</p>
          </div>
        </div>

        {/* STEP 1: EMAIL KAMPUS */}
        {step === "email" && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Email Resmi Mahasiswa (.ac.id / .edu)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@student.ugm.ac.id"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 left-9 pl-9 pr-3 text-xs text-stone-900 placeholder-stone-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-stone-500">
                Kode OTP verifikasi akan dikirimkan ke email resmi kampus Anda.
              </p>
            </div>

            <Button type="submit" variant="glow" className="w-full text-xs gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              Kirim Kode OTP Verification <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* STEP 2: OTP ENTRY */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2 text-center">
              <p className="text-xs text-stone-700">
                Masukkan 6-digit kode OTP yang dikirim ke <strong className="text-emerald-600">{email}</strong>
              </p>
              <div className="flex justify-center gap-2 py-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[idx] = e.target.value;
                      setOtp(newOtp);
                    }}
                    className="h-11 w-10 text-center text-lg font-bold rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:border-emerald-500 focus:outline-none"
                  />
                ))}
              </div>
            </div>

            <Button type="submit" variant="glow" className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
              Verifikasi Kode OTP
            </Button>
          </form>
        )}

        {/* STEP 3: UNIVERSITY & NIM INPUT */}
        {step === "university" && (
          <form onSubmit={handleFinish} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Pilih Universitas / Kampus</label>
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 px-3 text-xs text-stone-900 focus:border-emerald-500 focus:outline-none"
              >
                {ALL_UNIVERSITIES.map((univ) => (
                  <option key={univ} value={univ}>
                    {univ}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Nomor Induk Mahasiswa (NIM)</label>
              <input
                type="text"
                required
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="21/478291/TK/52109"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 px-3 text-xs text-stone-900 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-stone-500 flex items-center gap-1">
                <Lock className="h-3 w-3 text-stone-400" />
                NIM Anda akan disamarkan menjadi <code className="text-emerald-600 font-bold">21/478***</code> demi privasi.
              </p>
            </div>

            {/* Upload KTM Card Simulator */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">Foto Kartu Tanda Mahasiswa (KTM)</label>
              <div
                onClick={() => setKtmUploaded(true)}
                className="border-2 border-dashed border-stone-200 hover:border-emerald-500/50 bg-stone-50 rounded-2xl p-4 text-center cursor-pointer transition-all space-y-1"
              >
                <Upload className="h-6 w-6 text-stone-400 mx-auto" />
                <p className="text-xs font-medium text-stone-700">
                  {ktmUploaded ? "✓ KTM_UGM_Verified.png (Telah Diupload)" : "Klik untuk upload foto KTM"}
                </p>
              </div>
            </div>

            <Button type="submit" variant="glow" className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
              Selesaikan Verifikasi & Dapatkan Badge 'Verified Student'
            </Button>
          </form>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto animate-bounce fill-emerald-500/20" />
            <h3 className="text-xl font-bold text-stone-900">Verifikasi Berhasil!</h3>
            <p className="text-xs text-stone-600">
              Badge <strong className="text-emerald-600 font-semibold">'Verified Student'</strong> resmi terpasang pada profil Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
