"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Trash2,
  Star,
  Plus,
  Check,
  AlertCircle,
  Sparkles,
  Eye,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoGalleryModalProps {
  photos: string[];
  onSavePhotos: (updatedPhotos: string[]) => void;
  onClose: () => void;
}

export function PhotoGalleryModal({ photos: initialPhotos, onSavePhotos, onClose }: PhotoGalleryModalProps) {
  const [photoList, setPhotoList] = useState<string[]>(initialPhotos);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        let base64String = reader.result as string;
        // Keep the video flag logic for frontend rendering
        if (file.type.startsWith("video/")) {
          base64String += "#video";
        }
        setPhotoList((prev) => [...prev, base64String].slice(0, 100));
      };
      reader.readAsDataURL(file);
    });
  };




  const handleRemovePhoto = (indexToRemove: number) => {
    if (photoList.length <= 1) {
      alert("Profil Anda harus memiliki minimal 1 foto utama.");
      return;
    }
    setPhotoList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (previewPhotoIndex >= photoList.length - 1) {
      setPreviewPhotoIndex(0);
    }
  };

  const handleSetPrimaryPhoto = (indexToPrimary: number) => {
    setPhotoList((prev) => {
      const selected = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [selected, ...rest];
    });
    setPreviewPhotoIndex(0);
  };

  const handleSave = () => {
    onSavePhotos(photoList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f7f4ee] max-w-lg mx-auto overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="font-bold text-stone-900 text-sm">Kelola Galeri Foto Profil</h2>
            <p className="text-[10px] text-stone-500">Minimal 2 Foto • Maksimal 100 Foto</p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          size="sm"
          className="text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm gap-1 rounded-xl"
        >
          <Check className="h-4 w-4" />
          Simpan Galeri
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
        {/* Status Counter Banner */}
        <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 block">Total Foto Terunggah</span>
              <span className="text-[10px] text-stone-500">Semua foto ini akan tampil di Swipe Card Discover</span>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
              photoList.length >= 2
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-600 border-rose-200"
            }`}
          >
            {photoList.length} / 100 Foto
          </span>
        </div>

        {/* Warning if photos less than 2 */}
        {photoList.length < 2 && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Disarankan mengunggah <strong>minimal 2 foto</strong> agar profilmu menarik saat diswipe!</span>
          </div>
        )}

        {/* Spacious Photo Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Urutan Foto Profil (Geser / Atur Utama)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photoList.map((photoUrl, idx) => (
              <div
                key={idx}
                className={`relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all shadow-md ${
                  idx === 0 ? "border-rose-500 ring-2 ring-rose-500/20" : "border-stone-200 bg-white"
                }`}
              >
                <img src={photoUrl} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />

                {/* Photo Badge Tag */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  {idx === 0 ? (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" />
                      Foto Utama
                    </span>
                  ) : (
                    <span className="bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      #{idx + 1}
                    </span>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:scale-110 transition-transform cursor-pointer"
                  title="Hapus Foto Ini"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Bottom Action Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-stone-950/80 to-transparent flex items-center justify-between">
                  {idx !== 0 ? (
                    <button
                      onClick={() => handleSetPrimaryPhoto(idx)}
                      className="w-full rounded-xl bg-white/95 hover:bg-white text-stone-900 text-xs font-bold py-1.5 flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      Jadikan Utama
                    </button>
                  ) : (
                    <span className="text-[10px] text-stone-200 font-semibold text-center w-full">
                      Ditampilkan Pertama
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Upload Box Card */}
            {photoList.length < 100 && (
              <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-rose-400 bg-rose-50/60 hover:bg-rose-100/60 text-rose-600 cursor-pointer transition-all p-4 text-center shadow-sm">
                <Camera className="h-8 w-8 mb-1.5 text-rose-500" />
                <span className="text-xs font-bold text-stone-900">+ Tambah Foto Baru</span>
                <span className="text-[10px] text-stone-500 mt-0.5">Format JPG, PNG, WEBP</span>
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

        {/* Interactive Card Swipe Preview */}
        <div className="rounded-3xl border border-stone-200 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-rose-500" />
              <span>Simulasi Tampilan Card Swipe Profilmu</span>
            </h3>
            <span className="text-[10px] text-stone-500">Pratinjau Pengguna Lain</span>
          </div>

          <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-stone-200 shadow-md">
            <img
              src={photoList[previewPhotoIndex] || photoList[0]}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

            {/* Photo Indicators Bar */}
            <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
              {photoList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewPhotoIndex(idx)}
                  className={`h-1 flex-1 rounded-full transition-all cursor-pointer ${
                    idx === previewPhotoIndex ? "bg-white shadow-sm" : "bg-white/40"
                  }`}
                />
              ))}
            </div>

            <div className="absolute bottom-3 left-3 right-3 z-10 text-white space-y-0.5">
              <span className="text-base font-bold drop-shadow-md">Mahasiswa Verified</span>
              <p className="text-[10px] text-rose-300 font-semibold drop-shadow-md">
                Universitas Gadjah Mada • Foto #{previewPhotoIndex + 1} dari {photoList.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
