"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, ArrowRight, CheckCircle2, ImagePlus, Trash2, Camera, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_UNIVERSITIES, ALL_INTEREST_OPTIONS, CURRENT_USER } from "@/lib/mock-data";
import { UserProfile } from "@/lib/types";
import { DapajoLogo } from "@/components/campus-match/dapajo-logo";
import { authApi, profileApi, setTokens, clearTokens, ApiError } from "@/lib/api-client";
import { isVideoUrl } from "@/lib/utils";

// Helper: convert File to base64 data URI
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      let result = reader.result as string;
      if (file.type.startsWith('video/')) result += '#video';
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

interface AuthScreenProps {
  onSuccessAuth: (user: UserProfile) => void;
  onSuccessAdmin?: () => void;
  defaultMode?: "login" | "register";
}

export function AuthScreen({ onSuccessAuth, onSuccessAdmin, defaultMode = "register" }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // API State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Media State (Min 2, Max 100) — starts empty, user MUST upload real photos
  const [photos, setPhotos] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const base64Results = await Promise.all(
      Array.from(files).map(f => fileToBase64(f))
    );
    setPhotos((prev) => [...prev, ...base64Results].slice(0, 100));
  };



  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleNextStep1 = async () => {
    setErrorMsg(null);
    if (!name || !email || !password || !birthDate) {
      setErrorMsg("Semua kolom harus diisi.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }
    const selectedYear = new Date(birthDate).getFullYear();
    if (isNaN(selectedYear) || selectedYear < 1990 || selectedYear > new Date().getFullYear() - 10) {
      setErrorMsg("Tanggal kelahiran tidak valid.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.checkEmail(email);
      if (res.available) {
        setRegisterStep(2);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Gagal memverifikasi email.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep2 = () => {
    setErrorMsg(null);
    if (!university || !major) {
      setErrorMsg("Semua kolom harus diisi.");
      return;
    }
    setRegisterStep(3);
  };

  const handleNextStep3 = () => {
    setErrorMsg(null);
    if (selectedInterests.length < 3) {
      setErrorMsg("Harap pilih minimal 3 minat & hobi.");
      return;
    }
    setRegisterStep(4);
  };

  // Build a UserProfile from backend profile data
  const buildUserProfile = (backendProfile: Awaited<ReturnType<typeof profileApi.getMe>>): UserProfile => {
    return {
      id: backendProfile.user.id,
      name: backendProfile.displayName || "Mahasiswa",
      age: backendProfile.birthDate ? Math.floor((Date.now() - new Date(backendProfile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 21,
      gender: backendProfile.gender === 'FEMALE' ? 'wanita' : backendProfile.gender === 'MALE' ? 'pria' : 'lainnya',
      university: backendProfile.universityName || university || "Universitas Gadjah Mada (UGM)",
      major: backendProfile.major || major || "Informatika",
      semester: 6,
      bio: backendProfile.bio || "Mahasiswa aktif siap berkenalan!",
      photos: backendProfile.photos.length > 0
        ? backendProfile.photos.map(p => p.photoUrl)
        : (photos.length >= 2 ? photos : CURRENT_USER.photos),
      interests: selectedInterests.length > 0 ? selectedInterests : ["Coding", "Coffee"],
      verification: {
        isVerified: backendProfile.user.verification?.status === 'APPROVED',
        email: backendProfile.user.campusEmail || email,
        university: backendProfile.universityName || university,
        major: backendProfile.major || major,
        nimMasked: backendProfile.user.verification?.studentNumber
          ? `${backendProfile.user.verification.studentNumber.slice(0, 5)}***`
          : "***",
      },
      locationName: "Sleman, Yogyakarta",
      distanceKm: 0,
      activityStatus: "Aktif sekarang",
    };
  };

  // Fallback user for when backend profile fetch fails
  const buildFallbackUser = (): UserProfile => ({
    id: "user-me",
    name: name || "Mahasiswa Verified",
    age: 21,
    gender: "pria",
    university: university || "Universitas Gadjah Mada (UGM)",
    major: major || "Teknologi Informasi",
    semester: 6,
    bio: "Mahasiswa aktif yang suka ngopi, coding, & dengerin musik indie. Salam kenal!",
    photos: photos.length >= 2 ? photos : CURRENT_USER.photos,
    interests: selectedInterests.length > 0 ? selectedInterests : ["Coding", "Coffee"],
    verification: {
      isVerified: true,
      email: email || "student@mail.ugm.ac.id",
      university: university || "Universitas Gadjah Mada (UGM)",
      major: major || "Teknologi Informasi",
      nimMasked: "***",
    },
    locationName: "Sleman, Yogyakarta",
    distanceKm: 0,
    activityStatus: "Aktif sekarang",
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register" && photos.length < 2) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === "login") {
        const trimmedEmail = email.trim();
        const normalized = trimmedEmail.toLowerCase().replace(/[\s._-]+/g, "");

        // Check if admin login with username or secret credential
        if (normalized === "bayuganteng" || trimmedEmail.toLowerCase().includes("admin")) {
          try {
            const adminRes = await authApi.adminLogin({ username: trimmedEmail, password });
            setTokens(adminRes.accessToken, adminRes.refreshToken);
            if (onSuccessAdmin) {
              onSuccessAdmin();
              return;
            }
          } catch (adminErr: any) {
            setErrorMsg(adminErr?.message || "Password admin salah. Pastikan password: Konosubarasi1");
            return;
          }
        }

        // ── REGULAR STUDENT LOGIN: Call real backend API ──
        const loginRes = await authApi.login({ email: trimmedEmail, password });

        // If backend returns an ADMIN user
        if (loginRes.user?.role === "ADMIN") {
          setTokens(loginRes.accessToken, loginRes.refreshToken);
          if (onSuccessAdmin) {
            onSuccessAdmin();
            return;
          }
        }

        setTokens(loginRes.accessToken, loginRes.refreshToken);

        // Fetch full profile
        try {
          const profile = await profileApi.getMe();
          onSuccessAuth(buildUserProfile(profile));
        } catch {
          // Profile fetch failed, use fallback
          onSuccessAuth(buildFallbackUser());
        }
      } else {
        // ── REGISTER: Call real backend API ──
        const registerRes = await authApi.register({
          campusEmail: email,
          email: email,
          password,
          displayName: name,
          birthDate: birthDate,
        });

        // Auto-verify OTP with the mock code returned by backend
        const otpCode = registerRes.mockOtp || '123456';
        const verifyRes = await authApi.verifyOtp({
          campusEmail: email,
          otpCode,
        });
        setTokens(verifyRes.accessToken, verifyRes.refreshToken);

        // Upload photos to backend right after registration
        if (photos.length > 0) {
          try {
            await profileApi.updatePhotos(photos);
          } catch (photoErr) {
            console.warn('[DAPAJO] Failed to upload photos during registration:', photoErr);
          }
        }

        // Fetch full profile after registration
        try {
          const profile = await profileApi.getMe();
          onSuccessAuth(buildUserProfile(profile));
        } catch {
          onSuccessAuth(buildFallbackUser());
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Terjadi kesalahan koneksi ke server backend DAPAJO.');
      }
    } finally {
      setIsLoading(false);
    }
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

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Email Kampus</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama.mahasiswa@mail.ugm.ac.id"
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
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-3 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={isLoading} className="w-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md rounded-2xl py-3 gap-2 disabled:opacity-60">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</span>
              {!isLoading && <ArrowRight className="h-4 w-4" />}
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
                {registerStep === 2 && "Profil Tambahan"}
                {registerStep === 3 && "Minat & Hobi"}
                {registerStep === 4 && "Unggah Media (Foto/Video)"}
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
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Buat Kata Sandi (min 6 karakter)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Tanggal Kelahiran</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <Button onClick={handleNextStep1} disabled={isLoading} size="lg" className="w-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md rounded-2xl py-3 gap-2 disabled:opacity-60">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
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
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="Contoh: Universitas Gadjah Mada"
                      list="universities-list"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-2.5 px-3.5 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
                    />
                    <datalist id="universities-list">
                      {ALL_UNIVERSITIES.map((univ) => (
                        <option key={univ} value={univ} />
                      ))}
                    </datalist>
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
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setRegisterStep(1)} className="w-1/3 text-xs border-stone-200 text-stone-700 rounded-2xl">
                    Kembali
                  </Button>
                  <Button onClick={handleNextStep2} size="lg" className="w-2/3 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md rounded-2xl py-3 gap-1">
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
                  <Button onClick={handleNextStep3} className="w-2/3 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-2xl flex items-center justify-center gap-1.5 shadow-sm">
                    <span>Lanjut Unggah Media (Min. 2)</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Upload Photos (Min 2, Max 100) */}
            {registerStep === 4 && (
              <div className="animate-fade-in space-y-4">
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-stone-900 block">Unggah Media (Min. 2 - Max. 100)</label>
                    <span className={`text-[11px] font-bold ${photos.length >= 2 ? "text-emerald-600" : "text-rose-600"}`}>
                      {photos.length} / 100 File
                    </span>
                  </div>

                  {/* Mandatory Requirement Warning */}
                  {photos.length < 2 && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Wajib mengunggah <strong>minimal 2 foto/video asli diri Anda</strong> dari galeri HP untuk melanjutkan. Foto anonim tidak diperbolehkan.</span>
                    </div>
                  )}

                  {/* Photos Grid Display */}
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-stone-200 bg-stone-50/50 rounded-2xl">
                    {photos.map((mediaUrl, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                        {isVideoUrl(mediaUrl) ? (
                          <video src={mediaUrl} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                        ) : (
                          <img src={mediaUrl} alt={`Media ${idx + 1}`} className="h-full w-full object-cover" />
                        )}
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
                          accept="image/*,video/*"
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
                    disabled={photos.length < 2 || isLoading}
                    size="lg"
                    className={`w-2/3 text-xs font-bold rounded-2xl py-3 gap-1 shadow-md transition-all ${
                      photos.length >= 2 && !isLoading
                        ? "bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
                        : "bg-stone-300 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span>{isLoading ? 'Mendaftar...' : 'Selesaikan Pendaftaran'}</span>
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
