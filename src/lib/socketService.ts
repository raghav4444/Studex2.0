import { io, Socket } from 'socket.io-client';

type ServerToClientEvents = {
  // ── General ─────────────────────────────────────────
  'users:online': (users: any[]) => void;
  'conversations:update': (conversations: any[]) => void;
  // ── DM ────────────────────────────────────────────────
  'dm:new': (message: any) => void;
  'dm:confirm': (message: any) => void;
  // ── Typing ────────────────────────────────────────────
  'typing': (data: { supabaseId: string; username: string }) => void;
  'typing:stop': (data: { supabaseId: string }) => void;
  // ── Reactions ─────────────────────────────────────────
  'message:seen': (data: { messages: string[]; seenBy: string }) => void;
  'message:react': (data: { messageId: string; reactions: any; emoji: string }) => void;
  'message:delete': (data: { messageId: string }) => void;
  // ── Friends ────────────────────────────────────────────
  'friend:request': (data: any) => void;
  'friend:accepted': (data: any) => void;
  'friend:rejected': (data: { requesterId: string }) => void;
  'friend:unfriended': (data: { friendId: string }) => void;
  // ── Channels ──────────────────────────────────────────
  'channel:created': (channel: any) => void;
  'channel:deleted': (data: { channelId: string }) => void;
  'channel:joined': (data: { channelId: string; memberCount: number }) => void;
  'channel:message': (message: any) => void;
  'channel:typing': (data: { supabaseId: string; username: string; channelId: string }) => void;
  'channel:typing:stop': (data: { supabaseId: string; channelId: string }) => void;
  'channel:react': (data: { messageId: string; reactions: any; emoji: string }) => void;
};

