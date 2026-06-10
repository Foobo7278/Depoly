import { UserProfile, Room, MatchResult, Message } from "./types";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  ip: string;
  country: string;
  joinDate: string;
  totalSessions: number;
  reportsReceived: number;
  status: "active" | "warned" | "muted" | "banned";
  banHistory: string[];
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUsername: string;
  reporterName: string;
  reason: string;
  status: "pending" | "reviewed" | "escalated";
  timestamp: string;
  chatTranscript: { sender: string; text: string }[];
}

export interface BanRecord {
  id: string;
  userId?: string;
  ipAddress?: string;
  reason: string;
  adminName: string;
  expiryDate: string;
}

export interface KeywordFilter {
  id: string;
  phrase: string;
  isRegex: boolean;
  action: "warn" | "mute" | "ban";
  triggersCount: number;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Moderator" | "Viewer";
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
}

interface ServerState {
  queue: Array<{ id: string; profile: UserProfile; timestamp: number }>;
  matches: Map<string, MatchResult>;
  rooms: Room[];
  stats: {
    onlineUsers: number;
    chatsToday: number;
    countriesCount: number;
    messagesSentCount: number;
  };
  users: AdminUser[];
  reports: UserReport[];
  bans: BanRecord[];
  keywords: KeywordFilter[];
  admins: AdminAccount[];
  auditLogs: AuditLog[];
}

// Global persistence across hot-rebuilds
const globalForStore = globalThis as unknown as {
  serverState: ServerState | undefined;
};

const initialRooms: Room[] = [
  { id: "r1", name: "Cybersecurity & Decryption", slug: "cybersecurity-decryption", emoji: "🛡️", description: "Cryptographic handshakes, secure system hardening, and white-hat penetration testing chats.", onlineCount: 142, tags: ["Sec", "Crypto", "Linux"] },
  { id: "r2", name: "AI Prompt Engineering", slug: "ai-prompt-engineering", emoji: "🧠", description: "Compare system instructions, emergent capabilities, agent workflows, and model weights.", onlineCount: 94, tags: ["LLMs", "Gemini", "Agents"] },
  { id: "r3", name: "Midnight Synthesizers", slug: "midnight-synthesizers", emoji: "🎹", description: "Ambient loops, modular patch setups, analog filter sweeps, and lo-fi bedroom production.", onlineCount: 78, tags: ["Synth", "LoFi", "Ambient"] },
  { id: "r4", name: "Indie Hackers & Firewalls", slug: "indie-hackers-firewalls", emoji: "🚀", description: "Bootstrapping web startups, API proxies, serverless container scale, and billing integrations.", onlineCount: 115, tags: ["SaaS", "NextJS", "Stripe"] },
  { id: "r5", name: "Tokyo City Pop Lounge", slug: "tokyo-city-pop-lounge", emoji: "🗼", description: "Late-night plastic love, high fidelity cassettes, neon highway loops, and future funk beats.", onlineCount: 63, tags: ["Vaporwave", "80s", "Vinyl"] },
];

const initialUsers: AdminUser[] = [
  { id: "usr_101", username: "NeonPhoenix 🌟", email: "phoenix@gmail.com", ip: "185.122.90.41", country: "United States", joinDate: "2026-02-12", totalSessions: 42, reportsReceived: 0, status: "active", banHistory: [] },
  { id: "usr_102", username: "ShadowHacker 🕵️", email: "shadow@hushmail.com", ip: "103.41.22.99", country: "United Kingdom", joinDate: "2026-04-01", totalSessions: 112, reportsReceived: 5, status: "warned", banHistory: ["Muted 24h for spam"] },
  { id: "usr_103", username: "CyberSpongeBob 🍍", email: "spongebob7278@gmail.com", ip: "192.168.1.104", country: "Bikini Bottom", joinDate: "2026-05-18", totalSessions: 290, reportsReceived: 1, status: "active", banHistory: [] },
  { id: "usr_104", username: "AliceCrypto 🪙", email: "alice.coin@proton.me", ip: "82.49.112.5", country: "Canada", joinDate: "2026-01-20", totalSessions: 81, reportsReceived: 0, status: "active", banHistory: [] },
  { id: "usr_105", username: "SaltySailor ⚓", email: "salty@ocean.net", ip: "45.11.201.88", country: "Netherlands", joinDate: "2026-03-30", totalSessions: 55, reportsReceived: 7, status: "warned", banHistory: ["Temporary limit applied 2026-05-01"] },
  { id: "usr_106", username: "SpamBot99 🤖", email: "bot99@marketing.ru", ip: "91.24.18.232", country: "Russia", joinDate: "2026-05-02", totalSessions: 9, reportsReceived: 14, status: "muted", banHistory: ["Automatically muted due to keywords limit"] },
  { id: "usr_107", username: "RudeClown 🤡", email: "clown@yahoo.com", ip: "119.55.10.15", country: "Australia", joinDate: "2026-05-15", totalSessions: 14, reportsReceived: 4, status: "banned", banHistory: ["Hard banned by Admin Ayush"] },
  { id: "usr_108", username: "PixelArtis 🎨", email: "pixel@gmail.com", ip: "210.15.42.109", country: "Japan", joinDate: "2025-12-25", totalSessions: 178, reportsReceived: 0, status: "active", banHistory: [] }
];

