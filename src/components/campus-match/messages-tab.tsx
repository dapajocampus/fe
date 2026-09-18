"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Search,
  ArrowLeft,
  Send,
  Mic,
  Play,
  Pause,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  HeartOff,
  UserX,
  X,
  CheckCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { MatchItem, ChatMessage, UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { chatApi, isAuthenticated, getCurrentUserId } from "@/lib/api-client";
import {
  joinConversation,
  leaveConversation,
  onReceiveMessage,
  onMessageDeleted,
  onConversationCleared,
  emitDeleteMessage,
  emitClearConversation,
  emitMarkAsRead,
} from "@/lib/socket-client";

interface MessagesTabProps {
  currentUser?: UserProfile;
  matches: MatchItem[];
  messages: ChatMessage[];
  onlineUserIds?: Set<string>;
  onSendMessage: (matchId: string, content: string, type: "text" | "voice_note" | "video_note") => void;
  onReportUser: (userId: string, userName: string) => void;
  onBlockUser: (userId: string, userName: string) => void;
  onUnmatchMatch?: (matchId: string) => void;
  onMarkMatchAsRead?: (matchId: string) => void;
  onClearChat?: (matchId: string) => void;
}

export function MessagesTab({
  currentUser,
  matches,
  messages: initialMessages,
  onlineUserIds = new Set(),
  onSendMessage,
  onReportUser,
  onBlockUser,
  onUnmatchMatch,
  onMarkMatchAsRead,
  onClearChat,
}: MessagesTabProps) {
  const [activeMatch, setActiveMatch] = useState<MatchItem | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

  const myUserId = currentUser?.id || getCurrentUserId() || "user-me";

  // Auto-Scroll to Bottom Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeMatch) {
      scrollToBottom();
    }
  }, [chatMessages, activeMatch]);

  const handleOpenMatch = (match: MatchItem) => {
    setActiveMatch(match);
    if (onMarkMatchAsRead) {
      onMarkMatchAsRead(match.id);
    }
    if (match.conversationId) {
      chatApi.markAsRead(match.conversationId).catch(() => {});
      emitMarkAsRead(match.conversationId);
    }
  };

  // Load messages from backend when opening a chat
  useEffect(() => {
    const convId = activeMatch?.conversationId;
    if (!convId) return;
    if (!isAuthenticated()) return;

    // Immediately mark as read on backend and notify parent
    chatApi.markAsRead(convId).catch(() => {});
    emitMarkAsRead(convId);
    if (onMarkMatchAsRead && activeMatch) {
      onMarkMatchAsRead(activeMatch.id);
    }

    // Load chat history from REST API
    chatApi.getMessages(convId)
      .then((res: any) => {
        const rawList: any[] = Array.isArray(res) ? res : (res?.messages || []);
        if (rawList && rawList.length > 0) {
          const mapped: ChatMessage[] = rawList.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            type: (m.type || 'TEXT').toLowerCase() as any,
            content: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            status: 'read' as const,
          }));
          setChatMessages(mapped);
        } else {
          setChatMessages([]);
        }
      })
      .catch(() => {
        setChatMessages([]);
      });

    // Join WebSocket room
    joinConversation(convId);

    // Listen for incoming real-time messages
    const cleanupReceive = onReceiveMessage((msg) => {
      if (msg.conversationId === convId) {
        // While viewing this conversation, keep it marked as read
        chatApi.markAsRead(convId).catch(() => {});
        emitMarkAsRead(convId);
        if (onMarkMatchAsRead && activeMatch) {
          onMarkMatchAsRead(activeMatch.id);
        }

        const isMsgFromMe =
          msg.senderId === myUserId ||
          msg.senderId === "user-me" ||
          (activeMatch?.user?.id ? msg.senderId !== activeMatch.user.id : false);

        setChatMessages((prev) => {
          // 1. Avoid exact duplicate by message id
          if (prev.some((m) => m.id === msg.id)) return prev;

          // 2. If it's my own message echoed or confirmed, replace optimistic temp message
          if (isMsgFromMe) {
            const tempIdx = prev.findIndex(
              (m) => m.id.startsWith("msg-") && m.content === msg.content
            );
            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = {
                id: msg.id,
                senderId: msg.senderId,
                type: (msg.type || "TEXT").toLowerCase() as any,
                content: msg.content,
                timestamp: new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                status: "delivered",
              };
              return updated;
            }
          }

          // 3. New incoming message from partner
          const newMsg: ChatMessage = {
            id: msg.id,
            senderId: msg.senderId,
            type: (msg.type || "TEXT").toLowerCase() as any,
            content: msg.content,
            timestamp: new Date(msg.createdAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "delivered",
          };
          return [...prev, newMsg];
        });
      }
    });

    // Listen for message deletion
    const cleanupDelete = onMessageDeleted((data) => {
      if (data.conversationId === convId) {
        setChatMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      }
    });

    // Listen for conversation cleared
    const cleanupClear = onConversationCleared((data) => {
      if (data.conversationId === convId) {
        setChatMessages([]);
      }
    });

    return () => {
      cleanupReceive();
      cleanupDelete();
      cleanupClear();
      leaveConversation(convId);
    };
  }, [activeMatch?.conversationId, myUserId]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeMatch) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: myUserId,
      type: "text",
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };

    setChatMessages((prev) => [...prev, newMsg]);
    onSendMessage(activeMatch.id, inputText, "text");
    if (onMarkMatchAsRead) {
      onMarkMatchAsRead(activeMatch.id);
    }
    setInputText("");
  };

  const handleSimulateVoiceNote = () => {
    if (!activeMatch) return;
    setIsRecordingVoice(true);

    setTimeout(() => {
      setIsRecordingVoice(false);
      const voiceMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: myUserId,
        type: "voice_note",
        audioDurationSec: 14,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      };
      setChatMessages((prev) => [...prev, voiceMsg]);
      onSendMessage(activeMatch.id, "Voice note (0:14)", "voice_note");
      if (onMarkMatchAsRead) {
        onMarkMatchAsRead(activeMatch.id);
      }
    }, 1500);
  };

  const handleDeleteSingleMessage = (messageId: string) => {
    setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
    setDeletingMessageId(null);

    chatApi.deleteMessage(messageId).catch((err) => {
      console.warn("Failed to delete message via API:", err);
    });
    emitDeleteMessage(messageId);
  };

  const handleClearConversation = () => {
    if (!activeMatch) return;
    const convId = activeMatch.conversationId;

    setChatMessages([]);
    setShowClearModal(false);

    if (convId) {
      chatApi.clearConversation(convId).catch((err) => {
        console.warn("Failed to clear conversation via API:", err);
      });
      emitClearConversation(convId);
    }

    if (onClearChat) {
      onClearChat(activeMatch.id);
    }
  };

  const handleConfirmUnmatch = () => {
    if (!activeMatch) return;
    if (onUnmatchMatch) {
      onUnmatchMatch(activeMatch.id);
    }
    setShowUnmatchModal(false);
    setActiveMatch(null);
  };

  const handleConfirmBlockAndUnmatch = () => {
    if (!activeMatch) return;
    if (onUnmatchMatch) {
      onUnmatchMatch(activeMatch.id);
    }
    onBlockUser(activeMatch.user.id, activeMatch.user.name);
    setShowUnmatchModal(false);
    setActiveMatch(null);
  };

  // Check if current partner in active chat is online
  const isPartnerOnline = !!(activeMatch && onlineUserIds && onlineUserIds.has(activeMatch.user.id));

  // IF AN ACTIVE CHAT THREAD IS OPEN
  if (activeMatch) {
    return (
      <div className="fixed inset-0 z-[500] bg-[#f7f4ee] flex flex-col max-w-lg mx-auto pb-16 overflow-hidden">
        {/* Chat Thread Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white/95 backdrop-blur-md px-4 pt-10 sm:pt-3 pb-3 shadow-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setActiveMatch(null)}
              className="rounded-full p-1 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer shrink-0"
              title="Kembali ke daftar obrolan"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="relative shrink-0">
              <img
                src={activeMatch.user.photos[0]}
                alt={activeMatch.user.name}
                className="h-10 w-10 rounded-full object-cover border border-stone-200 shadow-xs"
              />
              {/* Real-time online indicator ONLY if user is currently online */}
              {isPartnerOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-stone-900 text-sm truncate">{activeMatch.user.name}</h3>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 fill-emerald-500/20 shrink-0" />
              </div>
              {/* Status indicator: Shows 'Online' only when user is in the app */}
              {isPartnerOnline ? (
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-500 font-normal truncate">{activeMatch.user.university}</span>
                </p>
              ) : (
                <p className="text-[10px] text-stone-500 truncate">
                  {activeMatch.user.university} • {activeMatch.user.major}
                </p>
              )}
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-full p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl space-y-1">
                {/* 1. HAPUS RIWAYAT CHAT */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowClearModal(true);
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-stone-800 hover:bg-rose-50 hover:text-rose-600 font-medium cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                  Hapus Riwayat Chat
                </button>

                {/* 2. HAPUS PASANGAN (UNMATCH) */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowUnmatchModal(true);
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-stone-800 hover:bg-rose-50 hover:text-rose-600 font-medium cursor-pointer"
                >
                  <HeartOff className="h-4 w-4 text-rose-500 fill-rose-500/20" />
                  Hapus Pasangan (Unmatch)
                </button>

                {/* 3. BLOKIR & HAPUS PASANGAN */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowUnmatchModal(true);
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-600 hover:bg-rose-100 font-bold cursor-pointer"
                >
                  <UserX className="h-4 w-4 text-rose-600 fill-rose-500/20" />
                  Blokir & Hapus Pasangan
                </button>

                {/* 4. LAPORKAN PENGGUNA */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onReportUser(activeMatch.user.id, activeMatch.user.name);
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 font-medium cursor-pointer"
                >
                  <ShieldAlert className="h-4 w-4 text-amber-600 fill-amber-500/20" />
                  Laporkan Pengguna
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-emerald-50/90 border-b border-emerald-200/60 px-3.5 py-1.5 text-[10px] text-emerald-800 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 fill-emerald-500/20" />
            <span className="truncate">Verified NIM • Utamakan keselamatan & privasi</span>
          </div>
          <button
            onClick={() => setShowClearModal(true)}
            className="text-[10px] font-bold text-rose-600 hover:underline shrink-0 cursor-pointer ml-2"
          >
            Bersihkan Chat
          </button>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 text-rose-400 flex items-center justify-center mx-auto">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-stone-800">Mulai Mengobrol</p>
              <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                Kirim pesan pertama untuk menyapa {activeMatch.user.name.split(" ")[0]}!
              </p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isMe =
                msg.senderId === "user-me" ||
                (myUserId && msg.senderId === myUserId) ||
                (activeMatch?.user?.id ? msg.senderId !== activeMatch.user.id : false);

              return (
                <div key={msg.id} className={`group flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  {/* TEXT MSG */}
                  {msg.type === "text" && (
                    <div
                      className={`relative max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-rose-500 text-white rounded-tr-xs"
                          : "bg-white text-stone-900 border border-stone-200 rounded-tl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex items-center gap-1.5 mt-1 text-[9px] font-mono ${isMe ? "justify-end text-rose-100" : "justify-start text-stone-400"}`}>
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="h-3 w-3 text-white" />}
                        {/* Delete Message Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingMessageId(msg.id);
                          }}
                          className={`ml-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer p-0.5 rounded ${
                            isMe ? "text-white hover:text-rose-200" : "text-stone-400 hover:text-rose-500"
                          }`}
                          title="Hapus pesan ini"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* VOICE NOTE MSG */}
                  {msg.type === "voice_note" && (
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-rose-500 text-white rounded-tr-xs"
                          : "bg-white text-stone-900 border border-stone-200 rounded-tl-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm cursor-pointer transition-transform hover:scale-105 ${
                            isMe ? "bg-white text-rose-600" : "bg-rose-500 text-white"
                          }`}
                        >
                          {isPlayingAudio ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1 h-5">
                            {[30, 60, 40, 85, 50, 95, 70, 40, 65, 35, 75, 45].map((h, idx) => (
                              <span
                                key={idx}
                                style={{ height: `${h}%` }}
                                className={`w-1 rounded-full ${isMe ? "bg-white/80" : "bg-rose-400"}`}
                              />
                            ))}
                          </div>
                          <div className={`flex items-center justify-between text-[9px] font-mono ${isMe ? "text-rose-100" : "text-stone-500"}`}>
                            <span>Voice Note • 0:{msg.audioDurationSec || "12"}</span>
                            <div className="flex items-center gap-1">
                              <span>{msg.timestamp}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingMessageId(msg.id);
                                }}
                                className="ml-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-current"
                                title="Hapus pesan suara"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CIRCULAR VIDEO NOTE MSG */}
                  {msg.type === "video_note" && (
                    <div className="flex flex-col items-center py-1">
                      <div className="relative group cursor-pointer">
                        <div className="relative h-28 w-28 rounded-full overflow-hidden border-3 border-rose-500 shadow-md ring-4 ring-rose-500/20">
                          <img
                            src={activeMatch.user.photos[0]}
                            alt="Circular Video Note"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-stone-950/30 flex items-center justify-center">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-md">
                              <Play className="h-4 w-4 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-stone-500">
                        <span>Video Note • 0:08</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => setDeletingMessageId(msg.id)}
                          className="ml-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-stone-400 hover:text-rose-500"
                          title="Hapus video note"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {/* Scroll Anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-stone-200 bg-white flex items-center gap-2 shadow-lg shrink-0">
          <button
            type="button"
            onClick={handleSimulateVoiceNote}
            disabled={isRecordingVoice}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer ${
              isRecordingVoice
                ? "border-rose-500 bg-rose-500 text-white animate-pulse"
                : "border-stone-200 bg-stone-50 text-cyan-600 hover:bg-stone-100"
            }`}
            title="Kirim Voice Note"
          >
            <Mic className="h-5 w-5 fill-current" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 rounded-full border border-stone-200 bg-stone-50 py-2.5 px-4 text-xs text-stone-900 focus:border-rose-500 focus:outline-none"
          />

          <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-sm">
            <Send className="h-4 w-4 fill-white" />
          </Button>
        </form>

        {/* DELETE SINGLE MESSAGE MODAL */}
        {deletingMessageId && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-xs rounded-3xl border border-stone-200 bg-white p-5 text-center shadow-xl space-y-3 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-rose-600 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Hapus Pesan Ini?</h3>
              <p className="text-xs text-stone-500">Pesan ini akan dihapus dari obrolan secara permanen.</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeletingMessageId(null)}
                  className="flex-1 rounded-xl border border-stone-200 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSingleMessage(deletingMessageId)}
                  className="flex-1 rounded-xl bg-rose-500 py-2 text-xs font-bold text-white hover:bg-rose-600 shadow-sm cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CLEAR CONVERSATION MODAL */}
        {showClearModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-xs rounded-3xl border border-stone-200 bg-white p-5 text-center shadow-xl space-y-3 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-rose-600 mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Hapus Seluruh Chat?</h3>
              <p className="text-xs text-stone-500">
                Seluruh riwayat obrolan dengan <strong>{activeMatch.user.name.split(" ")[0]}</strong> akan dibersihkan. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleClearConversation}
                  className="flex-1 rounded-xl bg-rose-500 py-2 text-xs font-bold text-white hover:bg-rose-600 shadow-sm cursor-pointer"
                >
                  Hapus Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UNMATCH / BLOCK CONFIRMATION MODAL */}
        {showUnmatchModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-5 text-center shadow-xl space-y-4 relative">
              <button
                onClick={() => setShowUnmatchModal(false)}
                className="absolute top-4 right-4 rounded-full p-1 text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 mx-auto">
                <HeartOff className="h-7 w-7 fill-rose-500/20" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">
                  Hapus Pasangan dengan {activeMatch.user.name.split(" ")[0]}?
                </h3>
                <p className="text-xs text-stone-600">
                  Koneksi & riwayat obrolan dengan mahasiswa ini akan dihapus secara permanen.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  onClick={handleConfirmUnmatch}
                  className="w-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-2xl py-2.5"
                >
                  Ya, Hapus Pasangan
                </Button>
                <Button
                  onClick={handleConfirmBlockAndUnmatch}
                  variant="outline"
                  className="w-full text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl py-2.5"
                >
                  Blokir & Hapus Pasangan
                </Button>
                <button
                  onClick={() => setShowUnmatchModal(false)}
                  className="text-xs text-stone-500 hover:text-stone-900 pt-1 block mx-auto cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT MATCHES LIST VIEW
  return (
    <div className="mx-auto max-w-lg px-4 py-4 space-y-5 pb-24 bg-[#f7f4ee]">
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-rose-500 fill-rose-500/20" />
          <span>Pesan & Pasangan Kampus</span>
        </h2>
        <p className="text-xs text-stone-500">Mulai mengobrol dengan mahasiswa yang telah Match denganmu</p>
      </div>

      {matches.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-rose-400" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-stone-900">Belum Ada Pasangan</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Kamu belum memiliki match. Mulai <strong>swipe</strong> di halaman <strong>Discover</strong> untuk menemukan pasangan kampus!
            Saat dua orang saling suka, kalian akan bisa chat di sini secara <strong>real-time</strong>.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              <Sparkles className="h-3 w-3" />
              Saling Suka = Match = Chat!
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Horizontal Matches Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Pasangan Baru ({matches.length})
              </span>
              <span className="text-[10px] text-stone-500">Geser untuk melihat</span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {matches.map((match) => {
                const isUserOnline = !!(onlineUserIds && onlineUserIds.has(match.user.id));

                return (
                  <button
                    key={match.id}
                    onClick={() => handleOpenMatch(match)}
                    className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={match.user.photos[0]}
                        alt={match.user.name}
                        className="h-16 w-16 rounded-2xl object-cover border-2 border-rose-500 group-hover:scale-105 transition-transform shadow-sm"
                      />
                      {/* Presence Dot: ONLY when user is currently active/online */}
                      {isUserOnline && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
                      )}
                      {/* Unread indicator badge: Hides when read */}
                      {match.unread && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-stone-800 truncate max-w-[70px]">
                      {match.user.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messages Thread List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
              Obrolan Aktif
            </span>

            <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-sm divide-y divide-stone-100">
              {matches.map((match) => {
                const isUserOnline = !!(onlineUserIds && onlineUserIds.has(match.user.id));

                return (
                  <div
                    key={match.id}
                    onClick={() => handleOpenMatch(match)}
                    className={`p-3.5 flex items-center justify-between transition-colors cursor-pointer ${
                      match.unread
                        ? "bg-rose-50/40 hover:bg-rose-50/70"
                        : "hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={match.user.photos[0]}
                          alt={match.user.name}
                          className="h-12 w-12 rounded-2xl object-cover border border-stone-200 shadow-xs"
                        />
                        {/* Real-time Online presence: ONLY shown if user is online in app */}
                        {isUserOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className={`text-sm truncate ${match.unread ? "font-black text-stone-950" : "font-bold text-stone-900"}`}>
                            {match.user.name}
                          </h3>
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 fill-emerald-500/20 shrink-0" />
                        </div>
                        <p className={`text-xs truncate ${match.unread ? "font-bold text-stone-950" : "text-stone-500"}`}>
                          {match.lastMessage || "Kirim pesan pertama! 👋"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                      <span className={`text-[10px] font-mono ${match.unread ? "text-rose-600 font-bold" : "text-stone-400"}`}>
                        {match.lastMessageTime}
                      </span>
                      {/* Unread badge: Vanishes as soon as conversation is opened or replied to */}
                      {match.unread && (
                        <span className="flex h-4 min-w-[16px] px-1.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-2xs animate-pulse">
                          Baru
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