type ClientToServerEvents = {
  'user:join': (data: { supabaseId: string; deviceId: string }, cb?: (res: any) => void) => void;
  'user:list': (data: { supabaseId: string }, cb?: (res: any) => void) => void;
  // ── DM ────────────────────────────────────────────────
  'dm:send': (data: { supabaseId: string; recipientId: string; text: string; type?: string; imageUrl?: string; replyTo?: any }, cb?: any) => void;
  'dm:load': (data: { supabaseId: string; partnerId: string; page?: number }, cb?: any) => void;
  'dm:start': (data: { supabaseId: string; partnerId: string }, cb?: any) => void;
  'typing': (data: { supabaseId: string; recipientId: string; username: string }) => void;
  'typing:stop': (data: { supabaseId: string; recipientId: string }) => void;
  // ── Message ──────────────────────────────────────────
  'message:seen': (data: { supabaseId: string; partnerId: string; messageIds?: string[] }) => void;
  'message:react': (data: { supabaseId: string; messageId: string; emoji: string; action?: string }, cb?: any) => void;
  'message:delete': (data: { supabaseId: string; messageId: string }, cb?: any) => void;
  // ── Friends ───────────────────────────────────────────
  'friend:request': (data: { supabaseId: string; recipientId: string; username: string; avatar: string }, cb?: any) => void;
  'friend:accept': (data: { supabaseId: string; requesterId: string; requesterObj: any }, cb?: any) => void;
  'friend:reject': (data: { supabaseId: string; requesterId: string }, cb?: any) => void;
  'friend:unfriend': (data: { supabaseId: string; friendId: string }, cb?: any) => void;
  'friend:list': (data: { supabaseId: string }, cb?: any) => void;
  'conversations:refresh': (data: { supabaseId: string }, cb?: any) => void;
  // ── Channels ─────────────────────────────────────────
  'channel:join': (data: { supabaseId: string; channelId: string }, cb?: any) => void;
  'channel:leave': (data: { supabaseId: string; channelId: string }) => void;
  'channel:send': (data: { supabaseId: string; channelId: string; text: string; type?: string; imageUrl?: string; replyTo?: any }, cb?: any) => void;
  'channel:load': (data: { channelId: string; page?: number }, cb?: any) => void;
  'channel:typing': (data: { supabaseId: string; username: string; channelId: string }) => void;
  'channel:typing:stop': (data: { supabaseId: string; channelId: string }) => void;
  'channel:react': (data: { supabaseId: string; messageId: string; emoji: string; action?: string }, cb?: any) => void;
  'channel:seen': (data: { supabaseId: string; channelId: string }) => void;
};

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private serverUrl: string = '';
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor() {
    // Lazy-initialize URL on first connect (not in constructor — avoids HMR issues)
  }

  private getServerUrl() {
    if (!this.serverUrl) {
      this.serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    }
    return this.serverUrl;
  }

  connect() {
    if (this.socket?.connected) return this.socket;

    const url = this.getServerUrl();
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 10000,
    });

    console.log('[Socket] Connecting to:', url);

    this.socket.on('connect', () => console.log('🔌 Studex Socket connected:', this.socket?.id));
    this.socket.on('disconnect', () => console.log('🔌 Studex Socket disconnected'));
    this.socket.on('connect_error', (err) => console.error('🔌 Socket connection error:', err.message, '| URL:', url));

    const events = [
      'users:online', 'dm:new', 'dm:confirm',
      'typing', 'typing:stop', 'message:seen', 'message:react',
      'message:delete', 'friend:request', 'friend:accepted',
      'friend:rejected', 'friend:unfriended', 'conversations:update',
      'channel:created', 'channel:deleted', 'channel:joined',
      'channel:message', 'channel:typing', 'channel:typing:stop', 'channel:react',
    ];

    for (const evt of events) {
      (this.socket as any).on(evt, (...args: any[]) => {
        this.emit(evt, ...args);
      });
    }

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  get socketId() { return this.socket?.id; }

  // ── User ───────────────────────────────────────────────
  join(supabaseId: string, deviceId: string) {
    return new Promise<any>((resolve, reject) => {
      this.socket?.emit('user:join', { supabaseId, deviceId }, (res: any) => {
        if (res?.status === 'ok') resolve(res);
        else reject(new Error(res?.message || 'Join failed'));
      });
    });
  }

  // ── DM ────────────────────────────────────────────────
  sendDM(data: { supabaseId: string; recipientId: string; text: string; type?: string; imageUrl?: string; replyTo?: any }) {
    return new Promise<any>((resolve) => {
      this.socket?.emit('dm:send', data, (res: any) => resolve(res));
    });
  }

  loadHistory(supabaseId: string, partnerId: string, page: number = 1) {
    return new Promise<any>((resolve, reject) => {
      this.socket?.emit('dm:load', { supabaseId, partnerId, page }, (res: any) => {
        if (res?.messages) resolve(res);
        else reject(new Error(res?.error || 'Load failed'));
      });
    });
  }

  startDM(supabaseId: string, partnerId: string) {
    return new Promise<any>((resolve, reject) => {
      this.socket?.emit('dm:start', { supabaseId, partnerId }, (res: any) => {
        if (res?.status === 'ok') resolve(res);
        else reject(new Error(res?.message));
      });
    });
  }

  markSeen(supabaseId: string, partnerId: string, messageIds?: string[]) {
    this.socket?.emit('message:seen', { supabaseId, partnerId, messageIds });
  }

  react(supabaseId: string, messageId: string, emoji: string, action: 'add' | 'remove' = 'add') {
    return new Promise<any>((resolve) => {
      this.socket?.emit('message:react', { supabaseId, messageId, emoji, action: action === 'remove' ? 'remove' : undefined }, (res: any) => resolve(res));
    });
  }

  deleteMessage(supabaseId: string, messageId: string) {
    return new Promise<any>((resolve) => {
      this.socket?.emit('message:delete', { supabaseId, messageId }, (res: any) => resolve(res));
    });
  }

  // ── Typing ────────────────────────────────────────────
  sendTyping(supabaseId: string, recipientId: string, username: string) {
    this.socket?.emit('typing', { supabaseId, recipientId, username });
  }
  stopTyping(supabaseId: string, recipientId: string) {
    this.socket?.emit('typing:stop', { supabaseId, recipientId });
  }

  // ── Friends ───────────────────────────────────────────
  sendFriendRequest(supabaseId: string, recipientId: string, username: string, avatar: string) {
    return new Promise<any>((resolve) => {
      this.socket?.emit('friend:request', { supabaseId, recipientId, username, avatar }, (res: any) => resolve(res));
    });
  }
  acceptFriend(supabaseId: string, requesterId: string, requesterObj?: any) {
    return new Promise<any>((resolve) => {
      this.socket?.emit('friend:accept', { supabaseId, requesterId, requesterObj }, (res: any) => resolve(res));
    });
  }
  rejectFriend(supabaseId: string, requesterId: string) {
    return new Promise<any>((resolve) => {
      this.socket?.emit('friend:reject', { supabaseId, requesterId }, (res: any) => resolve(res));
    });
  }
  unfriend(supabaseId: string, friendId: string) {
    return new Promise<any>((resolve) => {
      this.socket?.emit('friend:unfriend', { supabaseId, friendId }, (res: any) => resolve(res));
    });
  }
  refreshConversations(supabaseId: string) {
    return new Promise<any>((resolve) => {
      this.socket?.emit('conversations:refresh', { supabaseId }, (res: any) => resolve(res));
    });
  }

  // ── Channels ──────────────────────────────────────────
  joinChannel(supabaseId: string, channelId: string) {
    return new Promise<any>((resolve, reject) => {
      if (!this.socket?.connected) {
        // Socket not connected — resolve with empty messages, don't hang
        resolve({ status: 'ok', channel: null, messages: [] });
        return;
      }
      const timeout = setTimeout(() => {
        resolve({ status: 'ok', channel: null, messages: [] }); // timeout → still resolve
      }, 3000);
      this.socket?.emit('channel:join', { supabaseId, channelId }, (res: any) => {
        clearTimeout(timeout);
        if (res?.status === 'ok') resolve(res);
        else reject(new Error(res?.message || 'Failed to join channel'));
      });
    });
  }

  leaveChannel(supabaseId: string, channelId: string) {
    this.socket?.emit('channel:leave', { supabaseId, channelId });
  }

  sendChannelMessage(data: { supabaseId: string; channelId: string; text: string; type?: string; imageUrl?: string; replyTo?: any }) {
    return new Promise<any>((resolve, reject) => {
      // Auto-connect if socket was never initialized
      if (!this.socket || !this.socket.connected) {
        console.warn('[Socket] Not connected — attempting to connect first...');
        this.connect(); // non-blocking, socket.io will queue the emit
      }
      const startTime = Date.now();
      const timeout = setTimeout(() => {
        reject(new Error('Message send timed out (5s)'));
      }, 5000);
      console.log('[Socket] Emitting channel:send →', data.channelId, '| socket connected:', this.socket?.connected);
this.socket!.emit('channel:send', data, (res: any) => {
        clearTimeout(timeout);
        console.log('[Socket] channel:send response:', res, '(took', Date.now() - startTime, 'ms)');
        if (res?.status === 'ok') {
          // Optimistic update: emit through the internal event bus so useStudexChat's
          // listener picks it up immediately — the sender doesn't need to wait for
          // the server broadcast relay (which may not reach the sender's own socket).
          console.log('[Socket] Optimistic insert -> channel:message:', res.message?._id);
          this.emit('channel:message', res.message);
          resolve(res);
        } else reject(new Error(res?.message || 'Failed to send'));
      });
    });
  }

  loadChannelHistory(channelId: string, page: number = 1) {
    return new Promise<any>((resolve, reject) => {
      this.socket?.emit('channel:load', { channelId, page }, (res: any) => {
        if (res?.messages) resolve(res);
        else reject(new Error(res?.error || 'Load failed'));
      });
    });
  }

  sendChannelTyping(supabaseId: string, username: string, channelId: string) {
    this.socket?.emit('channel:typing', { supabaseId, username, channelId });
  }

  stopChannelTyping(supabaseId: string, channelId: string) {
    this.socket?.emit('channel:typing:stop', { supabaseId, channelId });
  }

  reactChannelMessage(supabaseId: string, messageId: string, emoji: string, action: 'add' | 'remove' = 'add') {
    return new Promise<any>((resolve) => {
      this.socket?.emit('channel:react', { supabaseId, messageId, emoji, action: action === 'remove' ? 'remove' : undefined }, (res: any) => resolve(res));
    });
  }

  markChannelSeen(supabaseId: string, channelId: string) {
    this.socket?.emit('channel:seen', { supabaseId, channelId });
  }

  createChannelREST(data: { name: string; description?: string; isPrivate?: boolean; createdBy: string }) {
    return fetch(`${this.serverUrl}/api/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async r => {
      const contentType = r.headers.get('content-type') || '';
      const body = contentType.includes('application/json') ? await r.json() : await r.text();
      if (!r.ok) {
        // If we got HTML back, the backend isn't running — Vite returned a 404 page
        const message = typeof body === 'string'
          ? (body.startsWith('<') ? `Backend not reachable at ${this.serverUrl}` : body)
          : (body?.error || `HTTP ${r.status}`);
        throw new Error(message);
      }
      return body;
    });
  }

  listChannelsREST(supabaseId?: string) {
    const q = supabaseId ? `?supabaseId=${supabaseId}` : '';
    return fetch(`${this.serverUrl}/api/channels${q}`).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  }

  joinChannelREST(channelId: string, supabaseId: string) {
    return fetch(`${this.serverUrl}/api/channels/${channelId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabaseId }),
    }).then(r => r.json());
  }

  deleteChannelREST(channelId: string, supabaseId: string) {
    return fetch(`${this.serverUrl}/api/channels/${channelId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabaseId }),
    }).then(r => r.json());
  }

  // ── Internal event bus ────────────────────────────────
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, new Set());
    this.eventHandlers.get(event)!.add(handler);
    return () => this.eventHandlers.get(event)?.delete(handler);
  }

  off(event: string, handler: Function) {
    this.eventHandlers.get(event)?.delete(handler);
  }

  private emit(event: string, ...args: any[]) {
    this.eventHandlers.get(event)?.forEach((h: Function) => h(...args));
  }

  // ── REST helpers ───────────────────────────────────────
  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${this.serverUrl}/api/upload`, { method: 'POST', body: form });
    return res.json();
  }

  async upsertUser(data: any) {
    const res = await fetch(`${this.serverUrl}/api/users/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async searchGifs(query: string) {
    const res = await fetch(`${this.serverUrl}/api/gifs?q=${encodeURIComponent(query)}`);
    return res.json();
  }
}

export const socketService = new SocketService();
export default socketService;