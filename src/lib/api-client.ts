// DAPAJO Frontend API Client
// Connects Next.js FE to NestJS Backend (http://localhost:3001/api/v1)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ─── Token Management ─────────────────────────────────────────────
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dapajo_access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dapajo_refresh_token');
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('dapajo_access_token', accessToken);
  localStorage.setItem('dapajo_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('dapajo_access_token');
  localStorage.removeItem('dapajo_refresh_token');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function getCurrentUserId(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.sub || parsed.userId || null;
  } catch {
    return null;
  }
}

export function getCurrentUserRole(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.role || null;
  } catch {
    return null;
  }
}

export function getCurrentUserEmail(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.campusEmail || parsed.email || null;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getCurrentUserRole() === 'ADMIN';
}

// ─── Backend Response Envelope ─────────────────────────────────────────────
interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

// ─── HTTP Fetch Wrapper ─────────────────────────────────────────────
async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include', // send cookies for refresh_token
  });

  // Auto-refresh token on 401
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry original request with new token
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      const retryRes = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
      if (!retryRes.ok) {
        const errData = await retryRes.json().catch(() => ({}));
        const msg = errData.data?.message || errData.message || 'Request failed after token refresh';
        throw new ApiError(retryRes.status, msg);
      }
      const retryJson = await retryRes.json();
      // Unwrap backend envelope: { success, statusCode, data, timestamp }
      return (retryJson.data !== undefined ? retryJson.data : retryJson) as T;
    } else {
      clearTokens();
      throw new ApiError(401, 'Session expired. Please login again.');
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData.data?.message || errData.message || `HTTP ${res.status}`;
    throw new ApiError(res.status, msg);
  }

  const json = await res.json();
  // Unwrap backend envelope: { success, statusCode, data, timestamp }
  return (json.data !== undefined ? json.data : json) as T;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    // Unwrap backend envelope
    const data = json.data !== undefined ? json.data : json;
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ─── Error Class ─────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ═══════════════════════════════════════════════════════════════════
// API MODULES
// ═══════════════════════════════════════════════════════════════════

