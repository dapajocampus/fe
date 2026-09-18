import { SwipeProfile, NearbyStudent, MatchItem, ChatMessage, UserProfile, UserPreferences } from "./types";

// Reliable SVG Avatar Generator Data URIs
export const getStudentAvatar = (name: string, gender: "pria" | "wanita", bgFrom: string, bgTo: string, shirtColor: string) => {
  const isFemale = gender === "wanita";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-${name.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgFrom}"/>
        <stop offset="100%" stop-color="${bgTo}"/>
      </linearGradient>
    </defs>
    <!-- Background Card -->
    <rect width="400" height="500" fill="url(#grad-${name.replace(/\s+/g, '')})"/>
    
    <!-- Decorative Circle Aura -->
    <circle cx="200" cy="210" r="130" fill="#ffffff" opacity="0.15"/>
    <circle cx="200" cy="210" r="95" fill="#ffffff" opacity="0.2"/>

    <!-- Clothes Body -->
    <path d="M 80 500 C 80 370, 120 320, 200 320 C 280 320, 320 370, 320 500 Z" fill="${shirtColor}"/>
    <!-- Collar -->
    <path d="M 160 320 L 200 360 L 240 320 Z" fill="#ffffff" opacity="0.9"/>

    <!-- Neck -->
    <rect x="175" y="250" width="50" height="80" rx="10" fill="#fcd34d"/>

    <!-- Head & Face -->
    <circle cx="200" cy="210" r="75" fill="#fde047"/>
    
    <!-- Hair style -->
    ${
      isFemale
        ? `<path d="M 120 200 C 120 90, 280 90, 280 200 C 295 240, 280 310, 265 310 C 255 250, 250 140, 200 135 C 150 140, 145 250, 135 310 C 120 310, 105 240, 120 200 Z" fill="#1e293b"/>
           <path d="M 140 180 C 170 140, 230 140, 260 180 C 240 160, 160 160, 140 180 Z" fill="#334155"/>`
        : `<path d="M 125 200 C 125 110, 275 110, 275 200 C 275 160, 250 130, 200 130 C 150 130, 125 160, 125 200 Z" fill="#0f172a"/>
           <path d="M 135 170 Q 200 110 265 170 Q 200 135 135 170 Z" fill="#1e293b"/>`
    }

    <!-- Eyes -->
    <circle cx="175" cy="210" r="7" fill="#0f172a"/>
    <circle cx="225" cy="210" r="7" fill="#0f172a"/>
    <circle cx="173" cy="208" r="2.5" fill="#ffffff"/>
    <circle cx="223" cy="208" r="2.5" fill="#ffffff"/>

    <!-- Eyebrows -->
    <path d="M 165 195 Q 175 190 185 195" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M 215 195 Q 225 190 235 195" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none"/>

    <!-- Cheeks Blush -->
    <circle cx="160" cy="225" r="10" fill="#f43f5e" opacity="0.3"/>
    <circle cx="240" cy="225" r="10" fill="#f43f5e" opacity="0.3"/>

    <!-- Smile -->
    <path d="M 180 235 Q 200 255 220 235" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none"/>

  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const CURRENT_USER: UserProfile = {
  id: "user-me",
  name: "Rizky Ramadhan",
  age: 21,
  gender: "pria",
  university: "Universitas Gadjah Mada (UGM)",
  major: "Teknologi Informasi",
  semester: 6,
  bio: "Suka ngoding Next.js & React Native di kafe jam 2 malam ☕ Tech enthusiast, main badminton di UGM, & dengerin indie pop.",
  photos: [
    getStudentAvatar("Rizky Ramadhan", "pria", "#4f46e5", "#4338ca", "#312e81"),
    getStudentAvatar("Rizky Ramadhan", "pria", "#3b82f6", "#1d4ed8", "#1e40af"),
  ],
  interests: ["Coding", "Indie Music", "Coffee", "Badminton", "UI/UX Design", "Anime"],
  verification: {
    isVerified: true,
    email: "rizky.r@mail.ugm.ac.id",
    university: "Universitas Gadjah Mada (UGM)",
    major: "Teknologi Informasi",
    nimMasked: "21/478291/TK/52109",
    verifiedAt: "12 Feb 2026",
  },
  locationName: "Sleman, Yogyakarta",
  distanceKm: 0,
  activityStatus: "Aktif 5 menit lalu",
  instagramHandle: "@rizky.dev",
};

export const INITIAL_PREFERENCES: UserPreferences = {
  ageRange: [18, 25],
  preferredGender: "semua",
  maxDistanceKm: 20,
  sameUniversityOnly: false,
  sameMajorOnly: false,
};

export const MOCK_SWIPE_PROFILES: SwipeProfile[] = [
  {
    id: "prof-1",
    name: "Nabila Saraswati",
    age: 20,
    gender: "wanita",
    university: "Universitas Gadjah Mada (UGM)",
    major: "Ilmu Komunikasi",
    semester: 4,
    bio: "Suka bikin podcast seputar kehidupan mahasiswa kampus & hunting spot kopi enak di Jogja. Cari temen main badminton atau ngopi sore ✨",
    photos: [
      getStudentAvatar("Nabila Saraswati", "wanita", "#f43f5e", "#e11d48", "#be123c"),
      getStudentAvatar("Nabila Saraswati", "wanita", "#ec4899", "#db2777", "#be185d"),
    ],
    interests: ["Coffee", "Indie Music", "Podcast", "Badminton", "Photography"],
    commonInterests: ["Coffee", "Indie Music", "Badminton"],
    verification: {
      isVerified: true,
      email: "nabila.s@mail.ugm.ac.id",
      university: "Universitas Gadjah Mada (UGM)",
      major: "Ilmu Komunikasi",
      nimMasked: "22/491028/SP/30291",
    },
    locationName: "Kawasan Bulaksumur, Sleman",
    distanceKm: 1.2,
    activityStatus: "Aktif sekarang",
    compatibility: {
      totalScore: 94,
      breakdown: { interest: 28, university: 20, major: 12, age: 15, location: 10, activity: 9 },
    },
  },
  {
    id: "prof-2",
    name: "Alya Putri",
    age: 21,
    gender: "wanita",
    university: "Universitas Indonesia (UI)",
    major: "Sistem Informasi",
    semester: 6,
    bio: "Fullstack dev in the making 💻 | Suka Valorant, Figma design, & k-pop. Kalo mutual match yuk bareng mabar / bikin project bareng!",
    photos: [
      getStudentAvatar("Alya Putri", "wanita", "#8b5cf6", "#7c3aed", "#6d28d9"),
      getStudentAvatar("Alya Putri", "wanita", "#a855f7", "#9333ea", "#7e22ce"),
    ],
    interests: ["Coding", "UI/UX Design", "Gaming", "K-Pop", "Anime"],
    commonInterests: ["Coding", "UI/UX Design", "Anime"],
    verification: {
      isVerified: true,
      email: "alya.putri@ui.ac.id",
      university: "Universitas Indonesia (UI)",
      major: "Sistem Informasi",
      nimMasked: "2106712391",
    },
    locationName: "Depok / Sleman Area",
    distanceKm: 3.5,
    activityStatus: "Aktif 15 menit lalu",
    compatibility: {
      totalScore: 89,
      breakdown: { interest: 29, university: 10, major: 15, age: 15, location: 10, activity: 10 },
    },
  },
  {
    id: "prof-3",
    name: "Danish Azka",
    age: 22,
    gender: "pria",
    university: "Institut Teknologi Bandung (ITB)",
    major: "Teknik Informatika",
    semester: 8,
    bio: "Lagi pusing ngerjain skripsi AI/ML. Suka lari pagi di Ganesha, ngopi hitam tanpa gula, & nonton konser musik indie lokal.",
    photos: [
      getStudentAvatar("Danish Azka", "pria", "#0284c7", "#0369a1", "#075985"),
      getStudentAvatar("Danish Azka", "pria", "#06b6d4", "#0891b2", "#0e7490"),
    ],
    interests: ["Coding", "Running", "Coffee", "Indie Music"],
    commonInterests: ["Coding", "Coffee", "Indie Music"],
    verification: {
      isVerified: true,
      email: "danish@std.stei.itb.ac.id",
      university: "Institut Teknologi Bandung (ITB)",
      major: "Teknik Informatika",
      nimMasked: "13520999",
    },
    locationName: "Bandung / Yogyakarta Area",
    distanceKm: 5.0,
    activityStatus: "Aktif 1 jam lalu",
    compatibility: {
      totalScore: 82,
      breakdown: { interest: 25, university: 10, major: 15, age: 12, location: 10, activity: 10 },
    },
  },
  {
    id: "prof-4",
    name: "Tania Maharani",
    age: 20,
    gender: "wanita",
    university: "Universitas Negeri Yogyakarta (UNY)",
    major: "Pendidikan Bahasa Inggris",
    semester: 4,
    bio: "Lover of vintage cameras 📷, thrifted clothes, & acoustic guitars. Let's exchange Spotify playlists & talk about indie movies!",
    photos: [
      getStudentAvatar("Tania Maharani", "wanita", "#d97706", "#b45309", "#92400e"),
      getStudentAvatar("Tania Maharani", "wanita", "#f59e0b", "#d97706", "#b45309"),
    ],
    interests: ["Photography", "Indie Music", "Coffee", "Art", "Travel"],
    commonInterests: ["Indie Music", "Coffee"],
    verification: {
      isVerified: true,
      email: "tania.m@student.uny.ac.id",
      university: "Universitas Negeri Yogyakarta (UNY)",
      major: "Pendidikan Bahasa Inggris",
      nimMasked: "22201241092",
    },
    locationName: "Gejayan, Yogyakarta",
    distanceKm: 2.1,
    activityStatus: "Aktif 30 menit lalu",
    compatibility: {
      totalScore: 86,
      breakdown: { interest: 22, university: 15, major: 10, age: 15, location: 10, activity: 14 },
    },
  },
  {
    id: "prof-5",
    name: "Clara Vania",
    age: 21,
    gender: "wanita",
    university: "Universitas Amikom Yogyakarta",
    major: "Informatika (AMCC)",
    semester: 6,
    bio: "Pengurus divisi UI/UX AMCC 🎨 | Web developer & mobile app enthusiast. Suka kulineran malam & nugas santai di Kaliurang.",
    photos: [
      getStudentAvatar("Clara Vania", "wanita", "#059669", "#047857", "#065f46"),
      getStudentAvatar("Clara Vania", "wanita", "#10b981", "#059669", "#047857"),
    ],
    interests: ["Coding", "UI/UX Design", "Culinary", "Anime", "Badminton"],
    commonInterests: ["Coding", "UI/UX Design", "Anime", "Badminton"],
    verification: {
      isVerified: true,
      email: "clara.v@students.amikom.ac.id",
      university: "Universitas Amikom Yogyakarta",
      major: "Informatika",
      nimMasked: "21.11.4192",
    },
    locationName: "Ring Road Utara, Condongcatur",
    distanceKm: 0.8,
    activityStatus: "Aktif sekarang",
    compatibility: {
      totalScore: 97,
      breakdown: { interest: 30, university: 18, major: 15, age: 15, location: 10, activity: 9 },
    },
  },
  {
    id: "prof-6",
    name: "Siti Nurhaliza",
    age: 21,
    gender: "wanita",
    university: "Universitas Airlangga (UNAIR)",
    major: "Kedokteran Gigi",
    semester: 6,
    bio: "Mahasiswi FKG yang hobi foto estetik, dengerin jazz, & traveling. Nyari temen nugas & kulineran lokal 🍰",
    photos: [
      getStudentAvatar("Siti Nurhaliza", "wanita", "#e11d48", "#be123c", "#9f1239"),
    ],
    interests: ["Photography", "Culinary", "Coffee", "Travel", "Indie Music"],
    commonInterests: ["Coffee", "Indie Music"],
    verification: {
      isVerified: true,
      email: "siti.n@fkg.unair.ac.id",
      university: "Universitas Airlangga (UNAIR)",
      major: "Kedokteran Gigi",
      nimMasked: "021911133091",
    },
    locationName: "Surabaya / Yogyakarta",
    distanceKm: 4.2,
    activityStatus: "Aktif 1 jam lalu",
    compatibility: {
      totalScore: 88,
      breakdown: { interest: 25, university: 15, major: 10, age: 15, location: 10, activity: 13 },
    },
  },
];

export const MOCK_NEARBY_STUDENTS: NearbyStudent[] = [
  {
    ...MOCK_SWIPE_PROFILES[4], // Clara Vania
    distanceApproxKm: 0.8,
    privacySetting: "approximate",
    campusArea: "Area Kampus Amikom & UPN",
    isOnline: true,
  },
  {
    ...MOCK_SWIPE_PROFILES[0], // Nabila Saraswati
    distanceApproxKm: 1.2,
    privacySetting: "approximate",
    campusArea: "Kawasan Perpustakaan UGM",
    isOnline: true,
  },
  {
    ...MOCK_SWIPE_PROFILES[3], // Tania Maharani
    distanceApproxKm: 2.1,
    privacySetting: "approximate",
    campusArea: "Area Fakultas Bahasa UNY",
    isOnline: false,
  },
  {
    id: "prof-7",
    name: "Farhan Mahendra",
    age: 22,
    gender: "pria",
    university: "Universitas Gadjah Mada (UGM)",
    major: "Manajemen FEB",
    semester: 8,
    bio: "Business plan competitor & esports fans. Selalu open buat diskusi project startups atau sekedar mabar Mobile Legends.",
    photos: [getStudentAvatar("Farhan Mahendra", "pria", "#475569", "#334155", "#1e293b")],
    interests: ["Gaming", "Business", "Coffee", "Badminton"],
    verification: {
      isVerified: true,
      email: "farhan.m@mail.ugm.ac.id",
      university: "Universitas Gadjah Mada (UGM)",
      major: "Manajemen",
      nimMasked: "20/456102/EK/23101",
    },
    locationName: "Sekip, UGM",
    distanceKm: 1.5,
    activityStatus: "Aktif 10 menit lalu",
    distanceApproxKm: 1.5,
    privacySetting: "approximate",
    campusArea: "Kawasan FEB UGM",
    isOnline: true,
  },
  {
    id: "prof-8",
    name: "Jessica Anggraini",
    age: 19,
    gender: "wanita",
    university: "Universitas Atma Jaya Yogyakarta",
    major: "Arsitektur",
    semester: 2,
    bio: "Suka sketsa bangunan kuno, photography, & matcha latte 🍵. Mahasiswi tingkat 1 pencari spot nugas estetik.",
    photos: [getStudentAvatar("Jessica Anggraini", "wanita", "#ca8a04", "#a16207", "#854d0e")],
    interests: ["Art", "Photography", "Coffee", "Anime"],
    verification: {
      isVerified: true,
      email: "jessica@students.uajy.ac.id",
      university: "Universitas Atma Jaya Yogyakarta",
      major: "Arsitektur",
      nimMasked: "230114920",
    },
    locationName: "Babarsari, Sleman",
    distanceKm: 2.8,
    activityStatus: "Aktif 2 jam lalu",
    distanceApproxKm: 2.8,
    privacySetting: "city_only",
    campusArea: "Yogyakarta City Area",
    isOnline: false,
  },
];

export const MOCK_MATCHES: MatchItem[] = [
  {
    id: "match-1",
    user: MOCK_SWIPE_PROFILES[4], // Clara Vania
    matchedAt: "Hari ini, 14:10",
    unread: true,
    lastMessage: "Voice note (0:18)",
    lastMessageTime: "14:22",
  },
  {
    id: "match-2",
    user: MOCK_SWIPE_PROFILES[0], // Nabila Saraswati
    matchedAt: "Kemarin, 19:45",
    unread: false,
    lastMessage: "Wah seru banget! Sabtu ini yuk ngopi di Tilam Kopi ☕",
    lastMessageTime: "Kemarin",
  },
  {
    id: "match-3",
    user: MOCK_SWIPE_PROFILES[1], // Alya Putri
    matchedAt: "10 Feb 2026",
    unread: false,
    lastMessage: "Video note diterima 📹",
    lastMessageTime: "10 Feb",
  },
];

export const MOCK_MESSAGES_CLARA: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "user-me",
    type: "text",
    content: "Halo Clara! Salam kenal ya, sama-sama anak IT nih 🎉 Nemu profil kamu pas swipe di DAPAJO CAMPUS.",
    timestamp: "14:15",
    status: "read",
  },
  {
    id: "msg-2",
    senderId: "prof-5",
    type: "text",
    content: "Halo Rizky! Wah iyaa, UGM sama Amikom lumayan deket nih. Suka ngoding React & Tailwind juga ya?",
    timestamp: "14:18",
    status: "read",
  },
  {
    id: "msg-3",
    senderId: "user-me",
    type: "text",
    content: "Iya nih lagi bikin project Next.js buat PWA. Btw kamu sering nugas di cafe mana di area Condongcatur?",
    timestamp: "14:20",
    status: "read",
  },
  {
    id: "msg-4",
    senderId: "prof-5",
    type: "voice_note",
    audioDurationSec: 18,
    content: "Aku biasanya nugas di cafe dekat Ringroad utara, wifinya kenceng dan colokan banyak. Nanti tak kirim lokasinya ya!",
    timestamp: "14:22",
    status: "read",
  },
  {
    id: "msg-5",
    senderId: "prof-5",
    type: "video_note",
    videoThumbnailUrl: getStudentAvatar("Clara Vania", "wanita", "#059669", "#047857", "#065f46"),
    content: "Mini video note dari suasana kafe favorit sore ini ☕✨",
    timestamp: "14:23",
    status: "read",
  },
];

export const ALL_INTEREST_OPTIONS = [
  "Coding",
  "UI/UX Design",
  "Coffee",
  "Indie Music",
  "Badminton",
  "Anime",
  "Gaming",
  "Photography",
  "Podcast",
  "Culinary",
  "K-Pop",
  "Running",
  "Art",
  "Travel",
  "Business",
];

export const ALL_UNIVERSITIES = [
  "Universitas Gadjah Mada (UGM)",
  "Universitas Indonesia (UI)",
  "Institut Teknologi Bandung (ITB)",
  "Universitas Negeri Yogyakarta (UNY)",
  "Universitas Amikom Yogyakarta",
  "Universitas Atma Jaya Yogyakarta",
  "Universitas Diponegoro (UNDIP)",
  "Universitas Airlangga (UNAIR)",
  "Universitas Brawijaya (UB)",
];
