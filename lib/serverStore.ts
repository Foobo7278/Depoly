import { UserProfile, Room, MatchResult, Message } from "./types";

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
};

if (!globalForStore.serverState) {
  globalForStore.serverState = serverState;
}

// Simulated Bot database for high fidelity instant matchmaking
const botPartners = [
  { username: "@cryptocat", displayName: "CryptoCat 💻", country: "🇩🇪 Germany", bio: "Rust hacker. Obsessed with distributed ledgers and mechanical keyboard layouts.", rating: 4.95, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
  { username: "@neon_driver", displayName: "NeonDriver 🚗", country: "🇯🇵 Japan", bio: "City pop enthusiast. Retro arcade restorer. I drive at midnight for the views.", rating: 4.88, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { username: "@pixel_mandal", displayName: "PixelMandal 🎨", country: "🇮🇳 India", bio: "Weaving complex bento grids & generating isometric UI vectors to relax.", rating: 4.82, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
  { username: "@sol_hack", displayName: "Sol Hack 🪐", country: "🇧🇷 Brazil", bio: "Synthesizer collector and UX specialist. Currently building ambient loops.", rating: 4.91, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
  { username: "@aurora", displayName: "Aurora Borealis 🧊", country: "🇨🇦 Canada", bio: "Glacier survey tech. Coding in thermo-suits under northern lights. Cozy vibes.", rating: 4.97, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" }
];

const botResponses: Record<string, string[]> = {
  default: [
    "Hey! Fascinating connection protocol here. What are you building today?",
    "Agreed. Standard networks are so bloated. Love the slate-cyan console flow here of Flux Meet.",
    "Interesting! Tell me more about that setup.",
    "That makes complete sense. I usually configure my container reverse proxies to cache those payloads directly.",
    "Wow, neat! Totally checking that out on my local machine shortly.",
    "Haha, same! Half my scripts are held together by regex and midnight coffee.",
    "Nice talking to you! The verified handshake filter on Flux is super solid."
  ],
  "@cryptocat": [
    "Hey! Handshake secure. I was just compiling some Rust WASM binaries, what's up?",
    "Nice! I use a 60% mechanical layout with custom linear switches. Sound signature is pristine.",
    "Honestly, keeping secrets hidden server-side is rule #1. Flux has premium encryption filters.",
    "Nice chat! Catch you in the Cybersecurity room later."
  ],
  "@neon_driver": [
    "Yo! Just listening to Tatsuro Yamashita. Do you vibe with midnight cassettes too?",
    "Wow, perfect midnight cruising soundtracks. Makes compiling styles feel breezy.",
    "Tokyo nights are pretty bright right now, looking out of a cozy arcade lounge.",
    "Keep driving! Catch you around."
  ],
  "@pixel_mandal": [
    "Hello there! I'm wireframing a neon custom bento dashboard right now. What are you designing?",
    "Padding and custom shadows make or break a viewport. Zero placeholders is my law.",
    "Yes, generous negative space paired with deep Slate background is highly professional.",
    "Have an amazing day! Talk soon."
  ],
};

// Helper methods
export function getStats() {
  // Fluctuating stats for living UI
  const drift = Math.floor(Math.random() * 5) - 2; // -2 to +2
  serverState.stats.onlineUsers = Math.max(1200, serverState.stats.onlineUsers + drift);
  serverState.stats.messagesSentCount += Math.floor(Math.random() * 3);
  return serverState.stats;
}

export function getRooms() {
  // Add small virtual variation to active users
  return serverState.rooms.map(room => {
    const change = Math.floor(Math.random() * 3) - 1; // -1 to +1
    return {
      ...room,
      onlineCount: Math.max(10, room.onlineCount + change)
    };
  });
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
    serverState.stats.messagesSentCount += 1;

    // Simulate bot replying after a short natural delay
    if (match.partner.id.startsWith("bot_")) {
      // Start bot typing after 400ms
      setTimeout(() => {
        setTypingStatus(matchId, match.partner.id, true);
      }, 400);

      setTimeout(() => {
        const botMatch = serverState.matches.get(matchId);
        if (botMatch && botMatch.status === "matched") {
          // Set bot typing back to false when they reply
          setTypingStatus(matchId, botMatch.partner.id, false);
          
          const usernameKey = botMatch.partner.username;
          const replies = botResponses[usernameKey] || botResponses.default;
          // select reply based on index/random
          const replyText = replies[Math.floor(Math.random() * replies.length)];
          const botMsg: Message = {
            id: `m_${Math.random().toString(36).substr(2, 9)}`,
            senderId: botMatch.partner.id,
            senderName: botMatch.partner.displayName,
            text: replyText,
            timestamp: Date.now(),
          };
          botMatch.messages.push(botMsg);
          botMatch.lastActiveTime = Date.now();
          serverState.stats.messagesSentCount += 1;
        }
      }, 1800);
    }
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

// Matchmaking algorithm
function processMatchmaking() {
  // Match real users together first
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
    return;
  }

  // If a user has been waiting for more than 2.5 seconds, match space-time with a simulated verified system bot Partner!
  const now = Date.now();
  for (let i = 0; i < serverState.queue.length; i++) {
    const candidate = serverState.queue[i];
    if (now - candidate.timestamp > 2000) {
      serverState.queue.splice(i, 1);
      
      // Select a random bot
      const randomBot = botPartners[Math.floor(Math.random() * botPartners.length)];
      const botId = `bot_${Math.random().toString(36).substr(2, 5)}`;
      const matchId = `match_${candidate.id}_${botId}`;

      const match: MatchResult = {
        id: matchId,
        status: "matched",
        partner: {
          id: botId,
          username: randomBot.username,
          displayName: randomBot.displayName,
          avatar: randomBot.avatar,
          country: randomBot.country,
          rating: randomBot.rating,
        },
        messages: [
          { id: `sys_init`, senderId: "system", senderName: "System", text: `🔒 Encrypted tunneling established. Authenticated with verified partner ${randomBot.displayName}.`, timestamp: Date.now(), isSystem: true }
        ],
        createdTime: Date.now(),
        lastActiveTime: Date.now(),
      };

      serverState.matches.set(matchId, match);
      serverState.stats.chatsToday += 1;
      
      // Start bot typing after 100ms
      setTimeout(() => {
        setTypingStatus(matchId, botId, true);
      }, 100);

      // Seed first bot message shortly
      setTimeout(() => {
        const activeMatch = serverState.matches.get(matchId);
        if (activeMatch && activeMatch.status === "matched") {
          // Set bot typing back to false when they reply
          setTypingStatus(matchId, botId, false);

          const greetText = randomBot.username === "@cryptocat" 
            ? "Hey! Secure handshake complete. Rust hacking tonight? 🦀"
            : randomBot.username === "@neon_driver"
            ? "Yo! Just tuning into some late night Tokyo city pop cassettes. Vibes? 🗼"
            : randomBot.username === "@pixel_mandal"
            ? "Hey! Designing neon panels. Your profile display looks awesome! 🎨"
            : "Hey there! Handshake verified. Connecting from icy Canada Survey station. What are you coding today? 🧊";

          const greetMsg: Message = {
            id: `m_${Math.random().toString(36).substr(2, 9)}`,
            senderId: botId,
            senderName: randomBot.displayName,
            text: greetText,
            timestamp: Date.now(),
          };
          activeMatch.messages.push(greetMsg);
          activeMatch.lastActiveTime = Date.now();
          serverState.stats.messagesSentCount += 1;
        }
      }, 1000);

      break;
    }
  }
}