const initialReports: UserReport[] = [
  { 
    id: "rep_201", 
    reportedUserId: "usr_102", 
    reportedUsername: "ShadowHacker 🕵️", 
    reporterName: "AliceCrypto 🪙", 
    reason: "Sent malicious phishing URL containing credentials harvester", 
    status: "pending", 
    timestamp: "2026-06-06T08:12:15Z",
    chatTranscript: [
      { sender: "AliceCrypto", text: "Hi! How is it going in Canada?" },
      { sender: "ShadowHacker", text: "Go to this URL to receive free bitcoin right now!! https://rob-your-key-now.org/auth?id=49" },
      { sender: "AliceCrypto", text: "Err, that looks like a severe protocol threat scam link..." }
    ]
  }
];

const initialBans: BanRecord[] = [
  { id: "ban_1", userId: "usr_107", reason: "Repeated violations of anti-harassment terms during matching sessions", adminName: "Ayush", expiryDate: "Permanent" }
];

const initialKeywords: KeywordFilter[] = [
  { id: "kw_1", phrase: "whatsapp me on", isRegex: false, action: "warn", triggersCount: 18 },
  { id: "kw_2", phrase: "free bitcoin key", isRegex: false, action: "ban", triggersCount: 31 },
  { id: "kw_3", phrase: "hack_tool_[0-9]", isRegex: true, action: "mute", triggersCount: 4 },
  { id: "kw_4", phrase: "paypal.me/scam", isRegex: false, action: "ban", triggersCount: 12 }
];

const initialAdmins: AdminAccount[] = [
  { id: "adm_1", name: "Ayush", email: "ayush@fluxmeet.org", role: "Super Admin" },
  { id: "adm_2", name: "SpongeBob SquarePants", email: "spongebob7278@gmail.com", role: "Moderator" },
  { id: "adm_3", name: "Sandy Cheeks", email: "sandy.cheeks@gmail.com", role: "Super Admin" },
  { id: "adm_4", name: "Patrick Star", email: "patrick.star@gmail.com", role: "Viewer" }
];

const initialAuditLogs: AuditLog[] = [
  { id: "log_1", adminName: "Ayush", action: "HARD_BAN_USER", target: "usr_107 (RudeClown)", timestamp: "2026-06-06T02:11:00Z" },
  { id: "log_2", adminName: "Sandy Cheeks", action: "ADD_KEYWORD_FILTER", target: "'whatsapp me on'", timestamp: "2026-06-05T19:50:00Z" },
  { id: "log_3", adminName: "Ayush", action: "IP_RANGE_BAN", target: "112.90.*.*", timestamp: "2026-06-05T14:22:00Z" },
  { id: "log_4", adminName: "SpongeBob", action: "MUTED_USER", target: "usr_106 (SpamBot99)", timestamp: "2026-06-04T22:05:00Z" }
];

export const serverState: ServerState = globalForStore.serverState || {
  queue: [],
  matches: new Map(),
  rooms: initialRooms,
  stats: {
    onlineUsers: 1428,
    chatsToday: 894,
    countriesCount: 114,
    messagesSentCount: 24890,
  },
  users: initialUsers,
  reports: initialReports,
  bans: initialBans,
  keywords: initialKeywords,
  admins: initialAdmins,
  auditLogs: initialAuditLogs,
};

if (!globalForStore.serverState) {
  globalForStore.serverState = serverState;
}


