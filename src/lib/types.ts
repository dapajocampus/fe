export type Gender = "pria" | "wanita" | "lainnya";

export interface StudentVerification {
  isVerified: boolean;
  email: string;
  university: string;
  major: string;
  nimMasked: string;
  verifiedAt?: string;
  ktmImageUrl?: string;
}

export interface CompatibilityScore {
  totalScore: number; // e.g. 92%
  breakdown: {
    interest: number; // max 30%
    university: number; // max 20%
    major: number; // max 15%
    age: number; // max 15%
    location: number; // max 10%
    activity: number; // max 10%
  };
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  university: string;
  major: string;
  semester: number;
  bio: string;
  photos: string[];
  interests: string[];
  verification: StudentVerification;
  locationName: string;
  distanceKm: number;
  activityStatus: string;
  instagramHandle?: string;
  spotifyPlaylist?: string;
}

export interface SwipeProfile extends UserProfile {
  compatibility: CompatibilityScore;
  commonInterests: string[];
  superLiked?: boolean;
}

export interface NearbyStudent extends UserProfile {
  distanceApproxKm: number;
  privacySetting: "approximate" | "city_only" | "hidden";
  campusArea: string;
  isOnline: boolean;
}

export interface MatchItem {
  id: string;
  conversationId?: string;
  user: UserProfile;
  matchedAt: string;
  unread: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
}

export type MessageType = "text" | "voice_note" | "video_note" | "image";

export interface ChatMessage {
  id: string;
  senderId: string;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  audioDurationSec?: number; // for voice note
  videoThumbnailUrl?: string; // for video note
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

export interface SafetyReport {
  targetUserId: string;
  category: "fake_account" | "harassment" | "scam" | "inappropriate_content" | "other";
  description: string;
}

export interface UserPreferences {
  ageRange: [number, number];
  preferredGender: "semua" | "pria" | "wanita";
  maxDistanceKm: number;
  sameUniversityOnly: boolean;
  sameMajorOnly: boolean;
}
