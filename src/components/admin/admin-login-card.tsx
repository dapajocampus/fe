"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowLeft, KeyRound, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi, setTokens } from "@/lib/api-client";
import { DapajoLogo } from "@/components/campus-match/dapajo-logo";

interface AdminLoginCardProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function AdminLoginCard({ onSuccess }: AdminLoginCardProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick fill helper for convenience
  const handleQuickFill = () => {
    setUsername("bayu ganteng");
    setPassword("Konosubarasi1");
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage("Silakan masukkan username dan password admin.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.adminLogin({
        username: username.trim(),
        password,
      });

      if (res.accessToken && res.refreshToken) {
        setTokens(res.accessToken, res.refreshToken);
        if (onSuccess) {
          onSuccess();
        } else {
          // Default reload to refresh admin state
          window.location.href = "/admin";
        }
      } else {
        throw new Error("Token otentikasi tidak diterima dari server.");
      }
    } catch (err: any) {
      console.error("Admin login error:", err);
      const message =
        err?.message ||
        "Gagal masuk. Pastikan username dan password admin Anda benar.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Decorative ambient glow */}
      <div className="relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-52 h-52 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Container */}
        <div className="relative bg-card/90 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-7 md:p-8 shadow-2xl shadow-amber-500/5">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-500 mb-4 shadow-inner">
              <ShieldCheck className="w-8 h-8 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-1.5">
              <DapajoLogo className="w-5 h-5 text-amber-500" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                DAPAJO <span className="text-amber-500">Admin</span>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Portal Khusus Verifikasi Mahasiswa & Moderasi Kampus
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="mt-0.5 text-sm">⚠️</div>
              <p className="flex-1 font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90 flex items-center justify-between">
                <span>Username Admin</span>
                <span className="text-[10px] text-muted-foreground">e.g. bayu ganteng</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="bayu ganteng"
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-background/70 border border-border/80 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90 flex items-center justify-between">
                <span>Password Admin</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-background/70 border border-border/80 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick autofill helper pill */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleQuickFill}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-500 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors group"
              >
                <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span>Auto-Isi Akun Bayu Ganteng</span>
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 h-auto rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-[0.99] disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  <span>Masuk ke Admin Dashboard</span>
                </div>
              )}
            </Button>
          </form>

          {/* Bottom helper info */}
          <div className="mt-6 pt-5 border-t border-border/50 text-center space-y-3">
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <span>🔒 Akses terenkripsi & khusus pengelola resmi DAPAJO</span>
            </div>

            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda Mahasiswa</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