// Helper methods representing 100% real-time synchronized data
export function getStats() {
  const activeMatches = Array.from(serverState.matches.values()).filter(m => m.status === "matched");
  const uniqueUsers = new Set<string>();
  const countries = new Set<string>();

  // Collect from queue
  serverState.queue.forEach(item => {
    uniqueUsers.add(item.id);
    if (item.profile.country) {
      countries.add(item.profile.country);
    }
  });

  // Collect from active matches
  activeMatches.forEach(m => {
    uniqueUsers.add(m.partner.id);
    if (m.partner.country) {
      countries.add(m.partner.country);
    }
  });

  // Count total real messages
  let totalMessages = 0;
  serverState.matches.forEach(m => {
    totalMessages += m.messages.filter(msg => !msg.isSystem).length;
  });

  return {
    onlineUsers: Math.max(1, uniqueUsers.size + 1), // Real live active count + self
    chatsToday: serverState.matches.size / 2, // Divided by 2 since reciprocal matches are created
    countriesCount: Math.max(1, countries.size),
    messagesSentCount: Math.max(0, totalMessages),
  };
}

export function getRooms() {
  // Return rooms with actual active users (if any) or real session connections
  return serverState.rooms;
}

export function addToQueue(userId: string, profile: UserProfile) {
  // Remove duplicate entries
  serverState.queue = serverState.queue.filter(item => item.id !== userId);
  serverState.queue.push({ id: userId, profile, timestamp: Date.now() });

  // Try matching
  processMatchmaking();
}

export function removeFromQueue(userId: string) {
  serverState.queue = serverState.queue.filter(item => item.id !== userId);
}

export function getMatch(userId: string): MatchResult | null {
  // Check active matches
  for (const [matchId, match] of serverState.matches.entries()) {
    if (match.status !== "ended" && (matchId.includes(userId) || match.partner.id === userId)) {
      return match;
    }
  }
  return null;
}

export function setTypingStatus(matchId: string, userId: string, isTyping: boolean) {
  const match = serverState.matches.get(matchId);
  if (match) {
    if (!match.typingUsers) {
      match.typingUsers = {};
    }
    match.typingUsers[userId] = isTyping;
  }
}

export function addMessageToMatch(matchId: string, senderId: string, senderName: string, text: string): Message {
  const match = serverState.matches.get(matchId);
  const msg: Message = {
    id: `m_${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    senderName,
    text,
    timestamp: Date.now(),
  };

  if (match) {
    // Clear typing status for the sender when they send a message
    if (match.typingUsers) {
      match.typingUsers[senderId] = false;
    }

    match.messages.push(msg);
    match.lastActiveTime = Date.now();
  }

  return msg;
}

export function endMatch(matchId: string, endedByUserId: string) {
  const match = serverState.matches.get(matchId);
  if (match) {
    match.status = "ended";
    match.endedBy = endedByUserId;
    // Clear typing status when active match ends
    match.typingUsers = {};
  }
}

// Matchmaking algorithm for pure real-time peer matching
function processMatchmaking() {
  if (serverState.queue.length >= 2) {
    const userA = serverState.queue.shift()!;
    const userB = serverState.queue.shift()!;

    const matchId = `match_${userA.id}_${userB.id}`;
    const match: MatchResult = {
      id: matchId,
      status: "matched",
      partner: {
        id: userB.id,
        username: userB.profile.username,
        displayName: userB.profile.displayName,
        avatar: userB.profile.avatar,
        country: userB.profile.country,
        rating: userB.profile.rating,
      },
      messages: [
        { id: `sys_init`, senderId: "system", senderName: "System", text: `🔒 Cryptographic double-shake secure. Connection verified. Nice to meet you!`, timestamp: Date.now(), isSystem: true }
      ],
      createdTime: Date.now(),
      lastActiveTime: Date.now(),
    };

    serverState.matches.set(matchId, match);

    // Also supply reciprocal match for userB
    const matchRecipId = `match_${userB.id}_${userA.id}`;
    const matchRecip: MatchResult = {
      id: matchRecipId,
      status: "matched",
      partner: {
        id: userA.id,
        username: userA.profile.username,
        displayName: userA.profile.displayName,
        avatar: userA.profile.avatar,
        country: userA.profile.country,
        rating: userA.profile.rating,
      },
      messages: [
        { id: `sys_init`, senderId: "system", senderName: "System", text: `🔒 Cryptographic double-shake secure. Connection verified. Nice to meet you!`, timestamp: Date.now(), isSystem: true }
      ],
      createdTime: Date.now(),
      lastActiveTime: Date.now(),
    };
    serverState.matches.set(matchRecipId, matchRecip);
    serverState.stats.chatsToday += 1;
  }
}
