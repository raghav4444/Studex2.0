# Pulse Chat — Real-Time Chat for Studex 2.0

A full-featured Pulse Chat system built with **Socket.IO + MongoDB + Node.js**, replacing the Supabase-based chat.

---

## Architecture

```
[React Frontend (Vite)] ←→ [Socket.IO] ←→ [Node.js + Express] ←→ [MongoDB]
     PulseChatPage.tsx       client.js         server.js         models/

Components:
  PulseChatPage.tsx  — Main page (Aurora canvas + sidebar + window)
  ChatSidebar.tsx     — Friends, conversations, search, friend requests
  ChatWindow.tsx      — Messages, reactions, typing, GIF picker, uploads
  ParticleCanvas.tsx — Animated Aurora blob background
  usePulseChat.ts    — Custom React hook (all state + socket events)
  socketService.ts   — Socket.IO singleton + REST helpers
```

---

## Features

| Feature | Description |
|---|---|
| **Real-time DMs** | Socket.IO-powered instant messaging |
| **Aurora Canvas** | Animated floating blob background |
| **Friend System** | Send/accept/reject requests → mutual friends |
| **Unfriend + DM Delete** | Unfriend clears all chat history |
| **Reactions** | Add/remove emoji reactions (❤️😂😮😢😡🔥👍👎) |
| **Read Receipts** | ✓ = sent, ✓✓ = seen |
| **Typing Indicators** | Dots animation when partner is typing |
| **GIF Picker** | Search via Tenor API |
| **Image Upload** | Drag-drop, file attachments, lightbox preview |
| **Reply / Re-share** | Quote any message as a reply |
| **Message Delete** | Soft-delete (shows "deleted" placeholder) |
| **Online Status** | Real-time green dot + last seen |
| **Multi-device** | Same user logged on multiple devices |
| **Infinite Scroll** | Load older messages on scroll up |
| **User Search** | Find and friend anyone on the platform |

---

## Running It

### 1. MongoDB
```bash
# Install MongoDB, or use Atlas (cloud):
# mongodb+srv://user:pass@cluster.mongodb.net/studex-chat

# Local:
mongod --dbpath ~/data/db
```

### 2. Backend Server
```bash
cd server
npm install         # already done
cp .env.example .env # set MONGODB_URI

# Start dev (auto-reload):
npm run dev

# Server runs on http://localhost:3001
```

### 3. Frontend
```bash
cd ..  # back to Studex2.0 root
npm install         # installs socket.io-client
npm run dev

# Frontend on http://localhost:5173
```

### 4. Demo Flow
1. Open http://localhost:5173
2. Log in with any Supabase demo account
3. Go to **Chat** tab
4. Click the **+** (Add friend) button → search for other users
5. Send friend requests, accept them
6. Start chatting with reactions, GIFs, images, and read receipts

---

## API Reference

### REST Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/users/upsert` | Create/sync user from Supabase |
| GET | `/api/users/:id` | Get user profile |
| GET | `/api/users?q=` | Search users |
| POST | `/api/upload` | Upload image/file |
| GET | `/api/gifs?q=` | Search GIFs via Tenor |

### Socket Events
| Event | Direction | Purpose |
|---|---|---|
| `user:join` | C→S | Authenticate user, get friends + convs |
| `dm:send` | C→S | Send direct message |
| `dm:load` | C→S | Load message history |
| `dm:new` | S→C | Receive new DM |
| `dm:confirm` | S→C | Confirm sent DM |
| `message:seen` | C↔S | Mark seen + read receipt |
| `message:react` | C↔S | Add/remove reaction |
| `message:delete` | C↔S | Delete message |
| `typing` / `typing:stop` | C↔S | Typing indicator |
| `friend:request` | C↔S | Send friend request |
| `friend:accept` | C↔S | Accept → mutual friends |
| `friend:reject` | C↔S | Reject request |
| `friend:unfriend` | C↔S | Remove friend + clear DMs |
| `users:online` | S→C | Broadcast online users |

---

## Environment Variables

### Server (`server/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/studex-chat
PORT=3001
FRONTEND_URL=http://localhost:5173
TENOR_KEY=your_tenor_api_key   # optional — for GIF search
```

### Frontend (optional — `.env`)
```env
VITE_SOCKET_URL=http://localhost:3001
```

---

## Moving from Supabase Chat

The old `useChat.ts`, `ChatPage.tsx`, `ChatWindow.tsx`, `ChatList.tsx` are preserved.
The new `PulseChatPage` supersedes them. To switch back, change `App.tsx`:
```tsx
// Old:
const ChatPage = React.lazy(() => import("./components/Chat/ChatPage"));
// return <ChatPage />;

// New:
const PulseChatPage = React.lazy(() => import("./components/Chat/PulseChatPage"));
// return <PulseChatPage />;
```

---

## MongoDB Models

### User
```js
{
  supabaseId: String,      // Supabase auth ID (unique)
  name, username, email,
  college, branch, year,
  avatar, bio,
  isOnline: Boolean,
  lastSeen: Date,
  friends: [ObjectId],
  friendRequests: [{ from, fromName, fromUsername, fromAvatar, fromCollege }],
  sentRequests: [ObjectId],
  isVerified: Boolean,
  accessLevel: 'full' | 'partial' | 'read_only',
}
```

### Message
```js
{
  text: String,
  senderId: String,        // supabaseId
  recipientId: String,     // supabaseId (for DMs)
  type: 'text' | 'image' | 'file' | 'gif' | 'system',
  imageUrl: String,
  seenBy: [{ userId, seenAt }],
  reactions: Map<emoji, [{ userId, username, emoji, createdAt }]>,
  replyTo: { messageId, text, senderName },
  isDeleted: Boolean,
}
```