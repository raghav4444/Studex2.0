import { useCallback, useEffect, useRef, useState } from 'react';
import { socketService } from '../lib/socketService';
import { useAuth } from '../components/AuthProvider';

// Types
export interface StudexUser {
  _id: string;
  supabaseId: string;
  name: string;
  username: string;
  avatar: string;
  college: string;
  branch: string;
  year: number;
  isOnline: boolean;
  lastSeen?: Date;
  isVerified?: boolean;
  isFriend?: boolean;
  bio?: string;
  isAnonymous?: boolean;
  accessLevel?: string;
}

export interface StudexMessage {
  _id: string;
  text: string;
  senderId: string;
  recipientId?: string;
  type: string;
  imageUrl?: string;
  fileName?: string;
  reactions?: Record<string, Array<{ userId: string; emoji: string; username: string }>>;
  seenBy?: Array<{ userId: string; seenAt: Date }>;
  createdAt: Date;
  replyTo?: { messageId: string; text: string; senderName: string };
  sender?: StudexUser;
}

export interface StudexConversation {
  _id: string;
  partner: StudexUser;
  lastMessage?: {
    _id: string;
    text: string;
    senderId: string;
    type: string;
    imageUrl?: string;
    createdAt: Date;
    reactions?: any;
  };
  unreadCount: number;
}

export interface FriendRequest {
  _id: string;
  fromName: string;
  fromUsername: string;
  fromAvatar: string;
  fromCollege: string;
  createdAt: Date;
}

export interface TypingState {
  [partnerId: string]: { username: string; timeout?: ReturnType<typeof setTimeout> };
}

// ── Channel Types ───────────────────────────────────────
export interface StudexChannel {
  _id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  createdBy: string;
  memberCount: number;
  isMember: boolean;
  members?: string[];   // supabaseIds — populated when viewing inside channel
  admins?: string[];    // supabaseIds
  createdAt: Date;
}

/** A message inside a channel (same shape as StudexMessage but with channel context) */
export type ChannelMessage = StudexMessage & { channelId: string };

export interface ChannelTyping {
  [channelId: string]: { username: string };
}

/** Discriminated union for the active view — either a DM or a channel */
export type ActiveView =
  | { type: 'dm'; conversation: StudexConversation }
  | { type: 'channel'; channel: StudexChannel }
  | null;

