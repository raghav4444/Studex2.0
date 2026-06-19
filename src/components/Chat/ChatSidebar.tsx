import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, UserPlus, UserMinus, Lock, Hash, Users, Sparkles, MessageSquare, Radio, Plus } from 'lucide-react';
import {
  StudexUser, StudexConversation, StudexChannel, FriendRequest
} from '../../hooks/useStudexChat';
import { CreateChannelModal } from './CreateChannelModal';
import { UsersPanel } from './UsersPanel';

interface ChatSidebarProps {
  conversations: StudexConversation[];
  channels: StudexChannel[];
  friends: StudexUser[];
  friendRequests: FriendRequest[];
  activeView: { type: 'dm'; conversation: StudexConversation } | { type: 'channel'; channel: StudexChannel } | null;
  onlineUsers: StudexUser[];
  typing: Record<string, { username: string }>;
  connected: boolean;
  onSelectChannel: (channel: StudexChannel) => void;
  onSelectDM: (conv: StudexConversation) => void;
  onSearchUser: (query: string) => Promise<StudexUser[]>;
  onSendFriendRequest: (userId: string) => void;
  onAcceptFriend: (userId: string, req: FriendRequest) => void;
  onRejectFriend: (userId: string) => void;
  onUnfriend: (userId: string) => void;
  onCreateChannel: (name: string, description: string, isPrivate: boolean) => Promise<void>;
  onNewDM: (userId: string) => void;
}

const AVATAR_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-purple-600',
];

// ── DM Item row ────────────────────────────────────────────────
const DMItem: React.FC<{
  conversation: StudexConversation;
  isActive: boolean;
  onSelect: () => void;
}> = ({ conversation, onSelect, isActive }) => {
  const partner = conversation.partner;
  const colorIdx = Math.abs(partner.username?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIdx];

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-blue-500/20 border border-blue-500/30'
          : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-lg ring-2 ring-transparent group-hover:ring-white/10 transition-all`}>
          {partner.avatar
            ? <img src={partner.avatar} className="w-full h-full object-cover" />
            : partner.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        {partner.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0d1016] shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-300' : 'text-gray-200'} group-hover:text-white transition-colors`}>
          {partner.name}
        </p>
        <p className="text-xs text-gray-500 truncate">@{partner.username}</p>
      </div>
      {conversation.unreadCount > 0 && (
        <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-lg shadow-blue-500/30">
          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
        </span>
      )}
    </div>
  );
};

