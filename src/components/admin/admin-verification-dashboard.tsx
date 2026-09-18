"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  X,
  Check,
  Building,
  ZoomIn,
  LogOut,
  UserCheck,
  UserX,
  Users,
  Calendar,
  Mail,
  FileText,
  AlertCircle,
  Bell,
  Send,
  Megaphone,
  Trash2,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  verificationApi,
  notificationApi,
  AdminUser,
  AdminBroadcastMessage,
} from "@/lib/api-client";
import { DapajoLogo } from "@/components/campus-match/dapajo-logo";

interface AdminVerificationDashboardProps {
  onLogout: () => void;
}

type TabType = "ALL" | "APPROVED" | "UNVERIFIED" | "PENDING" | "REJECTED";
type MainViewType = "users" | "notifications";

export function AdminVerificationDashboard({ onLogout }: AdminVerificationDashboardProps) {
  const [mainView, setMainView] = useState<MainViewType>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Broadcast Notification State
  const [broadcastHistory, setBroadcastHistory] = useState<AdminBroadcastMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [notifForm, setNotifForm] = useState<{
    title: string;
    content: string;
    type: "ANNOUNCEMENT" | "SYSTEM" | "WARNING" | "INFO";
    targetType: "ALL" | "SPECIFIC";
    targetUserId: string;
    isSending: boolean;
  }>({
    title: "",
    content: "",
    type: "ANNOUNCEMENT",
    targetType: "ALL",
    targetUserId: "",
    isSending: false,
  });

  // Modal zoom for inspecting KTM in high resolution
  const [selectedKtmUser, setSelectedKtmUser] = useState<AdminUser | null>(null);

  // Reject modal state
  const [rejectModalState, setRejectModalState] = useState<{
    isOpen: boolean;
    submissionId: string | null;
    userId: string | null;
    studentName: string;
    reason: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    submissionId: null,
    userId: null,
    studentName: "",
    reason: "Foto KTM buram atau nama & NIM tidak terbaca dengan jelas.",
    isLoading: false,
  });

  // Action loading state for inline buttons
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await verificationApi.getAdminUsers();
      setUsers(data || []);
    } catch (err) {
      console.warn("Failed to load admin users:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBroadcastHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await notificationApi.getAdminHistory();
      setBroadcastHistory(data || []);
    } catch (err) {
      console.warn("Failed to load broadcast history:", err);
      setBroadcastHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadBroadcastHistory();
  }, []);

  // Stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      approved: users.filter((u) => u.verificationStatus === "APPROVED").length,
      unverified: users.filter((u) => u.verificationStatus === "UNVERIFIED").length,
      pending: users.filter((u) => u.verificationStatus === "PENDING").length,
      rejected: users.filter((u) => u.verificationStatus === "REJECTED").length,
    };
  }, [users]);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeTab !== "ALL" && u.verificationStatus !== activeTab) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = u.profile?.displayName?.toLowerCase() || "";
        const email = u.email?.toLowerCase() || "";
        const campusEmail = u.campusEmail?.toLowerCase() || "";
        const username = u.username?.toLowerCase() || "";
        const nim = u.verification?.studentNumber?.toLowerCase() || "";
        const univ = u.profile?.universityName?.toLowerCase() || "";
        const major = u.profile?.major?.toLowerCase() || "";

        return (
          name.includes(q) ||
          email.includes(q) ||
          campusEmail.includes(q) ||
          username.includes(q) ||
          nim.includes(q) ||
          univ.includes(q) ||
          major.includes(q)
        );
      }

      return true;
    });
  }, [users, activeTab, searchQuery]);

  // Approve action (KTM submission or manual)
  const handleApprove = async (user: AdminUser) => {
    setProcessingId(user.id);
    try {
      if (user.verification?.id) {
        await verificationApi.review(user.verification.id, true);
      } else {
        await verificationApi.toggleManualVerify(user.id, true);
      }

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === user.id) {
            return {
              ...u,
              verificationStatus: "APPROVED",
              status: "ACTIVE",
              verification: u.verification
                ? {
                    ...u.verification,
                    status: "APPROVED",
                    verifiedAt: new Date().toISOString(),
                    rejectionReason: null,
                  }
                : {
                    id: "manual-" + Date.now(),
                    studentNumber: "VERIF-MANUAL-ADMIN",
                    ktmImageUrl: u.profile?.photos?.[0]?.photoUrl || "",
                    status: "APPROVED",
                    verifiedAt: new Date().toISOString(),
                    rejectionReason: null,
                    createdAt: new Date().toISOString(),
                  },
            };
          }
          return u;
        })
      );

      if (selectedKtmUser?.id === user.id) {
        setSelectedKtmUser(null);
      }
    } catch (err: any) {
      alert("Gagal menyetujui verifikasi: " + (err?.message || "Kesalahan jaringan"));
    } finally {
      setProcessingId(null);
    }
  };

  // Open Reject Modal
  const openRejectDialog = (user: AdminUser) => {
    setRejectModalState({
      isOpen: true,
      submissionId: user.verification?.id || null,
      userId: user.id,
      studentName: user.profile?.displayName || user.username || "Mahasiswa",
      reason: "Foto KTM buram atau nama & NIM tidak terbaca dengan jelas.",
      isLoading: false,
    });
  };

  // Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectModalState.userId) return;

    setRejectModalState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (rejectModalState.submissionId) {
        await verificationApi.review(rejectModalState.submissionId, false, rejectModalState.reason);
      } else {
        await verificationApi.toggleManualVerify(rejectModalState.userId, false);
      }

      const targetUserId = rejectModalState.userId;
      const rejectReason = rejectModalState.reason;

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetUserId) {
            return {
              ...u,
              verificationStatus: "REJECTED",
              status: "PENDING_VERIFICATION",
              verification: u.verification
                ? {
                    ...u.verification,
                    status: "REJECTED",
                    verifiedAt: null,
                    rejectionReason: rejectReason,
                  }
                : null,
            };
          }
          return u;
        })
      );

      if (selectedKtmUser?.id === targetUserId) {
        setSelectedKtmUser(null);
      }

      setRejectModalState({
        isOpen: false,
        submissionId: null,
        userId: null,
        studentName: "",
        reason: "",
        isLoading: false,
      });
    } catch (err: any) {
      alert("Gagal menolak/mencabut verifikasi: " + (err?.message || "Kesalahan jaringan"));
      setRejectModalState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Submit Broadcast Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title.trim() || !notifForm.content.trim()) {
      alert("Mohon lengkapi judul dan konten notifikasi");
      return;
    }

    if (notifForm.targetType === "SPECIFIC" && !notifForm.targetUserId) {
      alert("Silakan pilih mahasiswa target yang ingin dikirimkan notifikasi");
      return;
    }

    setNotifForm((prev) => ({ ...prev, isSending: true }));
    try {
      await notificationApi.createBroadcast({
        title: notifForm.title,
        content: notifForm.content,
        type: notifForm.type,
        targetType: notifForm.targetType,
        targetUserId: notifForm.targetType === "SPECIFIC" ? notifForm.targetUserId : undefined,
      });

      alert("Notifikasi berhasil dikirimkan ke penerima!");
      setNotifForm({
        title: "",
        content: "",
        type: "ANNOUNCEMENT",
        targetType: "ALL",
        targetUserId: "",
        isSending: false,
      });
      loadBroadcastHistory();
    } catch (err: any) {
      alert("Gagal mengirim notifikasi: " + (err?.message || "Kesalahan jaringan"));
      setNotifForm((prev) => ({ ...prev, isSending: false }));
    }
  };

  // Delete Broadcast Notification
  const handleDeleteNotification = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus notifikasi ini?")) return;

    try {
      await notificationApi.deleteBroadcast(id);
      setBroadcastHistory((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert("Gagal menghapus notifikasi: " + (err?.message || "Kesalahan jaringan"));
    }
  };

  // Quick action to target specific user
  const quickTargetUser = (user: AdminUser) => {
    setMainView("notifications");
    setNotifForm((prev) => ({
      ...prev,
      targetType: "SPECIFIC",
      targetUserId: user.id,
      title: `Pemberitahuan untuk ${user.profile?.displayName || user.username || "Mahasiswa"}`,
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-stone-900 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DapajoLogo className="h-6 w-6" />
              <h1 className="text-base font-extrabold tracking-tight text-stone-900">
                DAPAJO{" "}
                <span className="text-amber-700 font-mono text-xs px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md ml-1">
                  Admin Panel
                </span>
              </h1>
            </div>

            {/* Navigation Tabs between Users & Notifications */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setMainView("users")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mainView === "users"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Users className="h-3.5 w-3.5 inline mr-1.5" />
                Data Mahasiswa
              </button>
              <button
                onClick={() => setMainView("notifications")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mainView === "notifications"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Bell className="h-3.5 w-3.5 inline mr-1.5 text-amber-600" />
                Kirim Notifikasi
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 text-xs font-semibold shadow-xs">
              <span className="text-sm">👑</span>
              <span>Bayu Ganteng</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-amber-500/20 rounded text-amber-800">
                Admin
              </span>
            </div>

            <Button
              onClick={() => {
                loadUsers();
                loadBroadcastHistory();
              }}
              disabled={isLoading || isLoadingHistory}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 rounded-full border-stone-200 hover:bg-stone-100"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Muat Ulang</span>
            </Button>

            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-medium"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Switch Tabs */}
      <div className="sm:hidden px-4 pt-3 flex items-center gap-2 max-w-7xl mx-auto">
        <button
          onClick={() => setMainView("users")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
            mainView === "users"
              ? "bg-stone-900 border-stone-900 text-white"
              : "bg-white border-stone-200 text-stone-700"
          }`}
        >
          <Users className="h-3.5 w-3.5 inline mr-1.5" />
          Data Mahasiswa
        </button>
        <button
          onClick={() => setMainView("notifications")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
            mainView === "notifications"
              ? "bg-stone-900 border-stone-900 text-white"
              : "bg-white border-stone-200 text-stone-700"
          }`}
        >
          <Bell className="h-3.5 w-3.5 inline mr-1.5 text-amber-500" />
          Kirim Notifikasi
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-5 space-y-5">
        {mainView === "users" ? (
          <>
            {/* Page Title & Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                  Daftar Mahasiswa Terdaftar
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Daftar lengkap pengguna yang sudah terdaftar, terverifikasi, dan belum verifikasi di DAPAJO.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setMainView("notifications")}
                  size="sm"
                  className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl gap-1.5 shadow-xs"
                >
                  <Megaphone className="h-3.5 w-3.5" />
                  <span>Kirim Notifikasi Mahasiswa</span>
                </Button>
                <div className="text-xs text-stone-500 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs font-medium">
                  Total: <span className="font-bold text-stone-900">{stats.total} Mahasiswa</span>
                </div>
              </div>
            </div>

            {/* 5 Compact Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. Semua Terdaftar */}
              <div
                onClick={() => setActiveTab("ALL")}
                className={`rounded-2xl p-3.5 border transition-all cursor-pointer ${
                  activeTab === "ALL"
                    ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${activeTab === "ALL" ? "text-stone-300" : "text-stone-600"}`}>
                    Semua Terdaftar
                  </span>
                  <Users className={`h-4 w-4 ${activeTab === "ALL" ? "text-stone-300" : "text-stone-500"}`} />
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className={`text-2xl font-black ${activeTab === "ALL" ? "text-white" : "text-stone-900"}`}>
                    {stats.total}
                  </span>
                  <span className={`text-[10px] ${activeTab === "ALL" ? "text-stone-400" : "text-stone-500"}`}>
                    akun
                  </span>
                </div>
              </div>

              {/* 2. Sudah Terverifikasi */}
              <div
                onClick={() => setActiveTab("APPROVED")}
                className={`rounded-2xl p-3.5 border transition-all cursor-pointer ${
                  activeTab === "APPROVED"
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-stone-200 bg-white hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${activeTab === "APPROVED" ? "text-emerald-100" : "text-emerald-600"}`}>
                    Sudah Terverif
                  </span>
                  <ShieldCheck className={`h-4 w-4 ${activeTab === "APPROVED" ? "text-emerald-100" : "text-emerald-600"}`} />
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className={`text-2xl font-black ${activeTab === "APPROVED" ? "text-white" : "text-stone-900"}`}>
                    {stats.approved}
                  </span>
                  <span className={`text-[10px] ${activeTab === "APPROVED" ? "text-emerald-100" : "text-emerald-700"}`}>
                    terverifikasi
                  </span>
                </div>
              </div>

              {/* 3. Belum Verifikasi */}
              <div
                onClick={() => setActiveTab("UNVERIFIED")}
                className={`rounded-2xl p-3.5 border transition-all cursor-pointer ${
                  activeTab === "UNVERIFIED"
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-stone-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${activeTab === "UNVERIFIED" ? "text-blue-100" : "text-blue-600"}`}>
                    Belum Verifikasi
                  </span>
                  <UserX className={`h-4 w-4 ${activeTab === "UNVERIFIED" ? "text-blue-100" : "text-blue-600"}`} />
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className={`text-2xl font-black ${activeTab === "UNVERIFIED" ? "text-white" : "text-stone-900"}`}>
                    {stats.unverified}
                  </span>
                  <span className={`text-[10px] ${activeTab === "UNVERIFIED" ? "text-blue-100" : "text-blue-700"}`}>
                    tanpa KTM
                  </span>
                </div>
              </div>

              {/* 4. Menunggu Review KTM */}
              <div
                onClick={() => setActiveTab("PENDING")}
                className={`rounded-2xl p-3.5 border transition-all cursor-pointer ${
                  activeTab === "PENDING"
                    ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                    : "border-stone-200 bg-white hover:border-amber-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${activeTab === "PENDING" ? "text-amber-100" : "text-amber-600"}`}>
                    Menunggu Review
                  </span>
                  <Clock className={`h-4 w-4 ${activeTab === "PENDING" ? "text-amber-100" : "text-amber-600"}`} />
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className={`text-2xl font-black ${activeTab === "PENDING" ? "text-white" : "text-stone-900"}`}>
                    {stats.pending}
                  </span>
                  <span className={`text-[10px] ${activeTab === "PENDING" ? "text-amber-100" : "text-amber-700"}`}>
                    perlu cek
                  </span>
                </div>
              </div>

              {/* 5. Ditolak */}
              <div
                onClick={() => setActiveTab("REJECTED")}
                className={`rounded-2xl p-3.5 border transition-all cursor-pointer ${
                  activeTab === "REJECTED"
                    ? "border-rose-500 bg-rose-600 text-white shadow-sm"
                    : "border-stone-200 bg-white hover:border-rose-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${activeTab === "REJECTED" ? "text-rose-100" : "text-rose-600"}`}>
                    Ditolak
                  </span>
                  <XCircle className={`h-4 w-4 ${activeTab === "REJECTED" ? "text-rose-100" : "text-rose-600"}`} />
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className={`text-2xl font-black ${activeTab === "REJECTED" ? "text-white" : "text-stone-900"}`}>
                    {stats.rejected}
                  </span>
                  <span className={`text-[10px] ${activeTab === "REJECTED" ? "text-rose-100" : "text-rose-700"}`}>
                    ditolak
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Toolbar & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
              {/* Tabs */}
              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "ALL"
                      ? "bg-stone-900 text-white shadow-xs"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Semua ({stats.total})
                </button>
                <button
                  onClick={() => setActiveTab("APPROVED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "APPROVED"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Sudah Terverif ({stats.approved})
                </button>
                <button
                  onClick={() => setActiveTab("UNVERIFIED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "UNVERIFIED"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Belum Verif ({stats.unverified})
                </button>
                <button
                  onClick={() => setActiveTab("PENDING")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "PENDING"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Menunggu Review ({stats.pending})
                </button>
                <button
                  onClick={() => setActiveTab("REJECTED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeTab === "REJECTED"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  Ditolak ({stats.rejected})
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-80 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, NIM, email, kampus, jurusan..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-3 text-xs text-stone-900 focus:bg-white focus:border-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* ─── NEAT TABLE / LIST VIEW ─── */}
            <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
              {isLoading ? (
                <div className="py-24 text-center space-y-3">
                  <RefreshCw className="h-8 w-8 text-stone-400 animate-spin mx-auto" />
                  <p className="text-xs text-stone-500 font-medium">Memuat data pengguna terdaftar...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center space-y-2 px-4">
                  <Users className="h-10 w-10 text-stone-300 mx-auto" />
                  <h3 className="text-sm font-bold text-stone-800">Tidak ada data ditemukan</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {searchQuery
                      ? `Tidak ditemukan mahasiswa yang cocok dengan pencarian "${searchQuery}".`
                      : activeTab === "PENDING"
                      ? "Semua berkas KTM telah ditinjau! Tidak ada antrean review."
                      : activeTab === "UNVERIFIED"
                      ? "Semua pengguna terdaftar telah terverifikasi atau telah mengajukan KTM."
                      : "Belum ada data mahasiswa dalam kategori ini."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold text-stone-600 tracking-wide uppercase">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4 min-w-[220px]">Mahasiswa</th>
                        <th className="py-3 px-4 min-w-[200px]">Universitas & Jurusan</th>
                        <th className="py-3 px-4 min-w-[130px]">NIM / ID</th>
                        <th className="py-3 px-4 min-w-[110px]">Foto KTM</th>
                        <th className="py-3 px-4 min-w-[130px]">Status Verif</th>
                        <th className="py-3 px-4 min-w-[110px]">Tgl Daftar</th>
                        <th className="py-3 px-4 min-w-[190px] text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                      {filteredUsers.map((user, index) => {
                        const displayName = user.profile?.displayName || user.username || "Mahasiswa";
                        const photoUrl = user.profile?.photos?.[0]?.photoUrl;
                        const university = user.profile?.universityName || "Universitas Gadjah Mada";
                        const major = user.profile?.major || "Mahasiswa";
                        const batchYear = user.profile?.batchYear;
                        const isProcessing = processingId === user.id;
                        const hasKtm = Boolean(user.verification?.ktmImageUrl);

                        return (
                          <tr
                            key={user.id}
                            className="hover:bg-stone-50/70 transition-colors group"
                          >
                            {/* 1. Index */}
                            <td className="py-3 px-4 text-center text-stone-400 font-mono text-[11px]">
                              {index + 1}
                            </td>

                            {/* 2. Mahasiswa (Avatar + Name + Email) */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                {photoUrl ? (
                                  <img
                                    src={photoUrl}
                                    alt={displayName}
                                    className="h-9 w-9 rounded-xl object-cover border border-stone-200 shrink-0"
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">
                                    {displayName.charAt(0).toUpperCase()}
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <div className="font-bold text-stone-900 truncate flex items-center gap-1.5">
                                    <span className="truncate">{displayName}</span>
                                    {user.verificationStatus === "APPROVED" && (
                                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 fill-emerald-500/20 shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                                    <span>{user.campusEmail || user.email}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 3. Kampus & Jurusan */}
                            <td className="py-3 px-4">
                              <div className="font-medium text-stone-900 truncate text-[11px]">
                                {university}
                              </div>
                              <div className="text-[11px] text-stone-500 truncate">
                                {major} {batchYear ? `('${String(batchYear).slice(-2)})` : ""}
                              </div>
                            </td>

                            {/* 4. NIM */}
                            <td className="py-3 px-4">
                              {user.verification?.studentNumber ? (
                                <span className="font-mono text-[11px] font-semibold text-stone-800 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md select-all">
                                  {user.verification.studentNumber}
                                </span>
                              ) : (
                                <span className="text-stone-400 text-[11px] italic">Belum ada</span>
                              )}
                            </td>

                            {/* 5. KTM */}
                            <td className="py-3 px-4">
                              {hasKtm ? (
                                <button
                                  onClick={() => setSelectedKtmUser(user)}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-stone-700 hover:text-emerald-700 transition-colors cursor-pointer text-[11px] font-semibold"
                                >
                                  <img
                                    src={user.verification!.ktmImageUrl}
                                    alt="KTM"
                                    className="h-5 w-6 object-cover rounded shrink-0 border border-stone-200"
                                  />
                                  <span>Lihat KTM</span>
                                </button>
                              ) : (
                                <span className="text-stone-400 text-[11px] flex items-center gap-1">
                                  <span>-</span>
                                </span>
                              )}
                            </td>

                            {/* 6. Status Badge */}
                            <td className="py-3 px-4">
                              {user.verificationStatus === "APPROVED" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Terverifikasi</span>
                                </span>
                              )}
                              {user.verificationStatus === "UNVERIFIED" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                                  <UserX className="h-3 w-3" />
                                  <span>Belum Verif</span>
                                </span>
                              )}
                              {user.verificationStatus === "PENDING" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md animate-pulse">
                                  <Clock className="h-3 w-3" />
                                  <span>Menunggu Review</span>
                                </span>
                              )}
                              {user.verificationStatus === "REJECTED" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                  <XCircle className="h-3 w-3" />
                                  <span>Ditolak</span>
                                </span>
                              )}
                            </td>

                            {/* 7. Registration Date */}
                            <td className="py-3 px-4 text-stone-500 text-[11px] whitespace-nowrap">
                              {new Date(user.createdAt).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>

                            {/* 8. Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Send notif quick button */}
                                <button
                                  onClick={() => quickTargetUser(user)}
                                  className="h-7 w-7 rounded-lg border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 text-stone-600 hover:text-amber-700 flex items-center justify-center transition-colors cursor-pointer"
                                  title={`Kirim notifikasi ke ${displayName}`}
                                >
                                  <Bell className="h-3.5 w-3.5" />
                                </button>

                                {user.verificationStatus === "PENDING" && (
                                  <>
                                    <Button
                                      onClick={() => handleApprove(user)}
                                      disabled={isProcessing}
                                      size="sm"
                                      className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5 gap-1 shadow-2xs"
                                    >
                                      <Check className="h-3 w-3" />
                                      <span>Setujui</span>
                                    </Button>
                                    <Button
                                      onClick={() => openRejectDialog(user)}
                                      disabled={isProcessing}
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-[11px] font-bold border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg px-2 gap-1"
                                    >
                                      <X className="h-3 w-3" />
                                      <span>Tolak</span>
                                    </Button>
                                  </>
                                )}

                                {user.verificationStatus === "UNVERIFIED" && (
                                  <Button
                                    onClick={() => handleApprove(user)}
                                    disabled={isProcessing}
                                    size="sm"
                                    className="h-7 text-[11px] font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-lg px-2.5 gap-1 shadow-2xs"
                                  >
                                    <UserCheck className="h-3 w-3" />
                                    <span>Verif Manual</span>
                                  </Button>
                                )}

                                {user.verificationStatus === "APPROVED" && (
                                  <button
                                    onClick={() => openRejectDialog(user)}
                                    disabled={isProcessing}
                                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1 cursor-pointer"
                                  >
                                    Cabut Status
                                  </button>
                                )}

                                {user.verificationStatus === "REJECTED" && (
                                  <Button
                                    onClick={() => handleApprove(user)}
                                    disabled={isProcessing}
                                    size="sm"
                                    className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5 gap-1 shadow-2xs"
                                  >
                                    <span>Setujui Ulang</span>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer / Summary */}
              {!isLoading && filteredUsers.length > 0 && (
                <div className="border-t border-stone-200 bg-stone-50/60 px-4 py-2.5 flex items-center justify-between text-xs text-stone-500">
                  <span>
                    Menampilkan <span className="font-bold text-stone-800">{filteredUsers.length}</span> dari{" "}
                    <span className="font-bold text-stone-800">{stats.total}</span> mahasiswa
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Terverifikasi: {stats.approved} • Belum Verif: {stats.unverified}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ─── NOTIFICATION BROADCAST & TARGETING VIEW ─── */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                  Manajemen & Pengiriman Notifikasi
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tulis pengumuman atau pesan peringatan yang ingin ditampilkan di lonceng notifikasi mahasiswa.
                </p>
              </div>
              <Button
                onClick={() => setMainView("users")}
                variant="outline"
                size="sm"
                className="text-xs rounded-xl"
              >
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Kembali ke Data Mahasiswa
              </Button>
            </div>

            {/* Form Create Notification */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <div className="h-9 w-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Tulis Pesan Notifikasi Baru</h3>
                  <p className="text-[11px] text-stone-500">
                    Notifikasi akan langsung muncul pada ikon lonceng akun mahasiswa bersangkutan.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Judul Notifikasi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">
                      Judul Notifikasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={notifForm.title}
                      onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                      placeholder="Contoh: Pengumuman Pemeliharaan Server / Verifikasi Diterima"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-none font-medium"
                      required
                    />
                  </div>

                  {/* Kategori Notifikasi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Kategori / Tipe</label>
                    <select
                      value={notifForm.type}
                      onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value as any })}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="ANNOUNCEMENT">📢 Pengumuman Resmi (ANNOUNCEMENT)</option>
                      <option value="INFO">💡 Informasi & Tips Kampus (INFO)</option>
                      <option value="SYSTEM">⚙️ Pembaruan Sistem (SYSTEM)</option>
                      <option value="WARNING">⚠️ Peringatan Penting (WARNING)</option>
                    </select>
                  </div>
                </div>

                {/* Target Penerima */}
                <div className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                  <label className="text-xs font-bold text-stone-800 block">
                    Target Penerima Notifikasi:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        notifForm.targetType === "ALL"
                          ? "border-amber-500 bg-white shadow-xs font-bold text-stone-900"
                          : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="targetType"
                        value="ALL"
                        checked={notifForm.targetType === "ALL"}
                        onChange={() => setNotifForm({ ...notifForm, targetType: "ALL" })}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="text-xs block">🌐 Semua Mahasiswa (Broadcast)</span>
                        <span className="text-[10px] text-stone-400 font-normal">
                          Kirimkan ke seluruh {stats.total} mahasiswa yang terdaftar
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        notifForm.targetType === "SPECIFIC"
                          ? "border-amber-500 bg-white shadow-xs font-bold text-stone-900"
                          : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="targetType"
                        value="SPECIFIC"
                        checked={notifForm.targetType === "SPECIFIC"}
                        onChange={() => setNotifForm({ ...notifForm, targetType: "SPECIFIC" })}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="text-xs block">🎯 Mahasiswa Tertentu (Spesifik)</span>
                        <span className="text-[10px] text-stone-400 font-normal">
                          Pilih akun mahasiswa target secara khusus
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Specific User Selector if SPECIFIC */}
                  {notifForm.targetType === "SPECIFIC" && (
                    <div className="pt-2 space-y-1">
                      <label className="text-xs font-semibold text-stone-700">
                        Pilih Mahasiswa Tujuan:
                      </label>
                      <select
                        value={notifForm.targetUserId}
                        onChange={(e) => setNotifForm({ ...notifForm, targetUserId: e.target.value })}
                        className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-amber-500 focus:outline-none"
                        required
                      >
                        <option value="">-- Pilih Mahasiswa Penerima --</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.profile?.displayName || u.username || "Mahasiswa"} ({u.campusEmail || u.email}) - {u.profile?.universityName || "Kampus"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Konten Notifikasi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    Isi Pesan Notifikasi <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={notifForm.content}
                    onChange={(e) => setNotifForm({ ...notifForm, content: e.target.value })}
                    placeholder="Tuliskan isi pengumuman atau instruksi untuk mahasiswa..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-none leading-relaxed"
                    required
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() =>
                      setNotifForm({
                        title: "",
                        content: "",
                        type: "ANNOUNCEMENT",
                        targetType: "ALL",
                        targetUserId: "",
                        isSending: false,
                      })
                    }
                    variant="outline"
                    className="text-xs rounded-xl"
                  >
                    Bersihkan Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={notifForm.isSending}
                    className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-5 gap-1.5 shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{notifForm.isSending ? "Mengirimkan..." : "Kirim Notifikasi Sekarang"}</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* Riwayat Notifikasi Terkirim */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-stone-500" />
                  <h3 className="text-sm font-bold text-stone-900">Riwayat Notifikasi Terkirim</h3>
                </div>
                <span className="text-xs text-stone-500">
                  Total: <span className="font-bold">{broadcastHistory.length}</span> pesan
                </span>
              </div>

              {isLoadingHistory ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="h-6 w-6 text-stone-400 animate-spin mx-auto" />
                  <p className="text-xs text-stone-500">Memuat riwayat...</p>
                </div>
              ) : broadcastHistory.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  Belum ada riwayat notifikasi yang pernah dikirim.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-bold text-stone-600 uppercase">
                        <th className="py-2.5 px-3">Judul & Isi</th>
                        <th className="py-2.5 px-3">Tipe</th>
                        <th className="py-2.5 px-3">Target</th>
                        <th className="py-2.5 px-3">Penerima</th>
                        <th className="py-2.5 px-3">Waktu Kirim</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {broadcastHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-3 max-w-sm">
                            <div className="font-bold text-stone-900">{item.title}</div>
                            <div className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                              {item.content}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[11px] font-medium text-stone-800">
                              {item.targetName}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px]">
                            {item.recipientsCount} akun
                          </td>
                          <td className="py-3 px-3 text-stone-400 text-[11px] whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteNotification(item.id)}
                              className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus notifikasi ini"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL 1: HIGH-RES KTM ZOOM INSPECTION ── */}
      {selectedKtmUser && selectedKtmUser.verification?.ktmImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between text-white shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm font-bold truncate">
                  Pemeriksaan KTM: {selectedKtmUser.profile?.displayName || selectedKtmUser.username || "Mahasiswa"}
                </h3>
                <p className="text-xs text-stone-400 truncate">
                  NIM: <span className="font-mono text-emerald-400">{selectedKtmUser.verification.studentNumber}</span> • {selectedKtmUser.profile?.universityName}
                </p>
              </div>
              <button
                onClick={() => setSelectedKtmUser(null)}
                className="h-8 w-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* KTM Image High Res Display */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-stone-950">
              <img
                src={selectedKtmUser.verification.ktmImageUrl}
                alt="Foto KTM Resolusi Penuh"
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg border border-stone-800"
              />
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-stone-800 bg-stone-900/90 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-stone-400 hidden sm:inline">
                Pastikan nama dan NIM di foto sesuai dengan identitas akun.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  onClick={() => {
                    const u = selectedKtmUser;
                    setSelectedKtmUser(null);
                    openRejectDialog(u);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold border-rose-800 text-rose-400 hover:bg-rose-950 rounded-xl"
                >
                  Tolak (Reject)
                </Button>
                <Button
                  onClick={() => handleApprove(selectedKtmUser)}
                  size="sm"
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Setujui (Approve)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: REJECT CONFIRMATION WITH REASON ── */}
      {rejectModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Tolak / Cabut Verifikasi Mahasiswa</h3>
                <p className="text-xs text-stone-500">Mahasiswa: {rejectModalState.studentName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700">Pilih atau Tulis Alasan Penolakan:</label>

              {/* Quick Reason Templates */}
              <div className="space-y-1.5">
                {[
                  "Foto KTM buram atau nama & NIM tidak terbaca dengan jelas.",
                  "NIM yang dimasukkan tidak sesuai dengan kartu mahasiswa.",
                  "Kartu tanda mahasiswa (KTM) sudah tidak aktif atau masa berlaku habis.",
                  "Bukan kartu tanda mahasiswa resmi universitas yang bersangkutan.",
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectModalState((prev) => ({ ...prev, reason: preset }))}
                    className={`w-full text-left p-2 rounded-xl text-[11px] border transition-all cursor-pointer ${
                      rejectModalState.reason === preset
                        ? "border-rose-400 bg-rose-50 text-rose-800 font-medium"
                        : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom Reason Textarea */}
              <textarea
                value={rejectModalState.reason}
                onChange={(e) => setRejectModalState((prev) => ({ ...prev, reason: e.target.value }))}
                rows={3}
                placeholder="Tulis alasan penolakan lainnya..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setRejectModalState((prev) => ({ ...prev, isOpen: false }))}
                variant="outline"
                className="flex-1 text-xs rounded-xl border-stone-300"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectModalState.isLoading || !rejectModalState.reason.trim()}
                className="flex-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
              >
                {rejectModalState.isLoading ? "Memproses..." : "Konfirmasi Tolak"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
