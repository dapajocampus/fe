"use client";

import React, { useState } from "react";
import { ShieldAlert, Trash2, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string | null;
  targetUserName: string | null;
  mode: "report" | "block";
  onSubmitReport: (reason: string) => void;
  onConfirmBlock: () => void;
}

export function SafetyModal({
  isOpen,
  onClose,
  targetUserName,
  mode,
  onSubmitReport,
  onConfirmBlock,
}: SafetyModalProps) {
  const [selectedReason, setSelectedReason] = useState("fake_account");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const reasons = [
    { id: "fake_account", label: "Akun Palsu / Fake Account" },
    { id: "harassment", label: "Pelecehan atau Harassment" },
    { id: "scam", label: "Penipuan / Spam / Sales" },
    { id: "impersonation", label: "Mengaku Sebagai Orang Lain" },
    { id: "inappropriate", label: "Konten Tidak Pantas" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "report") {
      onSubmitReport(selectedReason);
    } else {
      onConfirmBlock();
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-900"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              mode === "report" ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"
            }`}
          >
            {mode === "report" ? <ShieldAlert className="h-6 w-6 fill-amber-500/20" /> : <Trash2 className="h-6 w-6 fill-rose-500/20" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {mode === "report" ? `Laporkan ${targetUserName}` : `Blokir ${targetUserName}`}
            </h3>
            <p className="text-xs text-stone-500">Pilihan ini menjaga keamanan komunitas DAPAJO CAMPUS</p>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto animate-bounce fill-emerald-500/20" />
            <h4 className="text-base font-bold text-stone-900">
              {mode === "report" ? "Laporan Telah Dikirim" : "Pengguna Berhasil Diblokir"}
            </h4>
            <p className="text-xs text-stone-500">Tim moderasi kami akan segera meninjau aktivitas ini.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "report" ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-700">Alasan Pelaporan:</label>
                  <div className="space-y-1.5">
                    {reasons.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedReason === r.id
                            ? "bg-amber-50 border-amber-300 text-amber-800 font-semibold"
                            : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        <span>{r.label}</span>
                        <input
                          type="radio"
                          name="report_reason"
                          value={r.id}
                          checked={selectedReason === r.id}
                          onChange={() => setSelectedReason(r.id)}
                          className="accent-amber-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Detail Tambahan (Opsional):</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan kronologi singkat..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <Button type="submit" variant="glow" className="w-full text-xs bg-amber-600 hover:bg-amber-700 text-white">
                  Kirim Laporan Keamanan
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                  Apakah Anda yakin ingin memblokir <strong>{targetUserName}</strong>?
                  <br />
                  <br />
                  Setelah diblokir, Anda tidak dapat melihat profil, berkirim pesan, atau saling menemukan di halaman Swipe & Nearby.
                </p>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={onClose} className="flex-1 text-xs border-stone-200 text-stone-700">
                    Batal
                  </Button>
                  <Button type="submit" variant="destructive" className="flex-1 text-xs bg-rose-600 hover:bg-rose-700 text-white">
                    Konfirmasi Blokir
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
