"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SplashScreen } from "@/components/campus-match/splash-screen";
import { OnboardingFlow } from "@/components/campus-match/onboarding-flow";
import { AuthScreen } from "@/components/campus-match/auth-screen";
import { TopHeader } from "@/components/campus-match/top-header";
import { BottomNav } from "@/components/campus-match/bottom-nav";
import { DiscoverTab } from "@/components/campus-match/discover-tab";
import { NearbyTab } from "@/components/campus-match/nearby-tab";
import { MessagesTab } from "@/components/campus-match/messages-tab";
import { ProfileTab } from "@/components/campus-match/profile-tab";
import { VerificationModal } from "@/components/campus-match/verification-modal";
import { SafetyModal } from "@/components/campus-match/safety-modal";
import { MatchPopup } from "@/components/campus-match/match-popup";
import { NotificationsScreen } from "@/components/campus-match/notifications-screen";

import {
  CURRENT_USER,
  INITIAL_PREFERENCES,
  MOCK_SWIPE_PROFILES,
  MOCK_NEARBY_STUDENTS,
  getStudentAvatar,
} from "@/lib/mock-data";
import { SwipeProfile, UserPreferences, MatchItem, ChatMessage, UserProfile, NearbyStudent } from "@/lib/types";
import {
  discoverApi,
  swipeApi,
  chatApi,
  safetyApi,
  profileApi,
  notificationApi,
  isAuthenticated,
  isAdmin,
  getCurrentUserId,
  getCurrentUserEmail,
  clearTokens,
  DiscoverCandidate,
} from "@/lib/api-client";
import {
  connectSocket,
  disconnectSocket,
  isSocketConnected,
  onReceiveMessage,
  onNewMessageNotification,
  joinConversation,
  sendMessageWS,
  onOnlineUsers,
  onUserOnline,
  onUserOffline,
  emitMarkAsRead,
} from "@/lib/socket-client";
import { AdminVerificationDashboard } from "@/components/admin/admin-verification-dashboard";