// ─── Auth ─────────────────────────────────────────────
export const authApi = {
  /**
   * Register new user
   * POST /auth/register
   * Body: { campusEmail, email, password, displayName }
   * Returns: { message, campusEmail, userId, mockOtp }
   */
  register: (data: {
    campusEmail: string;
    email: string;
    password: string;
    displayName: string;
    birthDate: string;
  }) => apiFetch<{
    message: string;
    campusEmail: string;
    userId: string;
    mockOtp: string;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  /**
   * Check if email is already registered
   * POST /auth/check-email
   */
  checkEmail: (email: string) =>
    apiFetch<{ available: boolean }>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  /**
   * Verify OTP
   * POST /auth/verify-otp
   * Body: { campusEmail, otpCode }
   * Returns: { message, accessToken, refreshToken }
   */
  verifyOtp: (data: { campusEmail: string; otpCode: string }) =>
    apiFetch<{
      message: string;
      accessToken: string;
      refreshToken: string;
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Login
   * POST /auth/login
   * Body: { email, password }
   * Returns: { message, user, accessToken, refreshToken }
   */
  login: (data: { email: string; password: string }) =>
    apiFetch<{
      message: string;
      user: {
        id: string;
        username?: string;
        email: string;
        campusEmail: string;
        role?: string;
        status: string;
      };
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Dedicated Admin Login
   * POST /auth/admin/login
   * Body: { username, password }
   * Returns: { message, user, accessToken, refreshToken }
   */
  adminLogin: (data: { username: string; password: string }) =>
    apiFetch<{
      message: string;
      user: {
        id: string;
        username?: string;
        email: string;
        campusEmail: string;
        role: string;
        displayName?: string;
        status: string;
      };
      accessToken: string;
      refreshToken: string;
    }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Profile ─────────────────────────────────────────────
export interface BackendProfile {
  id: string;
  userId: string;
  displayName: string;
  gender: string;
  targetGenderPreference: string;
  birthDate: string;
  universityName: string;
  major: string;
  batchYear: number;
  bio: string | null;
  voiceNoteUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  isLocationVisible: boolean;
  user: {
    id: string;
    email: string;
    campusEmail: string;
    status: string;
    verification: {
      id: string;
      status: string;
      studentNumber: string;
      verifiedAt: string | null;
    } | null;
  };
  photos: Array<{
    id: string;
    photoUrl: string;
    sortOrder: number;
    isPrimary: boolean;
    isVerified: boolean;
  }>;
}

export const profileApi = {
  /** GET /profile/me */
  getMe: () => apiFetch<BackendProfile>('/profile/me'),

  /** PATCH /profile/me */
  updateMe: (data: {
    displayName?: string;
    gender?: string;
    targetGenderPreference?: string;
    major?: string;
    batchYear?: number;
    universityName?: string;
    bio?: string;
    voiceNoteUrl?: string;
  }) => apiFetch('/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  /** PATCH /profile/location */
  updateLocation: (latitude: number, longitude: number) =>
    apiFetch('/profile/location', {
      method: 'PATCH',
      body: JSON.stringify({ latitude, longitude }),
    }),

  /** PUT /profile/photos */
  updatePhotos: (photos: string[]) =>
    apiFetch('/profile/photos', {
      method: 'PUT',
      body: JSON.stringify({ photos }),
    }),
};

// ─── Discover ─────────────────────────────────────────────
export interface DiscoverCandidate {
  id: string;
  userId: string;
  displayName: string;
  gender: string;
  universityName: string;
  major: string;
  batchYear: number;
  bio: string | null;
  voiceNoteUrl: string | null;
  photos: Array<{
    id: string;
    photoUrl: string;
    sortOrder: number;
    isPrimary: boolean;
    isVerified: boolean;
  }>;
  isVerified: boolean;
  email?: string;
  campusEmail?: string;
  distanceKm: number;
  location: { latitude: number; longitude: number };
}

export const discoverApi = {
  /** GET /discover/nearby?radiusKm=10&gender=&batchYear=&major= */
  getNearby: (params?: {
    radiusKm?: number;
    gender?: string;
    batchYear?: number;
    major?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.radiusKm) searchParams.set('radiusKm', String(params.radiusKm));
    if (params?.gender) searchParams.set('gender', params.gender);
    if (params?.batchYear) searchParams.set('batchYear', String(params.batchYear));
    if (params?.major) searchParams.set('major', params.major);

    const qs = searchParams.toString();
    return apiFetch<{
      total: number;
      candidates: DiscoverCandidate[];
    }>(`/discover/nearby${qs ? `?${qs}` : ''}`);
  },
};

// ─── Swipe ─────────────────────────────────────────────
export const swipeApi = {
  /** POST /swipes — body: { targetId, action: 'LIKE'|'PASS'|'SUPERLIKE' } */
  swipe: (targetId: string, action: 'LIKE' | 'PASS' | 'SUPERLIKE') =>
    apiFetch<{
      success: boolean;
      action: string;
      isMatch: boolean;
      remainingSwipesToday: number;
      match?: {
        id: string;
        conversationId: string;
        matchedAt: string;
        targetProfile: {
          userId: string;
          displayName: string;
          major: string;
          photoUrl: string | null;
        };
      };
    }>('/swipes', {
      method: 'POST',
      body: JSON.stringify({ targetId, action }),
    }),

  /** GET /swipes/matches */
  getMatches: () =>
    apiFetch<
      Array<{
        matchId: string;
        conversationId: string;
        matchedAt: string;
        targetUser: {
          userId: string;
          displayName: string;
          major: string;
          photoUrl: string | null;
        };
        lastMessage: {
          id?: string;
          content: string;
          createdAt: string;
          senderId: string;
          readAt?: string | null;
        } | null;
      }>
    >('/swipes/matches'),
};

// ─── Chat ─────────────────────────────────────────────
export const chatApi = {
  /** GET /chat/conversations */
  getConversations: () => apiFetch<unknown[]>('/chat/conversations'),

  /** GET /chat/conversations/:id/messages?page=1&limit=50 */
  getMessages: (conversationId: string, page = 1, limit = 50) =>
    apiFetch<{
      conversationId: string;
      page: number;
      limit: number;
      messages: Array<{
        id: string;
        conversationId: string;
        senderId: string;
        content: string;
        type: string;
        mediaUrl?: string | null;
        createdAt: string;
      }>;
    } | Array<{
      id: string;
      conversationId: string;
      senderId: string;
      content: string;
      type: string;
      mediaUrl?: string | null;
      createdAt: string;
    }>>(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`),

  /** POST /chat/send */
  sendMessage: (conversationId: string, content: string, type = 'TEXT') =>
    apiFetch('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content, type }),
    }),

  /** POST /chat/conversations/:id/read */
  markAsRead: (conversationId: string) =>
    apiFetch(`/chat/conversations/${conversationId}/read`, {
      method: 'POST',
    }),

  /** GET /chat/online-users */
  getOnlineUsers: () =>
    apiFetch<{ onlineUserIds: string[] }>('/chat/online-users'),

  /** DELETE /chat/messages/:id */
  deleteMessage: (messageId: string) =>
    apiFetch<{ success: boolean; messageId: string }>(`/chat/messages/${messageId}`, {
      method: 'DELETE',
    }),

  /** DELETE /chat/conversations/:id/messages */
  clearConversation: (conversationId: string) =>
    apiFetch<{ success: boolean; message?: string }>(`/chat/conversations/${conversationId}/messages`, {
      method: 'DELETE',
    }),
};

// ─── Verification ─────────────────────────────────────────────
export interface VerificationSubmission {
  id: string;
  userId: string;
  studentNumber: string;
  ktmImageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verifiedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    campusEmail: string;
    role: string;
    status: string;
    profile: {
      displayName: string;
      universityName: string;
      major: string;
      batchYear: number;
      photos: Array<{ photoUrl: string }>;
    } | null;
  };
}

export interface AdminUser {
  id: string;
  username: string | null;
  email: string;
  campusEmail: string;
  phoneNumber: string | null;
  role: 'USER' | 'ADMIN';
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  verificationStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'UNVERIFIED';
  profile: {
    displayName: string;
    universityName: string;
    major: string;
    batchYear?: number;
    photos?: Array<{ photoUrl: string }>;
  } | null;
  verification: {
    id: string;
    studentNumber: string;
    ktmImageUrl: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    verifiedAt: string | null;
    rejectionReason: string | null;
    createdAt: string;
  } | null;
}

export const verificationApi = {
  /** POST /verification/ktm */
  submitKtm: (data: {
    studentNumber: string;
    ktmImageUrl: string;
    fullName?: string;
    universityName?: string;
    major?: string;
  }) =>
    apiFetch<VerificationSubmission>('/verification/ktm', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** GET /verification/status */
  getStatus: () =>
    apiFetch<{
      id?: string;
      status: 'UNSUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
      studentNumber?: string;
      ktmImageUrl?: string;
      rejectionReason?: string;
      verifiedAt?: string;
      user?: {
        profile?: {
          displayName?: string;
          universityName?: string;
          major?: string;
        };
      };
    }>('/verification/status'),

  /** GET /verification/admin/list?status=... */
  getAdminList: (status?: string) =>
    apiFetch<VerificationSubmission[]>(
      `/verification/admin/list${status && status !== 'ALL' ? `?status=${status}` : ''}`
    ),

  /** GET /verification/admin/users?status=...&search=... */
  getAdminUsers: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.set('status', status);
    if (search && search.trim()) params.set('search', search.trim());
    const qs = params.toString();
    return apiFetch<AdminUser[]>(`/verification/admin/users${qs ? `?${qs}` : ''}`);
  },

  /** PATCH /verification/admin/users/:userId/toggle-verify */
  toggleManualVerify: (userId: string, isApproved: boolean) =>
    apiFetch<AdminUser[]>(`/verification/admin/users/${userId}/toggle-verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved }),
    }),

  /** PATCH /verification/:id/review */
  review: (id: string, isApproved: boolean, rejectionReason?: string) =>
    apiFetch<VerificationSubmission>(`/verification/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved, rejectionReason }),
    }),
};

// ─── Safety ─────────────────────────────────────────────
export const safetyApi = {
  /** POST /safety/block */
  blockUser: (targetUserId: string) =>
    apiFetch('/safety/block', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    }),

  /** POST /safety/report */
  reportUser: (data: {
    reportedUserId: string;
    reason: string;
    description?: string;
    evidencePhotoUrl?: string;
  }) =>
    apiFetch('/safety/report', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Notifications ─────────────────────────────────────────────
export interface AppNotification {
  id: string;
  messageId: string;
  title: string;
  content: string;
  type: 'ANNOUNCEMENT' | 'SYSTEM' | 'WARNING' | 'INFO';
  targetType: 'ALL' | 'SPECIFIC';
  targetName: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminBroadcastMessage {
  id: string;
  title: string;
  content: string;
  type: string;
  targetType: string;
  targetUserId: string | null;
  targetName: string;
  recipientsCount: number;
  createdAt: string;
}

export const notificationApi = {
  /** GET /notifications */
  getAll: () => apiFetch<AppNotification[]>('/notifications'),

  /** GET /notifications/unread-count */
  getUnreadCount: () => apiFetch<{ unreadCount: number }>('/notifications/unread-count'),

  /** PATCH /notifications/:id/read */
  markAsRead: (id: string) =>
    apiFetch<{ id: string; isRead: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  /** PATCH /notifications/read-all */
  markAllAsRead: () =>
    apiFetch<{ message: string }>('/notifications/read-all', {
      method: 'PATCH',
    }),

  /** POST /notifications/admin/broadcast */
  createBroadcast: (data: {
    title: string;
    content: string;
    type?: string;
    targetType?: string;
    targetUserId?: string;
  }) =>
    apiFetch<AdminBroadcastMessage>('/notifications/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** GET /notifications/admin/history */
  getAdminHistory: () => apiFetch<AdminBroadcastMessage[]>('/notifications/admin/history'),

  /** DELETE /notifications/admin/:id */
  deleteBroadcast: (id: string) =>
    apiFetch<{ message: string }>(`/notifications/admin/${id}`, {
      method: 'DELETE',
    }),
};

