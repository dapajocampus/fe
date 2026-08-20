"use client";

import React, { useState } from "react";
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

import {
  CURRENT_USER,
  INITIAL_PREFERENCES,
  MOCK_SWIPE_PROFILES,
  MOCK_NEARBY_STUDENTS,
  MOCK_MATCHES,
  MOCK_MESSAGES_CLARA,
} from "@/lib/mock-data";
import { SwipeProfile, UserPreferences, MatchItem, ChatMessage, UserProfile, NearbyStudent } from "@/lib/types";

export default function Home() {
  // Application Lifecycle State: 'splash' | 'onboarding' | 'auth' | 'main'
  const [appState, setAppState] = useState<"splash" | "onboarding" | "auth" | "main">("splash");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  // Main App State
  const [activeTab, setActiveTab] = useState("discover");
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [preferences, setPreferences] = useState<UserPreferences>(INITIAL_PREFERENCES);
  const [isRajaMember, setIsRajaMember] = useState(false);

  // Swipe State
  const [swipeProfiles, setSwipeProfiles] = useState<SwipeProfile[]>(MOCK_SWIPE_PROFILES);
  const [history, setHistory] = useState<SwipeProfile[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<SwipeProfile | null>(null);

  // Matches & Chat State
  const [matches, setMatches] = useState<MatchItem[]>(MOCK_MATCHES);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES_CLARA);

  // Modals
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
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

  // Swipe Handlers
  const handleSwipeLike = (profile: SwipeProfile) => {
    setHistory((prev) => [...prev, profile]);

    // Trigger mutual match for Clara Vania or Nabila Saraswati for demonstration
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
  };

  const handleSwipeSkip = (profile: SwipeProfile) => {
    setHistory((prev) => [...prev, profile]);
  };

  const handleSwipeSuperLike = (profile: SwipeProfile) => {
    handleSwipeLike(profile);
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setSwipeProfiles((prev) => [last, ...prev]);
  };

  // Chat message send
  const handleSendMessage = (matchId: string, content: string, type: "text" | "voice_note" | "video_note") => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              lastMessage: type === "voice_note" ? "Voice note (0:12)" : type === "video_note" ? "Video note (0:08)" : content,
              lastMessageTime: "Baru saja",
              unread: false,
            }
          : m
      )
    );
  };

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
    }
  };

  // 1. SPLASH SCREEN STAGE
  if (appState === "splash") {
    return <SplashScreen onComplete={() => setAppState("onboarding")} />;
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
      />
    );
  }

  const handleToggleVerification = () => {
    setCurrentUser((prev) => ({
      ...prev,
      verification: {
        ...prev.verification,
        isVerified: !prev.verification.isVerified,
      },
    }));
  };

  // 4. MAIN APP STAGE
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-stone-900 selection:bg-rose-500 selection:text-white">
      {/* Sticky Top Header */}
      <TopHeader
        currentUser={currentUser}
        onOpenVerification={() => setIsVerificationOpen(true)}
        onOpenPreferences={() => setActiveTab("profile")}
        onToggleVerification={handleToggleVerification}
        activeTab={activeTab}
      />

      {/* Main Tab View */}
      <main className="mx-auto max-w-lg">
        {activeTab === "discover" && (
          <DiscoverTab
            profiles={swipeProfiles}
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
            students={MOCK_NEARBY_STUDENTS}
            onSelectStudent={handleSelectNearbyStudent}
            onLikeStudent={handleLikeNearbyStudent}
            isRajaMember={isRajaMember}
            onUpgradeRaja={() => setIsRajaMember(true)}
          />
        )}

        {activeTab === "messages" && (
          <MessagesTab
            matches={matches}
            messages={messages}
            onSendMessage={handleSendMessage}
            onReportUser={handleOpenReport}
            onBlockUser={handleOpenBlock}
            onUnmatchMatch={(matchId) => {
              setMatches((prev) => prev.filter((m) => m.id !== matchId));
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
              setAppState("auth");
              setAuthMode("login");
            }}
          />
        )}
      </main>

      {/* Fixed Mobile Bottom Nav */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} unreadCount={1} />

      {/* Modals & Popups */}
      <VerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        onSuccess={(data) => {
          setCurrentUser((prev) => ({
            ...prev,
            university: data.university,
            verification: {
              ...prev.verification,
              email: data.email,
              university: data.university,
              nimMasked: data.nim,
              isVerified: true,
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