// ── Main Sidebar ─────────────────────────────────────────────
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations, channels, friends, friendRequests,
  activeView, connected, typing, onlineUsers,
  onSelectChannel, onSelectDM, onSearchUser,
  onSendFriendRequest, onAcceptFriend, onRejectFriend, onUnfriend,
  onCreateChannel, onNewDM,
}) => {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDMsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'channels' | 'dms' | 'people'>('channels');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [channelSearch, setChannelSearch] = useState('');
  const requestsRef = useRef<HTMLDivElement>(null);

  const isOnline = useCallback((user: StudexUser) =>
    onlineUsers.some(o => (o._id || o.supabaseId) === (user._id || user.supabaseId)), [onlineUsers]);

  const activeChannelId = activeView?.type === 'channel' ? activeView.channel._id : null;
  const activeDMId = activeView?.type === 'dm'
    ? (activeView.conversation.partner.supabaseId || (activeView.conversation.partner as any)._id)
    : null;

  const existingChannelNames = channels.map(c => c.name);

  const filteredChannels = channels.filter(ch =>
    ch.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  // Close requests dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (requestsRef.current && !requestsRef.current.contains(e.target as Node)) {
        setShowRequests(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0d1016]/95 backdrop-blur-2xl border-r border-white/[0.06] overflow-hidden">

      {/* ── Header ── */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <MessageSquare className="w-4.5 h-4.5 text-white" />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d1016] ${connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-gray-600'}`} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Studex Chat</p>
              <p className={`text-[10px] ${connected ? 'text-emerald-400' : 'text-gray-500'}`}>
                {connected ? 'Connected' : 'Connecting...'}
              </p>
            </div>
          </div>
          {/* Friend requests */}
          <div className="relative" ref={requestsRef}>
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="relative p-2 hover:bg-white/5 rounded-xl transition text-gray-400 hover:text-white"
            >
              <UserPlus className="w-4 h-4" />
              {friendRequests.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-pink-500/30">
                  {friendRequests.length}
                </span>
              )}
            </button>
            {showRequests && (
              <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-[#161b22] shadow-2xl shadow-black/30 z-50 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-pink-400" />
                    Friend Requests
                  </span>
                  <button onClick={() => setShowRequests(false)} className="p-1 hover:bg-white/5 rounded-lg transition">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {friendRequests.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No pending requests</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {friendRequests.map(req => (
                      <div key={req._id} className="flex items-center gap-3 p-3 hover:bg-white/[0.03] border-b border-white/5 last:border-b-0 transition">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[Math.abs(req.fromUsername?.charCodeAt(0) || 0) % 6]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden`}>
                          {req.fromAvatar ? <img src={req.fromAvatar} className="w-full h-full object-cover" /> : req.fromName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{req.fromName}</p>
                          <p className="text-gray-500 text-xs truncate">@{req.fromUsername}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { onAcceptFriend(req._id, req); setShowRequests(false); }}
                            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition text-xs font-medium"
                          >Accept</button>
                          <button
                            onClick={() => { onRejectFriend(req._id); setShowRequests(false); }}
                            className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded-lg transition"
                          >
                            <X className="w-4 h-4 text-gray-500 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex p-1.5 bg-white/[0.03] rounded-xl border border-white/5">
          <TabButton
            active={activeTab === 'channels'}
            onClick={() => setActiveTab('channels')}
            icon={<Hash className="w-3.5 h-3.5" />}
            label="Channels"
          />
          <TabButton
            active={activeTab === 'dms'}
            onClick={() => setActiveTab('dms')}
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            label="Messages"
            badge={conversations.length}
          />
          <TabButton
            active={activeTab === 'people'}
            onClick={() => setActiveTab('people')}
            icon={<Users className="w-3.5 h-3.5" />}
            label="People"
          />
        </div>
      </div>

      {/* ── Channel Search (channels tab) ── */}
      {activeTab === 'channels' && (
        <div className="px-4 py-3 border-b border-white/[0.05]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={channelSearch}
              onChange={e => setChannelSearch(e.target.value)}
              placeholder="Search channels..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-500 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition"
            />
          </div>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Channels tab */}
        {activeTab === 'channels' && (
          <div className="p-3 border-b border-white/[0.05]">
            <div className="w-full flex items-center justify-between px-2 py-2 mb-2">
              <button
                onClick={() => setChannelsOpen(!channelsOpen)}
                className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-400 transition"
              >
                <span className={`transition-transform ${channelsOpen ? 'rotate-90' : ''}`}>
                  <Radio className="w-3 h-3" />
                </span>
                Channels {channels.length}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-1.5 hover:bg-blue-500/20 rounded-lg text-gray-500 hover:text-blue-400 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {channelsOpen && (
              <div className="space-y-1">
                {filteredChannels.length > 0 ? filteredChannels.map(ch => (
                  <button
                    key={ch._id}
                    onClick={() => onSelectChannel(ch)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      activeChannelId === ch._id
                        ? 'bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    {ch.isPrivate
                      ? <Lock className="w-4 h-4 flex-shrink-0 text-gray-600" />
                      : <Hash className="w-4 h-4 flex-shrink-0 text-gray-600" />
                    }
                    <span className="truncate">{ch.name}</span>
                    {ch.memberCount && (
                      <span className="ml-auto text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded-full">
                        {ch.memberCount}
                      </span>
                    )}
                  </button>
                )) : (
                  <div className="p-4 text-center">
                    <Hash className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-600 text-xs mb-3">
                      {channelSearch ? 'No channels match your search' : 'No channels yet'}
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="text-blue-400 text-xs hover:text-blue-300 transition flex items-center gap-1.5 mx-auto"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create channel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DMs tab */}
        {activeTab === 'dms' && (
          <div className="p-3">
            <div className="w-full flex items-center gap-2 px-2 py-2 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span className={`transition-transform ${dmsOpen ? 'rotate-90' : ''}`}>
                <Radio className="w-3 h-3" />
              </span>
              Messages {conversations.length}
            </div>
            {dmsOpen && (
              <div className="space-y-1">
                {conversations.length > 0 ? conversations.map(conv => (
                  <DMItem
                    key={(conv.partner.supabaseId || (conv.partner as any)._id) as string}
                    conversation={conv}
                    isActive={activeDMId === (conv.partner.supabaseId || (conv.partner as any)._id)}
                    onSelect={() => onSelectDM(conv)}
                  />
                )) : (
                  <div className="p-4 text-center">
                    <MessageSquare className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-600 text-xs mb-3">No conversations yet</p>
                    <button
                      onClick={() => setActiveTab('people')}
                      className="text-blue-400 text-xs hover:text-blue-300 transition flex items-center gap-1.5 mx-auto"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Start a chat
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* People tab */}
        {activeTab === 'people' && (
          <UsersPanel
            currentUserId={(onlineUsers[0] as any)?.supabaseId || ''}
            onStartDM={(userId) => { onNewDM(userId); setActiveTab('dms'); }}
            onSendFriendRequest={onSendFriendRequest}
            onlineUsers={onlineUsers}
          />
        )}
      </div>

      {/* ── Footer ── */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 4).map((u: any, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[9px] font-bold border-2 border-[#0d1016] overflow-hidden"
              >
                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : (u.name?.[0] ?? '?')}
              </div>
            ))}
            {onlineUsers.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-[9px] font-bold border-2 border-[#0d1016]">
                +{onlineUsers.length - 4}
              </div>
            )}
          </div>
          <p className="text-gray-500 text-xs">{onlineUsers.length} online</p>
        </div>
      </div>

      {/* ── Create channel modal ── */}
      {showCreateModal && (
        <CreateChannelModal
          existingChannelNames={existingChannelNames}
          onCreate={(name, description, isPrivate) => {
            onCreateChannel(name, description, isPrivate);
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

// ── Tab Button sub-component ─────────────────────────────────
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-all relative rounded-lg ${
      active
        ? 'text-white bg-blue-500/20 shadow-lg shadow-blue-500/10'
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
    }`}
  >
    {icon}
    {label}
    {!active && badge !== undefined && badge > 0 && (
      <span className="w-4 h-4 bg-white/10 rounded-full text-[9px] font-bold flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

export default ChatSidebar;