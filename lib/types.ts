export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  country: string;
  age: number;
  avatar: string | null;
  verified: boolean;
  memberType: "Free" | "Premium";
  chatsCount: number;
  messagesCount: number;
  friendsCount: number;
  rating: number;
  status?: "active" | "warned" | "muted" | "banned";
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  online: boolean;
  country: string;
  addedAt: number;
}

export interface LiveNotification {
  id: string;
  icon: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  actions?: boolean;
  actionPayload?: {
    type: "friend_request" | "room_invite" | "system";
    senderId?: string;
    senderName?: string;
    senderUsername?: string;
    roomId?: string;
  };
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface MatchResult {
  id: string;
  status: "idle" | "searching" | "matched" | "ended";
  partner: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    country: string;
    rating: number;
  };
  messages: Message[];
  createdTime: number;
  lastActiveTime: number;
  endedBy?: string;
  typingUsers?: Record<string, boolean>;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  onlineCount: number;
  tags: string[];
}

export interface HistoryItem {
  id: string;
  partnerName: string;
  partnerCountry: string;
  messagesCount: number;
  durationSeconds: number;
  date: string;
}