export default function Home() {
  // Application Lifecycle State: 'splash' | 'onboarding' | 'auth' | 'main' | 'admin'
  const [appState, setAppState] = useState<"splash" | "onboarding" | "auth" | "main" | "admin">("splash");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  // Main App State
  const [activeTab, setActiveTab] = useState("discover");
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [preferences, setPreferences] = useState<UserPreferences>(INITIAL_PREFERENCES);
  const [isRajaMember, setIsRajaMember] = useState(false);

  // Swipe State
  const [swipeProfiles, setSwipeProfiles] = useState<SwipeProfile[]>([]);
  const [history, setHistory] = useState<SwipeProfile[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<SwipeProfile | null>(null);

  // Matches & Chat State — starts empty, loaded from backend
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  // Count unread conversations
  const unreadChatCount = useMemo(() => {
    return matches.filter((m) => m.unread).length;
  }, [matches]);

  // Modals & Navigation
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [prevTab, setPrevTab] = useState("discover");
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [safetyModalState, setSafetyModalState] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string | null;
    mode: "report" | "block";
  }>({
    isOpen: false,
    userId: null,
    userName: null,
    mode: "report",
  });

  // ─── Helper: Convert backend candidate to frontend SwipeProfile ─────
  const candidateToSwipeProfile = useCallback((c: DiscoverCandidate): SwipeProfile => {
    return {
      id: c.userId,
      name: c.displayName,
      age: 21,
      gender: c.gender === 'FEMALE' ? 'wanita' : c.gender === 'MALE' ? 'pria' : 'lainnya',
      university: c.universityName || 'Universitas',
      major: c.major || 'Informatika',
      semester: c.batchYear ? (new Date().getFullYear() - c.batchYear) * 2 : 6,
      bio: c.bio || '',
      photos: c.photos.length > 0 
        ? c.photos.map(p => p.photoUrl) 
        : [getStudentAvatar(c.displayName, c.gender === 'FEMALE' ? 'wanita' : 'pria', "#4f46e5", "#4338ca", "#312e81")],
      interests: ['Coding', 'Coffee'],
      verification: {
        isVerified: c.isVerified,
        email: c.campusEmail || c.email || '',
        university: c.universityName || '',
        major: c.major || '',
        nimMasked: '***',
      },
      locationName: `${c.distanceKm.toFixed(1)} km dari kamu`,
      distanceKm: c.distanceKm,
      activityStatus: 'Aktif',
      compatibility: {
        totalScore: Math.floor(70 + Math.random() * 25),
        breakdown: {
          interest: Math.floor(15 + Math.random() * 15),
          university: Math.floor(10 + Math.random() * 10),
          major: Math.floor(5 + Math.random() * 10),
          age: Math.floor(5 + Math.random() * 10),
          location: Math.floor(3 + Math.random() * 7),
          activity: Math.floor(2 + Math.random() * 8),
        },
      },
      commonInterests: ['Coding', 'Coffee'],
    };
  }, []);

  // ─── Helper: Convert backend candidate to NearbyStudent ─────
  const candidateToNearbyStudent = useCallback((c: DiscoverCandidate): NearbyStudent => {
    return {
      id: c.userId,
      name: c.displayName,
      age: 21,
      gender: c.gender === 'FEMALE' ? 'wanita' : c.gender === 'MALE' ? 'pria' : 'lainnya',
      university: c.universityName || 'Universitas',
      major: c.major || 'Informatika',
      semester: c.batchYear ? (new Date().getFullYear() - c.batchYear) * 2 : 6,
      bio: c.bio || '',
      photos: c.photos.length > 0 
        ? c.photos.map(p => p.photoUrl) 
        : [getStudentAvatar(c.displayName, c.gender === 'FEMALE' ? 'wanita' : 'pria', "#4f46e5", "#4338ca", "#312e81")],
      interests: ['Coding', 'Coffee'],
      verification: {
        isVerified: c.isVerified,
        email: c.campusEmail || c.email || '',
        university: c.universityName || '',
        major: c.major || '',
        nimMasked: '***',
      },
      locationName: `${c.distanceKm.toFixed(1)} km`,
      distanceKm: c.distanceKm,
      activityStatus: 'Aktif',
      distanceApproxKm: c.distanceKm,
      privacySetting: 'approximate',
      campusArea: c.universityName || 'Kampus',
      isOnline: onlineUserIds.has(c.userId),
    };
  }, [onlineUserIds]);

  // ─── Load live data from backend when entering main state ─────
  const [nearbyStudents, setNearbyStudents] = useState<NearbyStudent[]>([]);

  useEffect(() => {
    if (appState !== 'main') return;
    if (!isAuthenticated()) return;

    const tokenUserId = getCurrentUserId();
    const tokenEmail = getCurrentUserEmail();

    // Concurrently load profile, candidates, and matches
    Promise.all([
      profileApi.getMe().catch(err => {
        console.warn('[DAPAJO] Failed to load profile in main:', err.message);
        return null;
      }),
      discoverApi.getNearby({ radiusKm: 50 }).catch(err => {
        console.warn('[DAPAJO] Failed to load discover candidates:', err.message);
        return { total: 0, candidates: [] };
      }),
      swipeApi.getMatches().catch(err => {
        console.warn('[DAPAJO] Failed to load matches:', err.message);
        return [];
      }),
      notificationApi.getUnreadCount().catch(() => ({ unreadCount: 0 })),
    ]).then(([backendProfile, discoverRes, backendMatches, notifRes]) => {
      if (notifRes && typeof notifRes.unreadCount === 'number') {
        setUnreadNotifCount(notifRes.unreadCount);
      }
      let activeUserId = tokenUserId;
      let activeUserName = "";
      let activeUserEmail = tokenEmail || "";
      let activeProfileId = "";

      if (backendProfile) {
        activeUserId = backendProfile.user.id;
        activeUserName = (backendProfile.displayName || "").trim();
        activeUserEmail = (backendProfile.user.campusEmail || backendProfile.user.email || activeUserEmail).trim();
        activeProfileId = backendProfile.id;

        setCurrentUser({
          id: backendProfile.user.id,
          name: backendProfile.displayName || "Mahasiswa",
          age: backendProfile.birthDate ? Math.floor((Date.now() - new Date(backendProfile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 21,
          gender: backendProfile.gender === 'FEMALE' ? 'wanita' : backendProfile.gender === 'MALE' ? 'pria' : 'lainnya',
          university: backendProfile.universityName || "Universitas",
          major: backendProfile.major || "Informatika",
          semester: backendProfile.batchYear ? (new Date().getFullYear() - backendProfile.batchYear) * 2 : 6,
          bio: backendProfile.bio || "",
          photos: backendProfile.photos.length > 0 
            ? backendProfile.photos.map(p => p.photoUrl) 
            : [getStudentAvatar(backendProfile.displayName || "Mahasiswa", backendProfile.gender === 'FEMALE' ? 'wanita' : 'pria', "#f43f5e", "#e11d48", "#be123c")],
          interests: ["Kuliner", "Musik", "Traveling"],
          verification: {
            isVerified: backendProfile.user.status === 'ACTIVE',
            email: backendProfile.user.campusEmail || backendProfile.user.email,
            university: backendProfile.universityName || "Universitas",
            major: backendProfile.major || "Informatika",
            nimMasked: "***",
          },
          locationName: "Yogyakarta",
          distanceKm: 0,
          activityStatus: "Online",
        });
      }

      // Check if an item belongs to the currently logged in user
      const isSelf = (item: {
        id?: string;
        userId?: string;
        name?: string;
        displayName?: string;
        email?: string;
        campusEmail?: string;
        verification?: { email?: string };
      }) => {
        const id = item.userId || item.id;
        if (activeUserId && (id === activeUserId || id === `user-${activeUserId}`)) return true;
        if (activeProfileId && (item.id === activeProfileId || item.userId === activeProfileId)) return true;
        const candidateName = (item.displayName || item.name || "").trim().toLowerCase();
        if (activeUserName && candidateName && candidateName === activeUserName.toLowerCase()) return true;
        const candidateEmail = (item.campusEmail || item.email || item.verification?.email || "").trim().toLowerCase();
        if (activeUserEmail && candidateEmail && candidateEmail === activeUserEmail.toLowerCase()) return true;
        return false;
      };

      // Process candidates for swipe profiles
      if (discoverRes && Array.isArray(discoverRes.candidates)) {
        const filteredCandidates = discoverRes.candidates.filter(c => !isSelf(c));
        const profiles = filteredCandidates.map(candidateToSwipeProfile);
        setSwipeProfiles(profiles);

        const nearby = filteredCandidates.map(candidateToNearbyStudent);
        setNearbyStudents(nearby);
      }

      // Matches
      if (backendMatches && backendMatches.length > 0) {
        const mapped: MatchItem[] = backendMatches.map((m) => {
          const isUnread = !!(
            m.lastMessage &&
            !m.lastMessage.readAt &&
            m.lastMessage.senderId !== activeUserId
          );

          return {
            id: m.matchId,
            conversationId: m.conversationId,
            user: {
              id: m.targetUser.userId,
              name: m.targetUser.displayName || 'User',
              age: 21,
              gender: 'pria' as const,
              university: m.targetUser.major || 'Universitas',
              major: m.targetUser.major || '',
              semester: 6,
              bio: '',
              photos: m.targetUser.photoUrl ? [m.targetUser.photoUrl] : [getStudentAvatar(m.targetUser.displayName || 'User', 'pria', '#4f46e5', '#4338ca', '#312e81')],
              interests: [],
              verification: { isVerified: true, email: '', university: '', major: '', nimMasked: '***' },
              locationName: '',
              distanceKm: 0,
              activityStatus: 'Aktif',
            },
            matchedAt: m.matchedAt || 'Baru saja',
            unread: isUnread,
            lastMessage: m.lastMessage?.content,
            lastMessageTime: m.lastMessage?.createdAt ? new Date(m.lastMessage.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        });
        setMatches(mapped);
      }
    });

    // Connect WebSocket for real-time chat & presence
    const token = typeof window !== 'undefined' ? localStorage.getItem('dapajo_access_token') : null;
    let cleanupNotif: (() => void) | undefined;
    let cleanupOnline: (() => void) | undefined;
    let cleanupUserOn: (() => void) | undefined;
    let cleanupUserOff: (() => void) | undefined;

    if (token) {
      connectSocket(token);

      // Listen for incoming message notifications in real-time
      cleanupNotif = onNewMessageNotification((data) => {
        setMatches((prev) =>
          prev.map((m) => {
            if (m.conversationId === data.conversationId) {
              return {
                ...m,
                lastMessage: data.message.content,
                lastMessageTime: new Date(data.message.createdAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                unread: true,
              };
            }
            return m;
          })
        );
      });

      // Presence: Listen for currently online users
      cleanupOnline = onOnlineUsers((ids) => {
        setOnlineUserIds(new Set(ids));
      });

      cleanupUserOn = onUserOnline(({ userId }) => {
        setOnlineUserIds((prev) => new Set([...prev, userId]));
      });

      cleanupUserOff = onUserOffline(({ userId }) => {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      // Initial REST fetch for online users
      chatApi.getOnlineUsers()
        .then((res) => {
          if (res?.onlineUserIds) {
            setOnlineUserIds(new Set(res.onlineUserIds));
          }
        })
        .catch(() => {});
    }

    return () => {
      cleanupNotif?.();
      cleanupOnline?.();
      cleanupUserOn?.();
      cleanupUserOff?.();
    };
  }, [appState, candidateToSwipeProfile, candidateToNearbyStudent]);
 
  // Refresh unread notification count periodically and when returning to window
  useEffect(() => {
    if (appState !== 'main') return;
    if (!isAuthenticated()) return;

    const refreshCount = () => {
      if (activeTab === 'notifications') return;
      notificationApi.getUnreadCount()
        .then((res) => {
          if (typeof res?.unreadCount === 'number') {
            setUnreadNotifCount(res.unreadCount);
          }
        })
        .catch(() => {});
    };

    const timer = setInterval(refreshCount, 15000);
    window.addEventListener('focus', refreshCount);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refreshCount);
    };
  }, [appState, activeTab]);

  // Helper: check if ID is a valid UUID (backend profile) vs mock profile
  const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Swipe Handlers
  const handleSwipeLike = (profile: SwipeProfile) => {
    const myId = currentUser?.id && currentUser.id !== 'user-me' ? currentUser.id : getCurrentUserId();
    if (myId && (profile.id === myId || (profile as any).userId === myId)) {
      return;
    }

    setHistory((prev) => [...prev, profile]);

    if (isUUID(profile.id)) {
      // Real backend user — send swipe to API
      swipeApi.swipe(profile.id, 'LIKE')
        .then(res => {
          if (res.isMatch && res.match) {
            setMatchedProfile(profile);
            if (!matches.some((m) => m.user.id === profile.id)) {
              const newMatch: MatchItem = {
                id: res.match.id,
                conversationId: res.match.conversationId,
                user: profile,
                matchedAt: "Baru Saja",
                unread: true,
                lastMessage: "Mutual match! Kirim pesan sekarang ✨",
                lastMessageTime: "Baru saja",
              };
              setMatches((prev) => [newMatch, ...prev]);
            }
          }
          console.log(`[DAPAJO] Swipe LIKE sent. Remaining today: ${res.remainingSwipesToday}`);
        })
        .catch(err => {
          console.warn('[DAPAJO] Swipe API failed:', err.message);
        });
    } else {
      // Mock profile — handle locally for demo
      if (profile.id === "prof-5" || profile.id === "prof-1") {
        setMatchedProfile(profile);
        if (!matches.some((m) => m.user.id === profile.id)) {
          const newMatch: MatchItem = {
            id: `match-${Date.now()}`,
            user: profile,
            matchedAt: "Baru Saja",
            unread: true,
            lastMessage: "Mutual match! Kirim pesan sekarang ✨",
            lastMessageTime: "Baru saja",
          };
          setMatches((prev) => [newMatch, ...prev]);
        }
      }
    }
  };

  const handleSwipeSkip = (profile: SwipeProfile) => {
    const myId = currentUser?.id && currentUser.id !== 'user-me' ? currentUser.id : getCurrentUserId();
    if (myId && (profile.id === myId || (profile as any).userId === myId)) {
      return;
    }

    setHistory((prev) => [...prev, profile]);
    if (isUUID(profile.id)) {
      swipeApi.swipe(profile.id, 'PASS').catch(() => {});
    }
  };

  const handleSwipeSuperLike = (profile: SwipeProfile) => {
    const myId = currentUser?.id && currentUser.id !== 'user-me' ? currentUser.id : getCurrentUserId();
    if (myId && (profile.id === myId || (profile as any).userId === myId)) {
      return;
    }

    setHistory((prev) => [...prev, profile]);

    if (isUUID(profile.id)) {
      swipeApi.swipe(profile.id, 'SUPERLIKE')
        .then(res => {
          if (res.isMatch && res.match) {
            setMatchedProfile(profile);
            if (!matches.some((m) => m.user.id === profile.id)) {
              const newMatch: MatchItem = {
                id: res.match.id,
                conversationId: res.match.conversationId,
                user: profile,
                matchedAt: "Baru Saja",
                unread: true,
                lastMessage: "Super Like match! ✨",
                lastMessageTime: "Baru saja",
              };
              setMatches((prev) => [newMatch, ...prev]);
            }
          }
        })
        .catch(() => {});
    } else {
      // Fallback local match for demo mock profiles
      if (profile.id === "prof-5" || profile.id === "prof-1") {
        setMatchedProfile(profile);
        if (!matches.some((m) => m.user.id === profile.id)) {
          const newMatch: MatchItem = {
            id: `match-${Date.now()}`,
            user: profile,
            matchedAt: "Baru Saja",
            unread: true,
            lastMessage: "Super Like match! ✨",
            lastMessageTime: "Baru saja",
          };
          setMatches((prev) => [newMatch, ...prev]);
        }
      }
    }
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setSwipeProfiles((prev) => [last, ...prev]);
  };

  // Chat message send — uses real backend API + WebSocket
  const handleSendMessage = (matchId: string, content: string, type: "text" | "voice_note" | "video_note") => {
    const match = matches.find(m => m.id === matchId);
    const convId = match?.conversationId;

    if (convId) {
      // Send via WebSocket if connected, fallback to REST if disconnected
      if (isSocketConnected()) {
        sendMessageWS({ conversationId: convId, content, type: type === 'text' ? 'TEXT' : 'TEXT' });
      } else {
        chatApi.sendMessage(convId, content, type === 'text' ? 'TEXT' : 'TEXT').catch(() => {});
      }
    }

    // Update last message in matches list
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              lastMessage: content,
              lastMessageTime: "Baru saja",
              unread: false,
            }
          : m
      )
    );
  };

  // Mark a conversation / match as read
  const handleMarkMatchAsRead = useCallback((matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          if (m.conversationId) {
            chatApi.markAsRead(m.conversationId).catch(() => {});
            emitMarkAsRead(m.conversationId);
          }
          return { ...m, unread: false };
        }
        return m;
      })
    );
  }, []);

  // Nearby handlers
  const handleSelectNearbyStudent = (student: NearbyStudent) => {
    const swipeProf: SwipeProfile = {
      ...student,
      compatibility: {
        totalScore: 92,
        breakdown: { interest: 28, university: 18, major: 15, age: 14, location: 10, activity: 7 },
      },
      commonInterests: student.interests.slice(0, 3),
    };
    setMatchedProfile(swipeProf);
  };

  const handleLikeNearbyStudent = (student: NearbyStudent) => {
    const swipeProf: SwipeProfile = {
      ...student,
      compatibility: {
        totalScore: 95,
        breakdown: { interest: 30, university: 20, major: 15, age: 15, location: 10, activity: 5 },
      },
      commonInterests: student.interests.slice(0, 3),
    };
    setMatchedProfile(swipeProf);
  };

  // Safety Handlers
  const handleOpenReport = (userId: string, userName: string) => {
    setSafetyModalState({ isOpen: true, userId, userName, mode: "report" });
  };

  const handleOpenBlock = (userId: string, userName: string) => {
    setSafetyModalState({ isOpen: true, userId, userName, mode: "block" });
  };

  const handleConfirmBlock = () => {
    if (safetyModalState.userId) {
      setMatches((prev) => prev.filter((m) => m.user.id !== safetyModalState.userId));
      setSwipeProfiles((prev) => prev.filter((p) => p.id !== safetyModalState.userId));
      // Send block to backend
      safetyApi.blockUser(safetyModalState.userId).catch(() => {});
    }
  };

  const handleToggleVerification = () => {
    setCurrentUser((prev) => ({
      ...prev,
      verification: {
        ...prev.verification,
        isVerified: !prev.verification.isVerified,
      },
    }));
  };

  // Filter out the currently logged-in user from swipe cards and nearby list
  const visibleSwipeProfiles = useMemo(() => {
    const tokenUserId = getCurrentUserId();
    const tokenEmail = (getCurrentUserEmail() || "").trim().toLowerCase();
    const currentId = currentUser?.id && currentUser.id !== "user-me" ? currentUser.id : tokenUserId;
    const currentName = (currentUser?.name && currentUser.name !== "Rizky Ramadhan" ? currentUser.name : "").trim().toLowerCase();
    const currentEmail = (currentUser?.verification?.email || tokenEmail || "").trim().toLowerCase();

    return swipeProfiles.filter((profile) => {
      // 1. Exclude if ID matches current user ID or profile ID
      if (currentId && (profile.id === currentId || profile.id === `user-${currentId}` || (profile as any).userId === currentId)) {
        return false;
      }
      if (tokenUserId && (profile.id === tokenUserId || (profile as any).userId === tokenUserId)) {
        return false;
      }
      // 2. Exclude if display name matches current user
      if (currentName && profile.name && profile.name.trim().toLowerCase() === currentName) {
        return false;
      }
      // 3. Exclude if campus/personal email matches current user
      const profileEmail = (profile.verification?.email || (profile as any).email || (profile as any).campusEmail || "").trim().toLowerCase();
      if (currentEmail && profileEmail && profileEmail === currentEmail) {
        return false;
      }
      return true;
    });
  }, [swipeProfiles, currentUser]);

  const visibleNearbyStudents = useMemo(() => {
    const tokenUserId = getCurrentUserId();
    const tokenEmail = (getCurrentUserEmail() || "").trim().toLowerCase();
    const currentId = currentUser?.id && currentUser.id !== "user-me" ? currentUser.id : tokenUserId;
    const currentName = (currentUser?.name && currentUser.name !== "Rizky Ramadhan" ? currentUser.name : "").trim().toLowerCase();
    const currentEmail = (currentUser?.verification?.email || tokenEmail || "").trim().toLowerCase();

    return nearbyStudents.filter((student) => {
      if (currentId && (student.id === currentId || student.id === `user-${currentId}` || (student as any).userId === currentId)) {
        return false;
      }
      if (tokenUserId && (student.id === tokenUserId || (student as any).userId === tokenUserId)) {
        return false;
      }
      if (currentName && student.name && student.name.trim().toLowerCase() === currentName) {
        return false;
      }
      const studentEmail = (student.verification?.email || (student as any).email || (student as any).campusEmail || "").trim().toLowerCase();
      if (currentEmail && studentEmail && studentEmail === currentEmail) {
        return false;
      }
      return true;
    });
  }, [nearbyStudents, currentUser]);

  // 1. SPLASH SCREEN STAGE
  if (appState === "splash") {
    return (
      <SplashScreen
        onComplete={() => {
          if (isAuthenticated()) {
            if (isAdmin()) {
              setAppState("admin");
            } else {
              setAppState("main");
            }
          } else {
            setAppState("onboarding");
          }
        }}
      />
    );
  }

  // 2. ONBOARDING STAGE
  if (appState === "onboarding") {
    return (
      <OnboardingFlow
        onComplete={() => {
          setAuthMode("register");
          setAppState("auth");
        }}
        onGoLogin={() => {
          setAuthMode("login");
          setAppState("auth");
        }}
      />
    );
  }

  // 3. AUTH (LOGIN / REGISTER) STAGE
  if (appState === "auth") {
    return (
      <AuthScreen
        defaultMode={authMode}
        onSuccessAuth={(user) => {
          setCurrentUser(user);
          setAppState("main");
        }}
        onSuccessAdmin={() => {
          setAppState("admin");
        }}
      />
    );
  }

  // 4. ADMIN DASHBOARD STAGE (Stealth Access)
  if (appState === "admin") {
    return (
      <AdminVerificationDashboard
        onLogout={() => {
          clearTokens();
          setAuthMode("login");
          setAppState("auth");
        }}
      />
    );
  }

  // 5. MAIN APP STAGE
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-stone-900 selection:bg-rose-500 selection:text-white">
      {/* Sticky Top Header (Hidden on Instagram-style notifications page) */}
      {activeTab !== "notifications" && (
        <TopHeader
          currentUser={currentUser}
          onOpenVerification={() => setIsVerificationOpen(true)}
          onOpenPreferences={() => setActiveTab("profile")}
          onToggleVerification={handleToggleVerification}
          onOpenNotifications={() => {
            setPrevTab(activeTab);
            setActiveTab("notifications");
          }}
          unreadNotificationCount={unreadNotifCount}
          activeTab={activeTab}
        />
      )}

      {/* Main Tab View */}
      <main className="mx-auto max-w-lg">
        {activeTab === "notifications" && (
          <NotificationsScreen
            onBack={() => {
              setUnreadNotifCount(0);
              setActiveTab(prevTab || "discover");
            }}
            onNotificationRead={() => {
              setUnreadNotifCount(0);
            }}
          />
        )}

        {activeTab === "discover" && (
          <DiscoverTab
            profiles={visibleSwipeProfiles}
            onSwipeLike={handleSwipeLike}
            onSwipeSkip={handleSwipeSkip}
            onSwipeSuperLike={handleSwipeSuperLike}
            onRewind={handleRewind}
            canRewind={history.length > 0}
            onReportUser={handleOpenReport}
            isVerified={currentUser.verification.isVerified}
            onOpenVerification={() => setIsVerificationOpen(true)}
          />
        )}

        {activeTab === "nearby" && (
          <NearbyTab
            students={visibleNearbyStudents}
            onSelectStudent={handleSelectNearbyStudent}
            onLikeStudent={handleLikeNearbyStudent}
            isRajaMember={isRajaMember}
            onUpgradeRaja={() => setIsRajaMember(true)}
          />
        )}

        {activeTab === "messages" && (
          <MessagesTab
            currentUser={currentUser}
            matches={matches}
            messages={messages}
            onlineUserIds={onlineUserIds}
            onSendMessage={handleSendMessage}
            onReportUser={handleOpenReport}
            onBlockUser={handleOpenBlock}
            onUnmatchMatch={(matchId) => {
              setMatches((prev) => prev.filter((m) => m.id !== matchId));
            }}
            onMarkMatchAsRead={handleMarkMatchAsRead}
            onClearChat={(matchId) => {
              setMatches((prev) =>
                prev.map((m) =>
                  m.id === matchId
                    ? { ...m, lastMessage: undefined, unread: false }
                    : m
                )
              );
            }}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            currentUser={currentUser}
            preferences={preferences}
            onUpdatePreferences={(updated) => setPreferences(updated)}
            onOpenVerification={() => setIsVerificationOpen(true)}
            onLogout={() => {
              clearTokens();
              disconnectSocket();
              setAppState("auth");
              setAuthMode("login");
            }}
          />
        )}
      </main>

      {/* Fixed Mobile Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (activeTab === "notifications") {
            setUnreadNotifCount(0);
            notificationApi.markAllAsRead().catch(() => {});
          }
          setActiveTab(tab);
        }}
        unreadCount={unreadChatCount}
      />

      {/* Modals & Popups */}
      <VerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        currentUser={currentUser}
        onSuccess={(data) => {
          setCurrentUser((prev) => ({
            ...prev,
            university: data.university || prev.university,
            verification: {
              ...prev.verification,
              email: data.email || prev.verification?.email || "",
              university: data.university || prev.verification?.university || "",
              nimMasked: data.nim ? `${data.nim.slice(0, 5)}***` : prev.verification?.nimMasked || "***",
              isVerified: !!data.isApproved,
            },
          }));
        }}
      />

      <SafetyModal
        isOpen={safetyModalState.isOpen}
        onClose={() => setSafetyModalState({ ...safetyModalState, isOpen: false })}
        targetUserId={safetyModalState.userId}
        targetUserName={safetyModalState.userName}
        mode={safetyModalState.mode}
        onSubmitReport={() => {}}
        onConfirmBlock={handleConfirmBlock}
      />

      <MatchPopup
        matchedProfile={matchedProfile}
        currentUser={currentUser}
        onClose={() => setMatchedProfile(null)}
        onOpenChat={() => setActiveTab("messages")}
      />
    </div>
  );
}
