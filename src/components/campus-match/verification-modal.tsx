"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Lock,
  X,
  Upload,
  ArrowRight,
  User,
  GraduationCap,
  BookOpen,
  Image as ImageIcon,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_UNIVERSITIES } from "@/lib/mock-data";
import { UserProfile } from "@/lib/types";
import { verificationApi, isAuthenticated } from "@/lib/api-client";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  onSuccess?: (data: { email: string; university: string; nim: string; isApproved?: boolean; status?: string }) => void;
}

export function VerificationModal({ isOpen, onClose, currentUser, onSuccess }: VerificationModalProps) {
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [university, setUniversity] = useState(currentUser?.university || "Universitas Gadjah Mada (UGM)");
  const [major, setMajor] = useState(currentUser?.major || "Informatika");
  const [nim, setNim] = useState(currentUser?.verification?.nimMasked?.replace(/\*/g, "") || "");
  const [ktmImage, setKtmImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStatus, setIsFetchingStatus] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Backend verification state: 'UNSUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [verificationStatus, setVerificationStatus] = useState<"UNSUBMITTED" | "PENDING" | "APPROVED" | "REJECTED">("UNSUBMITTED");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current verification status whenever modal is opened
  useEffect(() => {
    if (!isOpen) return;

    if (currentUser?.name) setFullName(currentUser.name);
    if (currentUser?.university) setUniversity(currentUser.university);
    if (currentUser?.major) setMajor(currentUser.major);

    if (isAuthenticated()) {
      setIsFetchingStatus(true);
      verificationApi
        .getStatus()
        .then((res) => {
          if (res && res.status) {
            setVerificationStatus(res.status);
            if (res.studentNumber) setNim(res.studentNumber);
            if (res.ktmImageUrl) setKtmImage(res.ktmImageUrl);
            if (res.rejectionReason) setRejectionReason(res.rejectionReason);
            if (res.verifiedAt) setVerifiedAt(res.verifiedAt);
            if (res.user?.profile) {
              if (res.user.profile.displayName) setFullName(res.user.profile.displayName);
              if (res.user.profile.universityName) setUniversity(res.user.profile.universityName);
              if (res.user.profile.major) setMajor(res.user.profile.major);
            }
          }
        })
        .catch(() => {
          // If fetch fails, fallback to local state
        })
        .finally(() => {
          setIsFetchingStatus(false);
        });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle image file selection & client-side compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Harap pilih file gambar (JPG/PNG).");
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      // Compress image using canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.82);
        setKtmImage(compressedBase64);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Harap isi nama lengkap Anda.");
      return;
    }

    if (!nim.trim()) {
      setErrorMsg("Harap isi Nomor Induk Mahasiswa (NIM).");
      return;
    }

    if (!ktmImage) {
      setErrorMsg("Harap unggah foto Kartu Tanda Mahasiswa (KTM).");
      return;
    }

    setIsLoading(true);

    try {
      if (isAuthenticated()) {
        await verificationApi.submitKtm({
          studentNumber: nim.trim(),
          ktmImageUrl: ktmImage,
          fullName: fullName.trim(),
          universityName: university.trim(),
          major: major.trim(),
        });
      }

      setVerificationStatus("PENDING");

      if (onSuccess) {
        onSuccess({
          email: currentUser?.verification?.email || "student@mail.ac.id",
          university,
          nim,
          isApproved: false,
          status: "PENDING",
        });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengirim pengajuan verifikasi. Pastikan server aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 shrink-0">
            <ShieldCheck className="h-7 w-7 fill-emerald-500/20" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Verifikasi Mahasiswa Resmi</h3>
            <p className="text-xs text-stone-500">Kirim data & foto KTM untuk ditinjau oleh Admin</p>
          </div>
        </div>

        {isFetchingStatus ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-stone-500">Memeriksa status verifikasi...</p>
          </div>
        ) : (
          <>
            {/* ── CASE 1: STATUS IS ALREADY APPROVED ── */}
            {verificationStatus === "APPROVED" && (
              <div className="text-center py-5 space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-9 w-9 fill-emerald-500/20" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-stone-900">Status Terverifikasi Resmi! 🎉</h4>
                  <p className="text-xs text-stone-600 max-w-xs mx-auto">
                    KTM Anda telah diperiksa dan disetujui oleh admin. Badge centang verified aktif di profil Anda.
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5 text-left text-xs space-y-1.5 font-mono text-stone-700">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Nama:</span>
                    <span className="font-semibold text-stone-900">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">NIM:</span>
                    <span className="font-semibold text-emerald-600">{nim ? `${nim.slice(0, 5)}***` : "Terverifikasi"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Kampus:</span>
                    <span className="font-semibold text-stone-900 truncate max-w-[180px]">{university}</span>
                  </div>
                  {verifiedAt && (
                    <div className="flex justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-200">
                      <span>Tanggal Verifikasi:</span>
                      <span>{new Date(verifiedAt).toLocaleDateString("id-ID")}</span>
                    </div>
                  )}
                </div>
                <Button onClick={onClose} className="w-full text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-2xl py-2.5">
                  Tutup
                </Button>
              </div>
            )}

            {/* ── CASE 2: STATUS IS PENDING REVIEW ── */}
            {verificationStatus === "PENDING" && (
              <div className="text-center py-5 space-y-4">
                <div className="h-16 w-16 rounded-full bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-sm animate-pulse">
                  <Clock className="h-9 w-9" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-stone-900">Sedang Ditinjau Admin ⏳</h4>
                  <p className="text-xs text-stone-600 max-w-xs mx-auto">
                    Pengajuan verifikasi KTM Anda telah berhasil masuk ke <strong>Dashboard Admin</strong> dan sedang dalam proses pemeriksaan manual.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-left text-xs space-y-2 text-stone-800">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                    <Clock className="h-4 w-4" />
                    <span>Rincian Pengajuan</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-stone-600">
                    <p><strong>Nama:</strong> {fullName}</p>
                    <p><strong>NIM:</strong> {nim}</p>
                    <p><strong>Universitas:</strong> {university}</p>
                    <p><strong>Jurusan:</strong> {major}</p>
                  </div>
                  {ktmImage && (
                    <div className="pt-2 border-t border-amber-200/80">
                      <p className="text-[10px] font-semibold text-stone-500 mb-1">Foto KTM yang Diajukan:</p>
                      <img
                        src={ktmImage}
                        alt="Foto KTM"
                        className="h-24 w-full object-cover rounded-xl border border-amber-200"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={() => setVerificationStatus("UNSUBMITTED")}
                    variant="outline"
                    className="flex-1 text-xs border-stone-300 text-stone-700 hover:bg-stone-50 rounded-2xl py-2"
                  >
                    Ubah Data Pengajuan
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-2"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            )}

            {/* ── CASE 3: UNSUBMITTED OR REJECTED (SHOW FORM) ── */}
            {(verificationStatus === "UNSUBMITTED" || verificationStatus === "REJECTED") && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rejection Alert Banner if previously rejected */}
                {verificationStatus === "REJECTED" && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>Verifikasi Sebelumnya Ditolak</span>
                    </div>
                    <p className="text-[11px] text-rose-600">
                      <strong>Alasan Admin:</strong> {rejectionReason || "Foto KTM buram atau data NIM tidak sesuai."}
                    </p>
                    <p className="text-[10px] text-stone-600">
                      Silakan perbaiki data dan unggah foto KTM yang lebih jelas di bawah ini:
                    </p>
                  </div>
                )}

                {errorMsg && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 1. NAMA LENGKAP */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-stone-400" />
                    <span>Nama Lengkap Mahasiswa</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Bayu Firdaus"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 placeholder-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* 2. UNIVERSITAS */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-stone-400" />
                    <span>Universitas / Kampus</span>
                  </label>
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all cursor-pointer"
                  >
                    {ALL_UNIVERSITIES.map((univ) => (
                      <option key={univ} value={univ}>
                        {univ}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. JURUSAN */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-stone-400" />
                    <span>Jurusan / Program Studi</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Contoh: Teknologi Informasi"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 placeholder-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* 4. NOMOR INDUK MAHASISWA (NIM) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-stone-400" />
                      <span>Nomor Induk Mahasiswa (NIM)</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Disamarkan demi privasi</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Contoh: 21/478291/TK/52109"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 placeholder-stone-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                  />
                  <p className="text-[10px] text-stone-500">
                    NIM hanya dapat dilihat oleh tim Admin untuk validasi kartu mahasiswa Anda.
                  </p>
                </div>

                {/* 5. UPLOAD FOTO KTM */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5 text-stone-400" />
                      <span>Foto Kartu Tanda Mahasiswa (KTM)</span>
                    </span>
                    <span className="text-[10px] text-stone-400">JPG / PNG</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {ktmImage ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-stone-900 group">
                      <img
                        src={ktmImage}
                        alt="Preview Foto KTM"
                        className="w-full h-36 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                        <span className="text-[10px] text-white font-medium flex items-center gap-1 bg-emerald-600/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Foto KTM Terpilih
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Ganti Foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/20 bg-stone-50 rounded-2xl p-5 text-center cursor-pointer transition-all space-y-1.5"
                    >
                      <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-stone-800">
                        Klik untuk upload foto KTM
                      </p>
                      <p className="text-[10px] text-stone-500">
                        Pastikan nama lengkap, NIM, dan logo kampus terlihat jelas & tidak silau.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Mengirim Pengajuan ke Admin...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Pengajuan Verifikasi</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
