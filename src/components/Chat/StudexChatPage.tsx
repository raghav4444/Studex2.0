import React, { useState, useCallback } from 'react';
import { useStudexChat, StudexUser, StudexConversation, StudexChannel, ChannelMessage } from '../../hooks/useStudexChat';
import { useAuth } from '../AuthProvider';
import ParticleCanvas from './ParticleCanvas';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { MessageSquare, Hash, Users, Sparkles, Globe } from 'lucide-react';

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
    leaveChannelView,
  } = useStudexChat();

  const [mobileSidebar, setMobileSidebar] = useState(true);

  // ── Stats ──────────────────────────────────────────────────────────
  const stats = React.useMemo(() => ({
    channels: channels.length,
    conversations: conversations.length,
    friends: friends.length,
    online: onlineUsers.length,
  }), [channels.length, conversations.length, friends.length, onlineUsers.length]);

  // ═══════════════════════════════════════════════════════
  // ── Channel handlers ──────────────────────────────────
  // ═══════════════════════════════════════════════════════

  const handleSelectChannel = useCallback(async (channel: StudexChannel) => {
    setMobileSidebar(false);
    localStorage.setItem('studex_last_channel', channel._id);
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

      addChannelToList(newChannel);
      setActiveView({ type: 'channel', channel: newChannel });
      localStorage.setItem('studex_last_channel', newChannel._id);

      selectChannel(newChannel).catch(console.error);
    }
  }, [createChannel, addChannelToList, selectChannel, setActiveView]);

  // Auto-join the general channel on first load
  React.useEffect(() => {
    if (channels.length === 0 || activeView) return;

    const lastId = localStorage.getItem('studex_last_channel');
    if (lastId) {
      const last = channels.find(c => c._id === lastId);
      if (last) {
        console.log('[Chat] Restoring last viewed channel:', last.name);
        selectChannel(last);
        return;
      }
    }

    const general = channels.find(c => c.name === 'general');
    if (general) selectChannel(general);
  }, [channels.length, activeView, selectChannel]);

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
    if (!query.trim() || query.length < 2) return [];
    try {
      const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(
        `${serverUrl}/api/users?q=${encodeURIComponent(query)}&supabaseId=${user?.supabaseId || ''}&limit=12`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.users || data || [];
    } catch { return []; }
  }, [user?.supabaseId]);

  const handleNewDM = useCallback(async (userId: string) => {
    const conv = conversations.find(c => (c.partner.supabaseId || (c.partner as any)._id) === userId);
    if (conv) {
      await handleSelectDM(conv);
      return;
    }
    await startOrSelectConversation({ _id: userId, supabaseId: userId } as any);
  }, [conversations, handleSelectDM, startOrSelectConversation]);

  const handleBack = () => {
    leaveChannelView();
    setMobileSidebar(true);
  };

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
    return false;
  };

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
    <div className="flex flex-row w-full h-full overflow-hidden relative" style={{ minHeight: 0 }}>
      {/* ── Aurora Canvas ──────────────────── */}
      <div className="absolute inset-0 z-0">
        <ParticleCanvas />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 15% 15%, rgba(59,130,246,0.08) 0%, transparent 70%), radial-gradient(ellipse 70% 60% at 85% 85%, rgba(168,85,247,0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Sidebar ──────────────────────── */}
      <div
        className={[
          'relative flex-shrink-0 flex flex-col h-full z-10 transition-all duration-200 w-full md:w-[300px]',
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
          <EmptyState onlineUsers={onlineUsers} stats={stats} />
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ onlineUsers: any[]; stats: any }> = ({ onlineUsers, stats }) => (
  <div className="h-full flex items-center justify-center p-6">
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b1020] via-[#0d1117] to-[#161b22] shadow-[0_24px_80px_rgba(0,0,0,0.45)] max-w-2xl w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_28%)]" />
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-20 left-12 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative p-6 sm:p-8 md:p-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-200 mb-6">
          <Sparkles className="h-3.5 w-3.5" /> Studex Chat
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/5">
          <MessageSquare className="w-10 h-10 text-blue-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white/90 text-center mb-3">
          Connect & Collaborate
        </h2>
        <p className="text-gray-400 text-sm text-center max-w-md mx-auto leading-relaxed mb-8">
          Select a channel or conversation from the sidebar. Join channels for topics, events, and study groups, or start a direct message.
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
          {[
            { label: "Channels", value: stats.channels, icon: Hash },
            { label: "Messages", value: stats.conversations, icon: MessageSquare },
            { label: "Friends", value: stats.friends, icon: Users },
            { label: "Online", value: stats.online, icon: Globe },
          ].map((s) => (
            <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.05]">
              <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-blue-500/5 blur-xl group-hover:bg-blue-500/8" />
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500">{s.label}</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-bold text-white tabular-nums leading-none">{s.value}</span>
                <s.icon className="h-4 w-4 text-gray-600 mb-0.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Online Users */}
        {onlineUsers.length > 0 && (
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 5).map((u: any, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-[#0d1016] overflow-hidden">
                  {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name?.[0]?.toUpperCase()}
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-sm">{onlineUsers.length} users online</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default StudexChatPage;