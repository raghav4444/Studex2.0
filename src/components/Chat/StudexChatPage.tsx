import React, { useState, useCallback } from 'react';
import { useStudexChat, StudexUser, StudexConversation, StudexChannel, ActiveView, ChannelMessage } from '../../hooks/useStudexChat';
import { useAuth } from '../AuthProvider';
import ParticleCanvas from './ParticleCanvas';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';

const StudexChatPage: React.FC = () => {
  const { user } = useAuth();
  const {
    connected,
    conversations,
    channels,
    friends,
    friendRequests,
    onlineUsers,
    messages: allMessages,
    activeView,
    typing,
    channelTyping,
    channelMessages,
    loading,
    hasMoreHistory,
    setActiveView,
    sendMessage,
    loadHistory,
    markRead,
    reactToMessage,
    deleteMessage,
    sendTypingIndicator,
    startOrSelectConversation,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    selectChannel,
    sendChannelMessage,
    sendChannelTyping,
    reactToChannelMessage,
    loadMoreChannelHistory,
    createChannel,
    addChannelToList,
    joinChannelById,
    leaveChannelView,
  } = useStudexChat();

  const [mobileSidebar, setMobileSidebar] = useState(true);

  // ═══════════════════════════════════════════════════════
  // ── Channel handlers ──────────────────────────────────
  // ═══════════════════════════════════════════════════════

  const handleSelectChannel = useCallback(async (channel: StudexChannel) => {
    setMobileSidebar(false);
    localStorage.setItem('studex_last_channel', channel._id); // persist selection
    await selectChannel(channel);
  }, [selectChannel]);

  const handleCreateChannel = useCallback(async (name: string, description: string, isPrivate: boolean) => {
    const result = await createChannel(name, description, isPrivate);

    if (result?.channel) {
      const newChannel: StudexChannel = {
        ...result.channel,
        memberCount: result.channel.memberCount ?? 1,
        isMember: true,
        createdAt: new Date(result.channel.createdAt),
      };

      // Update UI immediately — don't wait for socket work
      addChannelToList(newChannel);             // 1. sidebar list
      setActiveView({ type: 'channel', channel: newChannel }); // 2. right panel
      localStorage.setItem('studex_last_channel', newChannel._id); // 3. persist

      // Join socket room in background — don't await (socket may not be ready yet)
      selectChannel(newChannel).catch(console.error);
    }
  }, [createChannel, addChannelToList, selectChannel, setActiveView]);

  // Auto-join the general channel on first load (or last viewed channel)
  React.useEffect(() => {
    if (channels.length === 0 || activeView) return; // not ready or already viewing something

    // 1. Try to restore last viewed channel from localStorage
    const lastId = localStorage.getItem('studex_last_channel');
    if (lastId) {
      const last = channels.find(c => c._id === lastId);
      if (last) {
        console.log('[Chat] Restoring last viewed channel:', last.name);
        selectChannel(last);
        return;
      }
    }

    // 2. Fall back to #general
    const general = channels.find(c => c.name === 'general');
    if (general) selectChannel(general);
  }, [channels.length, activeView, selectChannel]);

  // ── Restore activeView from localStorage on initial load ──
  // This runs when activeView changes from null (during socket join) to the joined channel
  React.useEffect(() => {
    if (!activeView || activeView.type !== 'channel') return;
    const cid = activeView.channel._id;
    const stored = localStorage.getItem('studex_last_channel');
    if (stored !== cid) {
      localStorage.setItem('studex_last_channel', cid);
      console.log('[Chat] Saved active channel to localStorage:', activeView.channel.name);
    }
  }, [activeView]);

  // ═══════════════════════════════════════════════════════
  // ── DM handlers ─────────────────────────────────────
  // ═══════════════════════════════════════════════════════

  const handleSelectDM = useCallback(async (conv: StudexConversation) => {
    setMobileSidebar(false);
    setActiveView({ type: 'dm', conversation: conv });
    await startOrSelectConversation(conv.partner);
  }, [setActiveView, startOrSelectConversation]);

  const handleSearchUser = useCallback(async (query: string): Promise<StudexUser[]> => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/users?q=${encodeURIComponent(query)}&supabaseId=${user?.supabaseId || ''}`
      );
      return res.json() || [];
    } catch { return []; }
  }, [user?.supabaseId]);

  const handleNewDM = useCallback(async (userId: string) => {
    // Find or create DM conversation
    const conv = conversations.find(c => (c.partner.supabaseId || (c.partner as any)._id) === userId);
    if (conv) {
      await handleSelectDM(conv);
      return;
    }
    // Start a new DM (socket will create conversation)
    await startOrSelectConversation({ _id: userId, supabaseId: userId } as any);
  }, [conversations, handleSelectDM, startOrSelectConversation]);

  const handleBack = () => {
    leaveChannelView();
    setMobileSidebar(true);
  };

  // ═══════════════════════════════════════════════════════
  // ── Messages for active view ───────────────────────
  // ═══════════════════════════════════════════════════════

  const getViewMessages = (): (any | ChannelMessage)[] => {
    if (!activeView) return [];

    if (activeView.type === 'channel') {
      return channelMessages.get(activeView.channel._id) || [];
    } else {
      const key = activeView.conversation.partner.supabaseId || (activeView.conversation.partner as any)._id as string;
      return allMessages.get(key) || [];
    }
  };

  const getTyping = () => {
    if (!activeView) return undefined;
    if (activeView.type === 'channel') {
      const t = channelTyping[activeView.channel._id];
      return t ? { username: t.username } : undefined;
    }
    const key = activeView.conversation.partner.supabaseId || (activeView.conversation.partner as any)._id;
    return typing[key];
  };

  const getHasMore = () => {
    if (!activeView) return false;
    if (activeView.type === 'channel') {
      return (hasMoreHistory as any)?.[activeView.channel._id] ?? false;
    }
    return false; // DMs handled separately
  };

  // ═══════════════════════════════════════════════════════
  // ── Send message (routes to channel or DM) ──────
  // ═══════════════════════════════════════════════════════

  const handleSendMessage = useCallback(async (text: string, type?: string, imageUrl?: string, replyTo?: any) => {
    if (activeView?.type === 'channel') {
      const res = await sendChannelMessage(text, type, imageUrl, replyTo);
      if (res?.status === 'error') {
        console.error('Failed to send channel message:', res.message);
      }
    } else {
      await sendMessage(text, type, imageUrl, replyTo);
    }
  }, [activeView, sendMessage, sendChannelMessage]);

  const handleReact = useCallback(async (msgId: string, emoji: string, action: 'add' | 'remove') => {
    if (activeView?.type === 'channel') {
      await reactToChannelMessage(msgId, emoji, action);
    } else {
      await reactToMessage(msgId, emoji, action);
    }
  }, [activeView, reactToMessage, reactToChannelMessage]);

  return (
    <div
       className="flex flex-row w-full h-full overflow-hidden relative"
      style={{ minHeight: 0 }}
    >
      {/* ── Aurora Canvas ──────────────────── */}
      <div className="absolute inset-0 z-0">
        <ParticleCanvas />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 15% 15%, rgba(99,102,241,0.06) 0%, transparent 70%), radial-gradient(ellipse 70% 60% at 85% 85%, rgba(168,85,247,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Sidebar ──────────────────────── */}
      <div
        className={[
          'relative flex-shrink-0 flex flex-col h-full z-10 transition-all duration-200 w-full md:w-[288px]',
          mobileSidebar ? 'md:flex' : 'w-0 overflow-hidden md:flex',
        ].join(' ')}
      >
        <ChatSidebar
          conversations={conversations}
          channels={channels}
          friends={friends}
          friendRequests={friendRequests}
          activeView={activeView}
          onlineUsers={onlineUsers}
          typing={typing}
          connected={connected}
          onSelectChannel={handleSelectChannel}
          onSelectDM={handleSelectDM}
          onSearchUser={handleSearchUser}
          onSendFriendRequest={sendFriendRequest}
          onAcceptFriend={acceptFriendRequest}
          onRejectFriend={rejectFriendRequest}
          onUnfriend={unfriend}
          onCreateChannel={handleCreateChannel}
          onNewDM={handleNewDM}
        />
      </div>

      {/* ── Chat Window ──────────────────── */}
      <div
        className={[
          'relative flex flex-col min-w-0 h-full z-10 transition-all duration-200 min-h-0',
          activeView ? 'flex-1 md:flex' : 'hidden md:flex md:flex-1',
        ].join(' ')}
      >
        {activeView ? (
          <ChatWindow
            activeView={activeView}
            messages={getViewMessages()}
            typing={getTyping()}
            currentUserId={user?.supabaseId || user?.id || ''}
            loading={loading}
            hasMore={getHasMore()}
            onSendMessage={handleSendMessage}
            onLoadMore={() => {
              if (!activeView) return;
              if (activeView.type === 'channel') {
                const page = ((window as any).__channelPage || 1) + 1;
                (window as any).__channelPage = page;
                loadMoreChannelHistory(activeView.channel._id, page);
              } else {
                const key = activeView.conversation.partner.supabaseId || (activeView.conversation.partner as any)._id;
                const page = ((window as any).__dmPage || 1) + 1;
                (window as any).__dmPage = page;
                loadHistory(key, page);
              }
            }}
            onMarkRead={() => {
              if (activeView?.type === 'channel') markRead(activeView.channel._id);
              else markRead(activeView.conversation.partner.supabaseId || (activeView.conversation.partner as any)._id);
            }}
            onReact={handleReact}
            onDelete={deleteMessage}
            onTyping={() => {
              if (activeView?.type === 'channel') sendChannelTyping(user?.username || 'User');
              else sendTypingIndicator(activeView.conversation.partner.supabaseId || (activeView.conversation.partner as any)._id, user?.username || 'User');
            }}
            onBack={handleBack}
          />
        ) : (
          <EmptyState onlineUsers={onlineUsers} />
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ onlineUsers: any[] }> = ({ onlineUsers }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center px-6">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/5">
        <span className="text-3xl">#</span>
      </div>
      <h2 className="text-2xl font-bold text-white/90 mb-3">Studex Chat</h2>
      <p className="text-gray-600 text-sm max-w-xs mx-auto leading-relaxed mb-8">
        Select a channel or conversation from the sidebar. Create channels for groups, topics, and events.
      </p>
      {onlineUsers.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 5).map((u: any, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-black overflow-hidden">
                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-sm">{onlineUsers.length} online</p>
        </div>
      )}
    </div>
  </div>
);

export default StudexChatPage;