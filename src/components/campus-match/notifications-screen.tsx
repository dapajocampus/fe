"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Megaphone,
  AlertTriangle,
  Info,
  ShieldCheck,
  Sparkles,
  Clock,
  RefreshCw,
  Inbox,
  ChevronRight,
} from "lucide-react";
import { notificationApi, AppNotification } from "@/lib/api-client";

interface NotificationsScreenProps {
  onBack: () => void;
  onNotificationRead?: () => void;
}

export function NotificationsScreen({
  onBack,
  onNotificationRead,
}: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationApi.getAll();
      setNotifications(data || []);
    } catch (err) {
      console.warn("Failed to load notifications:", err);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto mark all as read when exiting
  const handleExit = () => {
    if (onNotificationRead) onNotificationRead();
    notificationApi.markAllAsRead().catch((err) => {
      console.warn("Failed to mark all as read:", err);
    });
    onBack();
  };

  useEffect(() => {
    loadNotifications();

    return () => {
      // Auto mark all read when unmounting (e.g. clicking bottom nav)
      notificationApi.markAllAsRead().catch(() => {});
      if (onNotificationRead) onNotificationRead();
    };
  }, []);

  const handleMarkAsRead = async (id: string, currentlyRead: boolean) => {
    // Toggle expand
    setExpandedId(expandedId === id ? null : id);

    if (currentlyRead) return;

    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "UNREAD") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, activeFilter]);

  // Group notifications into "Terbaru" (Unread or today) and "Sebelumnya" (Read/past)
  const { newNotifs, earlierNotifs } = useMemo(() => {
    const unread = filteredNotifications.filter((n) => !n.isRead);
    const read = filteredNotifications.filter((n) => n.isRead);
    return { newNotifs: unread, earlierNotifs: read };
  }, [filteredNotifications]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m yang lalu`;
    if (diffHours < 24) return `${diffHours}j yang lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays}h yang lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  const renderNotifItem = (notif: AppNotification) => {
    const isExpanded = expandedId === notif.id;

    return (
      <div
        key={notif.id}
        onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
        className={`px-4 py-3.5 border-b border-stone-200/60 transition-colors cursor-pointer ${
          !notif.isRead
            ? "bg-rose-50/30 hover:bg-rose-50/50"
            : "bg-white hover:bg-stone-50/80"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Avatar / Icon in clean DAPAJO theme */}
          <div className="relative shrink-0 mt-0.5">
            <div className="h-10 w-10 rounded-full bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-700 shadow-2xs">
              {notif.type === "WARNING" ? (
                <AlertTriangle className="h-4 w-4 text-rose-500" />
              ) : notif.type === "INFO" ? (
                <Sparkles className="h-4 w-4 text-rose-500" />
              ) : notif.type === "SYSTEM" ? (
                <ShieldCheck className="h-4 w-4 text-stone-700" />
              ) : (
                <Megaphone className="h-4 w-4 text-rose-500" />
              )}
            </div>
            {!notif.isRead && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-stone-800 leading-relaxed">
              <span className="font-bold text-stone-900 mr-1.5">
                {notif.title}
              </span>
              <span className={isExpanded ? "" : "line-clamp-2"}>
                {notif.content}
              </span>
            </div>

            {/* Meta: time and optional target */}
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-400">
              <span>{formatTime(notif.createdAt)}</span>
              {notif.targetType === "SPECIFIC" && (
                <>
                  <span>•</span>
                  <span className="text-stone-500 font-medium">Khusus untuk kamu</span>
                </>
              )}
              {notif.type === "ANNOUNCEMENT" && (
                <>
                  <span>•</span>
                  <span className="text-stone-500">Pengumuman</span>
                </>
              )}
            </div>
          </div>

          {/* Indicator arrow */}
          <div className="shrink-0 self-center pl-1 text-stone-300">
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pb-28 bg-[#f7f4ee]">
      {/* Instagram-style Top Bar */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f4ee]/95 backdrop-blur-xl px-4 pt-10 sm:pt-3 pb-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExit}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-200/60 active:bg-stone-200 transition-colors cursor-pointer text-stone-800"
              title="Kembali ke swipe"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold text-stone-900 tracking-tight">
              Notifikasi
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer flex items-center gap-1"
                title="Tandai semua notifikasi telah dibaca"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Tandai dibaca</span>
              </button>
            )}

            <button
              onClick={loadNotifications}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer text-stone-500 hover:text-stone-800"
              title="Perbarui notifikasi"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-lg">
        {/* Simple Filter Tabs */}
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-stone-200/60 bg-[#f7f4ee]">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "ALL"
                ? "bg-stone-900 text-white shadow-2xs"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter("UNREAD")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "UNREAD"
                ? "bg-stone-900 text-white shadow-2xs"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="py-24 text-center space-y-2">
            <RefreshCw className="h-6 w-6 text-stone-400 animate-spin mx-auto" />
            <p className="text-xs text-stone-500">Memuat notifikasi...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-24 text-center space-y-3 px-6">
            <div className="h-14 w-14 rounded-full bg-stone-100 border border-stone-200 text-stone-400 flex items-center justify-center mx-auto">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">
              {activeFilter === "UNREAD"
                ? "Semua notifikasi telah dibaca"
                : "Belum ada notifikasi"}
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              Pemberitahuan resmi, pengumuman dari kampus, dan pesan admin akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200/60 bg-white border-b border-stone-200/60">
            {/* Section: Terbaru (Unread) */}
            {newNotifs.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-stone-50/90 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100">
                  Terbaru ({newNotifs.length})
                </div>
                {newNotifs.map(renderNotifItem)}
              </div>
            )}

            {/* Section: Sebelumnya (Read) */}
            {earlierNotifs.length > 0 && (
              <div>
                {newNotifs.length > 0 && (
                  <div className="px-4 py-2 bg-stone-50/90 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100">
                    Sebelumnya
                  </div>
                )}
                {earlierNotifs.map(renderNotifItem)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