export const useStudexChat = () => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<StudexUser | null>(null);
  const [conversations, setConversations] = useState<StudexConversation[]>([]);
  const [friends, setFriends] = useState<StudexUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<StudexUser[]>([]);
  const [messages, setMessages] = useState<Map<string, StudexMessage[]>>(new Map());
  const [activeConversation, setActiveConversation] = useState<StudexConversation | null>(null);
  const [typing, setTyping] = useState<TypingState>({});
  const [loading, setLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState<Map<string, number>>(new Map());
  const [hasMoreHistory, setHasMoreHistory] = useState<Map<string, boolean>>(new Map());
  const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── Channel State ─────────────────────────────────────
  const [channels, setChannels] = useState<StudexChannel[]>([]);
  const [channelMessages, setChannelMessages] = useState<Map<string, ChannelMessage[]>>(new Map());
  const [activeView, setActiveView] = useState<ActiveView>(null);
  const [channelTyping, setChannelTyping] = useState<ChannelTyping>({});
  const [channelUnread, setChannelUnread] = useState<Map<string, number>>(new Map());
  const isTypingRef = useRef(false);
  const channelTypingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const supabaseId = user?.id || '';
  const deviceId = useRef(localStorage.getItem('studex_device_id') || (() => {
    const id = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('studex_device_id', id);
    return id;
  })());

  // ── Socket Connect & Join ────────────────────────────────
  useEffect(() => {
    if (!user?.id || !user?.supabaseId) return;

    const socket = socketService.connect();

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Join with user info from Supabase auth
    socketService.join(user.supabaseId, deviceId.current)
      .then(async (res) => {
        setCurrentUser(res.user);
        setConversations(res.conversations || []);
        setFriends(res.friends || []);
        setChannels(res.channels || []);

        // Sync user data to MongoDB via REST
        await socketService.upsertUser({
          supabaseId: user.supabaseId || user.id,
          name: user.name,
          username: user.username || user.email?.split('@')[0] || `user_${user.id?.slice(0, 8)}`,
          email: user.email,
          college: user.college,
          branch: user.branch,
          year: user.year,
          bio: user.bio,
          avatar: user.avatar,
          isVerified: user.isVerified,
          accessLevel: user.accessLevel,
        });
      })
      .catch(console.error);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [user?.id]);

  // ── Socket Event Listeners ────────────────────────────────
  useEffect(() => {
    if (!supabaseId) return;

    // New DM message
    const offNew = socketService.on('dm:new', (msg) => {
      setMessages(prev => {
        const key = msg.recipientId === supabaseId ? msg.senderId : msg.recipientId;
        const existing = prev.get(key) || [];
        const filtered = existing.filter(m => m._id !== msg._id); // dedup
        const updated = new Map(prev);
        updated.set(key, [...filtered, { ...msg, createdAt: new Date(msg.createdAt) }]);
        return updated;
      });
      // Update conversation last message
      setConversations(prev => prev.map(c => {
        if (c._id === msg.senderId || c._id === msg.recipientId) {
          return { ...c, lastMessage: { _id: msg._id, text: msg.text, senderId: msg.senderId, type: msg.type, imageUrl: msg.imageUrl, createdAt: new Date(msg.createdAt) } };
        }
        return c;
      }));
    });

    // Confirm sent DM
    const offConfirm = socketService.on('dm:confirm', (msg) => {
      setMessages(prev => {
        const key = msg.recipientId;
        const existing = prev.get(key) || [];
        const filtered = existing.filter(m => m._id !== msg._id);
        const updated = new Map(prev);
        updated.set(key, [...filtered, { ...msg, createdAt: new Date(msg.createdAt) }]);
        return updated;
      });
    });

    // Message seen
    const offSeen = socketService.on('message:seen', ({ messages: seenIds, seenBy }) => {
      setMessages(prev => {
        const updated = new Map(prev);
        for (const [key, msgs] of updated) {
          updated.set(key, msgs.map(m =>
            seenIds.includes(m._id)
              ? { ...m, seenBy: [...(m.seenBy || []), { userId: seenBy, seenAt: new Date() }] }
              : m
          ));
        }
        return updated;
      });
    });

    // Reactions
    const offReact = socketService.on('message:react', ({ messageId, reactions }) => {
      setMessages(prev => {
        const updated = new Map(prev);
        for (const [key, msgs] of updated) {
          updated.set(key, msgs.map(m => m._id === messageId ? { ...m, reactions } : m));
        }
        return updated;
      });
    });

    // Delete
    const offDelete = socketService.on('message:delete', ({ messageId }) => {
      setMessages(prev => {
        const updated = new Map(prev);
        for (const [key, msgs] of updated) {
          updated.set(key, msgs.map(m => m._id === messageId ? { ...m, text: '🗑️ This message was deleted', type: 'system' } : m));
        }
        return updated;
      });
    });

    // Typing
    const offTyping = socketService.on('typing', ({ supabaseId: typistId, username }) => {
      setTyping(prev => ({ ...prev, [typistId]: { username } }));
      const existing = typingTimeouts.current.get(typistId);
      if (existing) clearTimeout(existing);
      typingTimeouts.current.set(typistId, setTimeout(() => {
        setTyping(prev => { const n = { ...prev }; delete n[typistId]; return n; });
      }, 3000));
    });

    const offTypingStop = socketService.on('typing:stop', ({ supabaseId: typistId }) => {
      setTyping(prev => { const n = { ...prev }; delete n[typistId]; return n; });
    });

    // Online users
    const offOnline = socketService.on('users:online', (users) => {
      setOnlineUsers(users);
      setConversations(prev => prev.map(c => {
        const online = users.find((u: any) => u._id?.toString() === c.partner._id?.toString() || u.supabaseId === c.partner.supabaseId);
        return online ? { ...c, partner: { ...c.partner, isOnline: true } } : c;
      }));
    });

    // Conversations update
    const offConvUpdate = socketService.on('conversations:update', (convs) => {
      setConversations(convs);
    });

    // Friend: request received
    const offFriendRequest = socketService.on('friend:request', (req) => {
      setFriendRequests(prev => [req, ...prev]);
    });

    // Friend: accepted
    const offFriendAccepted = socketService.on('friend:accepted', ({ friend }) => {
      setFriends(prev => {
        if (prev.some(f => f._id === friend._id)) return prev;
        return [{ ...friend, isFriend: true }, ...prev];
      });
      setFriendRequests(prev => prev.filter(r => r._id !== friend._id));
    });

    // Friend: rejected / unfriended
    const offFriendRejected = socketService.on('friend:rejected', ({ requesterId }) => {
      setFriendRequests(prev => prev.filter(r => r._id !== requesterId));
    });

    const offFriendUnfriended = socketService.on('friend:unfriended', ({ friendId }) => {
      setFriends(prev => prev.filter(f => f._id?.toString() !== friendId?.toString()));
      setConversations(prev => prev.filter(c => c.partner._id?.toString() !== friendId?.toString()));
    });

    // ── Channel events ────────────────────────────────────
    const offChannelCreated = socketService.on('channel:created', (channel) => {
      setChannels(prev => {
        const ch = { ...channel, createdAt: new Date(channel.createdAt) };
        if (prev.some(c => c._id === ch._id)) return prev;
        return [{ ...ch, isMember: channel.isMember !== false ? true : !channel.isPrivate }, ...prev];
      });
    });

    const offChannelDeleted = socketService.on('channel:deleted', ({ channelId }) => {
      setChannels(prev => prev.filter(c => c._id !== channelId));
      setChannelMessages(prev => { const m = new Map(prev); m.delete(channelId); return m; });
      setActiveView(prev => {
        if (prev?.type === 'channel' && prev.channel._id === channelId) return null;
        return prev;
      });
    });

    const offChannelMsg = socketService.on('channel:message', (msg: any) => {
      const cid: string = msg.channelId;
      console.log('[Chat] channel:message received — channelId:', cid, 'msgId:', msg._id, 'text:', msg.text);
      setChannelMessages(prev => {
        const existing = prev.get(cid) || [];
        if (existing.some(m => m._id === msg._id)) { console.log('[Chat] Duplicate message, skipping.'); return prev; }
        const updated = new Map(prev);
        updated.set(cid, [...existing, { ...msg, createdAt: new Date(msg.createdAt) }]);
        console.log('[Chat] channelMessages updated — total in', cid + ':', updated.get(cid)?.length);
        return updated;
      });
      setActiveView(prev => {
        if (prev?.type !== 'channel' || prev.channel._id !== cid) {
          setChannelUnread(u => { const n = new Map(u); n.set(cid, (n.get(cid) || 0) + 1); return n; });
        }
        return prev;
      });
    });

    const offChannelTyping = socketService.on('channel:typing', ({ supabaseId: tid, username, channelId }) => {
      setChannelTyping(prev => ({ ...prev, [channelId]: { username } }));
      const ex = channelTypingTimeouts.current.get(channelId);
      if (ex) clearTimeout(ex);
      channelTypingTimeouts.current.set(channelId, setTimeout(() => {
        setChannelTyping(prev => { const n = { ...prev }; delete n[channelId]; return n; });
      }, 3000));
    });

    const offChannelTypingStop = socketService.on('channel:typing:stop', ({ supabaseId: tid, channelId }) => {
      setChannelTyping(prev => { const n = { ...prev }; delete n[channelId]; return n; });
    });

    const offChannelReact = socketService.on('channel:react', ({ messageId, reactions }) => {
      setChannelMessages(prev => {
        const updated = new Map(prev);
        for (const [cid, msgs] of updated) {
          updated.set(cid, msgs.map(m => m._id === messageId ? { ...m, reactions } : m));
        }
        return updated;
      });
    });

    return () => {
      [offNew, offConfirm, offSeen, offReact, offDelete, offTyping, offTypingStop, offOnline, offConvUpdate, offFriendRequest, offFriendAccepted, offFriendRejected, offFriendUnfriended, offChannelCreated, offChannelDeleted, offChannelMsg, offChannelTyping, offChannelTypingStop, offChannelReact].forEach(off => off());
    };
  }, [supabaseId]);

  // ── Actions ──────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string, type: string = 'text', imageUrl?: string, replyTo?: any) => {
    if (!text?.trim()) return;
    const trimmed = text.trim();

    if (activeView?.type === 'channel') {
      // ── Channel message ───────────────────────────────
      const { channel } = activeView;
      await socketService.sendChannelMessage({ supabaseId, channelId: channel._id, text: trimmed, type, imageUrl, replyTo });
      socketService.stopChannelTyping(supabaseId, channel._id);
    } else if (activeView?.type === 'dm') {
      // ── DM ──────────────────────────────────────────
      const recipientId = activeView.conversation.partner.supabaseId || (activeView.conversation.partner as any)._id;
      await socketService.sendDM({ supabaseId, recipientId, text: trimmed, type, imageUrl, replyTo });
      socketService.stopTyping(supabaseId, recipientId);
    }
  }, [activeView, supabaseId]);

  const loadHistory = useCallback(async (partnerId: string, page: number = 1) => {
    if (!supabaseId) return;
    setLoading(true);
    try {
      const { messages: msgs, hasMore } = await socketService.loadHistory(supabaseId, partnerId, page);
      const enriched = msgs.map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) }));

      setMessages(prev => {
        const updated = new Map(prev);
        if (page === 1) {
          updated.set(partnerId, enriched);
        } else {
          const existing = updated.get(partnerId) || [];
          updated.set(partnerId, [...enriched, ...existing]);
        }
        return updated;
      });

      setHistoryPage(prev => new Map(prev).set(partnerId, page));
      setHasMoreHistory(prev => new Map(prev).set(partnerId, hasMore));
    } catch (err) {
      console.error('loadHistory error:', err);
    } finally {
      setLoading(false);
    }
  }, [supabaseId]);

  const markRead = useCallback(async (partnerId: string, messageIds?: string[]) => {
    socketService.markSeen(supabaseId, partnerId, messageIds);
  }, [supabaseId]);

  const reactToMessage = useCallback(async (messageId: string, emoji: string, action: 'add' | 'remove' = 'add') => {
    await socketService.react(supabaseId, messageId, emoji, action);
  }, [supabaseId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    await socketService.deleteMessage(supabaseId, messageId);
  }, [supabaseId]);

  const sendTypingIndicator = useCallback((recipientId: string, username: string) => {
    socketService.sendTyping(supabaseId, recipientId, username);
  }, [supabaseId]);

  const startOrSelectConversation = useCallback(async (partner: StudexUser) => {
    let existing = conversations.find(c =>
      c.partner.supabaseId === partner.supabaseId ||
      (c.partner as any)._id?.toString() === (partner as any)._id?.toString()
    );

    if (!existing) {
      try {
        const res = await socketService.startDM(supabaseId, (partner as any).supabaseId || (partner as any)._id);
        if (res?.conversation) {
          existing = res.conversation;
          setConversations(prev => [existing!, ...prev]);
        }
      } catch {
        existing = {
          _id: (partner as any).supabaseId || (partner as any)._id,
          partner,
          unreadCount: 0,
        };
        setConversations(prev => {
          if (prev.some(c => c._id === existing._id)) return prev;
          return [existing!, ...prev];
        });
      }
    } else {
      setConversations(prev => {
        const others = prev.filter(c => c._id !== existing!._id);
        return [existing!, ...others];
      });
    }

    setActiveConversation(existing);
    await loadHistory(existing._id);
    await markRead(existing._id);
  }, [conversations, supabaseId, loadHistory, markRead]);

  const sendFriendRequestFn = useCallback(async (recipientId: string) => {
    const username = currentUser?.username || 'User';
    const avatar = currentUser?.avatar || '';
    await socketService.sendFriendRequest(supabaseId, recipientId, username, avatar);
  }, [supabaseId, currentUser]);

  const acceptFriendRequest = useCallback(async (requesterId: string, requesterObj?: any) => {
    await socketService.acceptFriend(supabaseId, requesterId, requesterObj);
  }, [supabaseId]);

  const rejectFriendRequest = useCallback(async (requesterId: string) => {
    await socketService.rejectFriend(supabaseId, requesterId);
    setFriendRequests(prev => prev.filter(r => r._id !== requesterId));
  }, [supabaseId]);

  const unfriend = useCallback(async (friendId: string) => {
    await socketService.unfriend(supabaseId, friendId);
    if (activeConversation && (
      (activeConversation.partner as any)._id?.toString() === friendId?.toString() ||
      activeConversation.partner.supabaseId === friendId
    )) {
      setActiveConversation(null);
    }
  }, [supabaseId, activeConversation]);

  const refreshConversations = useCallback(async () => {
    await socketService.refreshConversations(supabaseId);
  }, [supabaseId]);

  // ── Channel Actions ─────────────────────────────────────

  const selectChannel = useCallback(async (channel: StudexChannel) => {
    // Don't reload if already viewing this channel
    if (activeView?.type === 'channel' && activeView.channel._id === channel._id) return;

    // Join socket room and load history
    try {
      setLoading(true);
      const res = await socketService.joinChannel(supabaseId, channel._id);

      // Seed messages from server response
      if (res?.messages) {
        const msgs = res.messages.map((m: any) => ({ ...m, channelId: channel._id, createdAt: new Date(m.createdAt) }));
        setChannelMessages(prev => {
          const updated = new Map(prev);
          updated.set(channel._id, msgs);
          return updated;
        });
      }

      setActiveView({ type: 'channel', channel: { ...channel, ...res?.channel } });
      // Clear unread badge for this channel
      setChannelUnread(prev => { const n = new Map(prev); n.delete(channel._id); return n; });
      // Mark as seen
      socketService.markChannelSeen(supabaseId, channel._id);
    } catch (err) {
      console.error('Failed to join channel:', err);
    } finally {
      setLoading(false);
    }
  }, [activeView, supabaseId]);

  const sendChannelMessage = useCallback(async (text: string, type: string = 'text', imageUrl?: string, replyTo?: any) => {
    if (!activeView || activeView.type !== 'channel') return;
    const { channel } = activeView;
    await socketService.sendChannelMessage({ supabaseId, channelId: channel._id, text: text.trim(), type, imageUrl, replyTo });
    socketService.stopChannelTyping(supabaseId, channel._id);
  }, [activeView, supabaseId]);

  const sendChannelTyping = useCallback((username: string) => {
    if (!activeView || activeView.type !== 'channel') return;
    socketService.sendChannelTyping(supabaseId, username, activeView.channel._id);
    if (isTypingRef.current) return;
    isTypingRef.current = true;
    const timer = setTimeout(() => {
      isTypingRef.current = false;
      socketService.stopChannelTyping(supabaseId, activeView.channel._id);
    }, 2000);
  }, [activeView, supabaseId]);

  const reactToChannelMessage = useCallback(async (messageId: string, emoji: string, action: 'add' | 'remove' = 'add') => {
    await socketService.reactChannelMessage(supabaseId, messageId, emoji, action);
  }, [supabaseId]);

  const loadMoreChannelHistory = useCallback(async (channelId: string, page: number) => {
    try {
      const { messages: msgs } = await socketService.loadChannelHistory(channelId, page);
      const enriched = msgs.map((m: any) => ({ ...m, channelId, createdAt: new Date(m.createdAt) }));
      setChannelMessages(prev => {
        const updated = new Map(prev);
        const existing = updated.get(channelId) || [];
        updated.set(channelId, [...enriched, ...existing]);
        return updated;
      });
      setHistoryPage(prev => new Map(prev).set(channelId, page));
    } catch (err) { console.error('Load channel history error:', err); }
  }, []);

  const createChannel = useCallback(async (name: string, description?: string, isPrivate?: boolean) => {
    const result = await socketService.createChannelREST({ name, description, isPrivate, createdBy: supabaseId });
    return result;
  }, [supabaseId]);

  /** Manually add a channel to the sidebar list (used when REST creates it but socket event hasn't arrived yet) */
  const addChannelToList = useCallback((channel: StudexChannel) => {
    setChannels(prev => {
      if (prev.some(c => c._id === channel._id)) return prev;
      return [{ ...channel, isMember: true }, ...prev];
    });
  }, []);

  const joinChannelById = useCallback(async (channelId: string) => {
    return socketService.joinChannelREST(channelId, supabaseId);
  }, [supabaseId]);

  const leaveChannelView = useCallback(() => {
    if (activeView?.type === 'channel') {
      socketService.leaveChannel(supabaseId, activeView.channel._id);
    }
    setActiveView(null);
  }, [activeView, supabaseId]);

  return {
    // ── Core ────────────────────────────────────────────
    connected,
    currentUser,
    loading,
    // ── DM state ────────────────────────────────────────
    conversations,
    friends,
    friendRequests,
    onlineUsers,
    messages,
    activeConversation,    // legacy — use activeView instead
    typing,
    historyPage,
    hasMoreHistory: Object.fromEntries(hasMoreHistory),
    setActiveConversation,
    // ── Channel state ───────────────────────────────────
    channels,
    channelMessages,        // Map<channelId, ChannelMessage[]>
    activeView,
    channelTyping,
    channelUnread,
    setActiveView,
    // ── Message actions ─────────────────────────────────
    sendMessage,
    loadHistory,
    markRead,
    reactToMessage,
    deleteMessage,
    sendTypingIndicator,
    startOrSelectConversation,
    // ── Friend actions ──────────────────────────────────
    sendFriendRequest: sendFriendRequestFn,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    refreshConversations,
    // ── Channel actions ─────────────────────────────────
    addChannelToList,
    selectChannel,
    sendChannelMessage,
    sendChannelTyping,
    reactToChannelMessage,
    loadMoreChannelHistory,
    createChannel,
    joinChannelById,
    leaveChannelView,
  };
};