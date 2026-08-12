"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, ArrowRight, CheckCircle2, ImagePlus, Trash2, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_UNIVERSITIES, ALL_INTEREST_OPTIONS, CURRENT_USER } from "@/lib/mock-data";
import { UserProfile } from "@/lib/types";
import { DapajoLogo } from "@/components/campus-match/dapajo-logo";

interface AuthScreenProps {
  onSuccessAuth: (user: UserProfile) => void;
  defaultMode?: "login" | "register";
}

export function AuthScreen({ onSuccessAuth, defaultMode = "register" }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [name, setName] = useState("Rizky Ramadhan");
  const [email, setEmail] = useState("rizky.r@mail.ugm.ac.id");
  const [password, setPassword] = useState("••••••••");
  const [university, setUniversity] = useState("Universitas Gadjah Mada (UGM)");
  const [major, setMajor] = useState("Teknologi Informasi");
  const [nim, setNim] = useState("21/478291/TK/52109");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Coding", "Coffee", "Indie Music", "Badminton"]);
  
  // Photos State (Min 2, Max 100)
  const [photos, setPhotos] = useState<string[]>(CURRENT_USER.photos);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotoUrls: string[] = [];
    Array.from(files).forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      newPhotoUrls.push(objectUrl);
    });

    setPhotos((prev) => [...prev, ...newPhotoUrls].slice(0, 100));
  };

  const handleAddSamplePhoto = () => {
    const sampleAvatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ];
    const randomPhoto = sampleAvatars[photos.length % sampleAvatars.length];
    if (photos.length < 100) {
      setPhotos((prev) => [...prev, randomPhoto]);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register" && photos.length < 2) return;

    const mockUser: UserProfile = {
      id: "user-me",
      name: name || "Mahasiswa Verified",
      age: 21,
      gender: "pria",
      university: university || "Universitas Gadjah Mada (UGM)",
      major: major || "Teknologi Informasi",
      semester: 6,
      bio: "Mahasiswa aktif yang suka ngopi, coding, & dengerin musik indie. Salam kenal!",
      photos: photos.length >= 2 ? photos : CURRENT_USER.photos,
      interests: selectedInterests,
      verification: {
        isVerified: true,
        email: email || "student@mail.ugm.ac.id",
        university: university || "Universitas Gadjah Mada (UGM)",
        major: major || "Teknologi Informasi",
        nimMasked: nim ? `${nim.slice(0, 5)}***` : "21/478***",
      },
      locationName: "Sleman, Yogyakarta",
      distanceKm: 0,
      activityStatus: "Aktif sekarang",
    };
    onSuccessAuth(mockUser);
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] flex flex-col items-center justify-center p-4 max-w-lg mx-auto">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-5">
        <div className="flex justify-center">
          <DapajoLogo className="h-16 w-16 drop-shadow-md" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">DAPAJO CAMPUS</h1>
          <p className="text-xs text-rose-600 font-semibold">student-only dating & connection platform</p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="w-full rounded-3xl border border-stone-200 bg-white p-6 shadow-md space-y-5">
        {/* Toggle Mode Bar */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1 border border-stone-200">
          <button
            onClick={() => {
              setMode("register");
              setRegisterStep(1);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === "register" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Daftar Akun Baru
          </button>

          <button
            onClick={() => setMode("login")}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === "login" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Masuk Akun
          </button>
        </div>

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Email Kampus (.ac.id)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@student.ugm.ac.id"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-3 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-3 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md rounded-2xl py-3 gap-2">
              <span>Masuk Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* REGISTER FORM STEPS */}
        {mode === "register" && (
          <div className="space-y-4">
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 pb-1 border-b border-stone-100 font-semibold">
              <span>Langkah {registerStep} dari 4</span>
              <span>
                {registerStep === 1 && "Informasi Akun"}
                {registerStep === 2 && "Verifikasi Kampus"}
                {registerStep === 3 && "Minat & Hobi"}
                {registerStep === 4 && "Unggah Foto Profil"}
              </span>
            </div>

            {/* Step 1: Account Info */}
            {registerStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Nama Lengkap Mahasiswa</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Rizky Ramadhan"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Email Resmi Kampus (.ac.id)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@mail.ugm.ac.id"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">Diperlukan untuk verifikasi mahasiswa asli.</span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Buat Kata Sandi</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <Button onClick={() => setRegisterStep(2)} size="lg" className="w-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md rounded-2xl py-3 gap-2">
                  <span>Lanjut ke Verifikasi Kampus</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: University & NIM */}
            {registerStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Asal Universitas</label>
                    <select
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 px-3 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                    >
                      {ALL_UNIVERSITIES.map((univ) => (
                        <option key={univ} value={univ}>
                          {univ}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Jurusan / Program Studi</label>
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Teknologi Informasi"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Nomor Induk Mahasiswa (NIM)</label>
                    <input
                      type="text"
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      placeholder="21/478291/TK/52109"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setRegisterStep(1)} className="w-1/3 text-xs border-stone-200 text-stone-700 rounded-2xl">
                    Kembali
                  </Button>
                  <Button onClick={() => setRegisterStep(3)} size="lg" className="w-2/3 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md rounded-2xl py-3 gap-1">
                    <span>Pilih Hobi & Minat</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Interests */}
            {registerStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-900 block">Pilih Minat & Hobi Utama (Min. 3)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1">
                    {ALL_INTEREST_OPTIONS.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                              : "bg-stone-50 text-stone-600 border-stone-200 hover:text-stone-900"
                          }`}
                        >
                          {isSelected ? `✓ ${interest}` : interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setRegisterStep(2)} className="w-1/3 text-xs border-stone-200 text-stone-700 rounded-2xl">
                    Kembali
                  </Button>
                  <Button onClick={() => setRegisterStep(4)} size="lg" className="w-2/3 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md rounded-2xl py-3 gap-1">
                    <span>Lanjut Unggah Foto (Min. 2)</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Upload Photos (Min 2, Max 100) */}
            {registerStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 block">Unggah Foto Profil (Min. 2 - Max. 100)</label>
                    <span className={`text-[11px] font-bold ${photos.length >= 2 ? "text-emerald-600" : "text-rose-600"}`}>
                      {photos.length} / 100 Foto
                    </span>
                  </div>

                  {/* Mandatory Requirement Warning */}
                  {photos.length < 2 && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Wajib mengunggah <strong>minimal 2 foto</strong> untuk melanjutkan.</span>
                    </div>
                  )}

                  {/* Photos Grid Display */}
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-stone-200 bg-stone-50/50 rounded-2xl">
                    {photos.map((photoUrl, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                        <img src={photoUrl} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-stone-900/80 text-white hover:bg-rose-600 transition-colors shadow-sm cursor-pointer"
                          title="Hapus foto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-stone-900/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}

                    {/* Upload Box */}
                    {photos.length < 100 && (
                      <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/50 hover:bg-rose-100/50 text-rose-600 cursor-pointer transition-all p-2 text-center">
                        <Camera className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-bold leading-tight">+ Tambah</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setRegisterStep(3)} className="w-1/3 text-xs border-stone-200 text-stone-700 rounded-2xl">
                    Kembali
                  </Button>

                  <Button
                    onClick={handleLoginSubmit}
                    disabled={photos.length < 2}
                    size="lg"
                    className={`w-2/3 text-xs font-bold rounded-2xl py-3 gap-1 shadow-md transition-all ${
                      photos.length >= 2
                        ? "bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
                        : "bg-stone-300 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Selesaikan Pendaftaran</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
