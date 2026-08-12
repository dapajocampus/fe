"use client";

import React, { useState } from "react";
import {
  User,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  Sliders,
  CheckCircle2,
  Lock,
  Smartphone,
  Heart,
  Edit3,
  LogOut,
  MapPin,
  Navigation,
  Compass,
  Loader2,
  RefreshCw,
  Camera,
  ImagePlus,
  Trash2,
  Star,
  Plus,
  ChevronRight,
} from "lucide-react";
import { UserProfile, UserPreferences } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ALL_INTEREST_OPTIONS } from "@/lib/mock-data";
import { usePWA } from "@/components/pwa-provider";
import { PhotoGalleryModal } from "@/components/campus-match/photo-gallery-modal";

interface ProfileTabProps {
  currentUser: UserProfile;
  preferences: UserPreferences;
  onUpdatePreferences: (updated: UserPreferences) => void;
  onOpenVerification: () => void;
  onLogout?: () => void;
}

export function ProfileTab({
  currentUser,
  preferences,
  onUpdatePreferences,
  onOpenVerification,
  onLogout,
}: ProfileTabProps) {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentUser.interests);
  const [prefState, setPrefState] = useState<UserPreferences>(preferences);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(currentUser.bio);

  // Gallery Photos State & Modal Open State
  const [userPhotos, setUserPhotos] = useState<string[]>(currentUser.photos);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Compact GPS Map Sync States
  const [currentLocationName, setCurrentLocationName] = useState(currentUser.locationName);
  const [coordinates, setCoordinates] = useState({ lat: -7.7712, lng: 110.3776 });
  const [isSyncingGps, setIsSyncingGps] = useState(false);
  const [gpsSyncSuccess, setGpsSyncSuccess] = useState(false);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSavePref = () => {
    onUpdatePreferences(prefState);
  };

  const handleSyncGpsLocation = () => {
    setIsSyncingGps(true);
    setGpsSyncSuccess(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(4));
          const lng = Number(position.coords.longitude.toFixed(4));
          setCoordinates({ lat, lng });
          setCurrentLocationName(`Sleman, DIY (GPS: ${lat}, ${lng})`);
          setIsSyncingGps(false);
          setGpsSyncSuccess(true);
          setTimeout(() => setGpsSyncSuccess(false), 3000);
        },
        (error) => {
          setTimeout(() => {
            setCoordinates({ lat: -7.7712, lng: 110.3776 });
            setCurrentLocationName("Sleman, Yogyakarta");
            setIsSyncingGps(false);
            setGpsSyncSuccess(true);
            setTimeout(() => setGpsSyncSuccess(false), 3000);
          }, 1000);
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        setIsSyncingGps(false);
        setGpsSyncSuccess(true);
        setTimeout(() => setGpsSyncSuccess(false), 3000);
      }, 1000);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-4 space-y-5 pb-24 bg-[#f7f4ee]">
      {/* User Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={userPhotos[0] || currentUser.photos[0]}
              alt={currentUser.name}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-rose-500 shadow-sm"
            />
            {/* Verified Badge */}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <ShieldCheck className="h-4 w-4 fill-emerald-500/20" />
            </div>

            {/* Quick Edit Photo Gallery Modal Trigger */}
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute -top-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-md cursor-pointer hover:bg-rose-600 transition-transform hover:scale-110"
              title="Ganti Foto Utama Profil"
            >
              <Camera className="h-3.5 w-3.5 fill-white" />
            </button>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900 truncate">{currentUser.name}, {currentUser.age}</h2>
            </div>
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 truncate">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{currentUser.university}</span>
            </p>
            <p className="text-[11px] text-stone-500 flex items-center gap-1 truncate">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{currentUser.major} • Sem {currentUser.semester}</span>
            </p>

            {/* Compact Location GPS Sync Pill Button */}
            <div className="pt-1">
              <button
                onClick={handleSyncGpsLocation}
                disabled={isSyncingGps}
                className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-700 hover:bg-cyan-500/20 transition-all cursor-pointer shadow-xs"
                title="Klik untuk sinkronisasi lokasi GPS saat ini"
              >
                {isSyncingGps ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-cyan-600" />
                    <span>Mencari GPS...</span>
                  </>
                ) : gpsSyncSuccess ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-700">GPS Tersinkron!</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-3 w-3 text-rose-500 fill-rose-500/20 shrink-0" />
                    <span className="truncate max-w-[130px]">{currentLocationName}</span>
                    <RefreshCw className="h-2.5 w-2.5 text-cyan-600 shrink-0" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-4 pt-3 border-t border-stone-200 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span>Bio & Deskripsi Singkat</span>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="text-rose-600 hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <Edit3 className="h-3 w-3" />
              {isEditingBio ? "Simpan" : "Edit"}
            </button>
          </div>

          {isEditingBio ? (
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
              rows={2}
            />
          ) : (
            <p className="text-xs text-stone-600 italic">"{bioText}"</p>
          )}
        </div>
      </div>

      {/* Verified Student Status Card */}
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
            <ShieldCheck className="h-6 w-6 fill-emerald-500/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
              <span>Status: Mahasiswa Terverifikasi</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-500/20" />
            </div>
            <p className="text-[10px] text-stone-600">NIM: {currentUser.verification.nimMasked} • Email Kampus Terkunci</p>
          </div>
        </div>

        <button
          onClick={onOpenVerification}
          className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
        >
          Rincian
        </button>
      </div>

      {/* DEDICATED GALERI FOTO CARD SWIPE TRIGGER */}
      <div
        onClick={() => setIsPhotoModalOpen(true)}
        className="rounded-3xl border border-stone-200 bg-white p-5 space-y-4 shadow-sm hover:border-rose-500/40 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 group-hover:scale-105 transition-transform">
              <ImagePlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Kelola Galeri Foto Card
              </h3>
              <span className="text-[10px] text-stone-500">Ditampilkan saat pengguna lain swipe profilmu</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              {userPhotos.length} Foto
            </span>
            <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-rose-500 transition-colors" />
          </div>
        </div>

        {/* Photos Grid Preview */}
        <div className="grid grid-cols-3 gap-2.5">
          {userPhotos.slice(0, 2).map((photoUrl, idx) => (
            <div
              key={idx}
              className={`relative aspect-square rounded-2xl overflow-hidden border transition-all ${
                idx === 0 ? "border-2 border-rose-500 shadow-md" : "border-stone-200"
              }`}
            >
              <img src={photoUrl} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-white" />
                  Utama
                </span>
              )}
            </div>
          ))}

          {/* Dedicated Full Page / Modal Trigger Box */}
          <div className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/50 group-hover:bg-rose-100/50 text-rose-600 transition-all p-2 text-center shadow-sm">
            <Plus className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold">Kelola Foto</span>
          </div>
        </div>
      </div>

      {/* Interest Selector */}
      <div className="rounded-3xl border border-stone-200 bg-white p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-rose-500 fill-rose-500/20" />
            <span>Pilih Minat & Hobi</span>
          </h3>
          <span className="text-[10px] text-stone-500">{selectedInterests.length} Terpilih</span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
          {ALL_INTEREST_OPTIONS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300 hover:text-stone-900"
                }`}
              >
                {isSelected ? `✓ ${interest}` : interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discovery Preferences Form */}
      <div className="rounded-3xl border border-stone-200 bg-white p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-rose-500 fill-rose-500/20" />
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Pengaturan Jangkauan Pencarian
          </h3>
        </div>

        {/* Gender Preference */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-stone-700">Tertarik Pada</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "wanita", label: "Mahasiswi" },
              { id: "pria", label: "Mahasiswa" },
              { id: "semua", label: "Semua" },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setPrefState({ ...prefState, preferredGender: g.id as any })}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  prefState.preferredGender === g.id
                    ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:text-stone-900"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max Distance Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-stone-700">Jarak Maksimum Kampus</span>
            <span className="font-bold text-rose-600">{prefState.maxDistanceKm} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={prefState.maxDistanceKm}
            onChange={(e) => setPrefState({ ...prefState, maxDistanceKm: Number(e.target.value) })}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Age Range Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-stone-700">Rentang Usia Mahasiswa</span>
            <span className="font-bold text-rose-600">{prefState.ageRange[0]} - {prefState.ageRange[1]} Tahun</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={18}
              max={28}
              value={prefState.ageRange[0]}
              onChange={(e) => setPrefState({ ...prefState, ageRange: [Number(e.target.value), prefState.ageRange[1]] })}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <input
              type="range"
              min={18}
              max={28}
              value={prefState.ageRange[1]}
              onChange={(e) => setPrefState({ ...prefState, ageRange: [prefState.ageRange[0], Number(e.target.value)] })}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Save Pref Button */}
        <Button onClick={handleSavePref} className="w-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm">
          Simpan Preferensi Pencarian
        </Button>
      </div>

      {/* PWA App Installation Shortcut */}
      <div className="rounded-3xl border border-stone-200 bg-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-800">
            <Smartphone className="h-5 w-5 fill-current" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 block">DAPAJO CAMPUS PWA</span>
            <span className="text-[10px] text-stone-500">
              {isInstalled ? "Aplikasi terpasang di Layar Utama HP" : "Aplikasi siap di-install di HP"}
            </span>
          </div>
        </div>

        {!isInstalled && (
          <Button size="sm" onClick={installApp} className="text-xs bg-rose-500 hover:bg-rose-600 text-white">
            Install HP
          </Button>
        )}
      </div>

      {/* LOGOUT BUTTON */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full rounded-2xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 p-3.5 flex items-center justify-center gap-2 text-xs font-bold text-rose-600 transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>

      {/* DEDICATED FULL-SCREEN PHOTO GALLERY MODAL */}
      {isPhotoModalOpen && (
        <PhotoGalleryModal
          photos={userPhotos}
          onSavePhotos={(updated) => setUserPhotos(updated)}
          onClose={() => setIsPhotoModalOpen(false)}
        />
      )}
    </div>
  );
}
