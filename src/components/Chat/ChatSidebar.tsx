import { useState, useRef, useCallback } from 'react';
import { Search, X, UserPlus, UserMinus, Lock, Hash, Users } from 'lucide-react';
import {
  StudexUser, StudexConversation, StudexChannel, FriendRequest
} from '../../hooks/useStudexChat';
import { CreateChannelModal } from './CreateChannelModal';

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

const DM_AVATAR_FALLBACK_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
];

// ── Sidebar sections ────────────────────────────────────────
export const ChannelItem: React.FC<{
  channel: StudexChannel;
  isActive: boolean;
  onSelect: () => void;
}> = ({ channel, isActive, onSelect }) => (
  <button
    onClick={onSelect}
    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition group ${isActive ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}
  >
    {channel.isPrivate
      ? <Lock className="w-4 h-4 flex-shrink-0 text-gray-600" />
      : <Hash className="w-4 h-4 flex-shrink-0 text-gray-600" />
    }
    <span className="truncate">{channel.name}</span>
    {channel.memberCount > 0 && (
      <span className="ml-auto text-[10px] text-gray-600 flex items-center gap-0.5">
        <Users className="w-3 h-3" />{channel.memberCount}
      </span>
    )}
  </button>
);

export const DMItem: React.FC<{
  conversation: StudexConversation;
  isActive: boolean;
  onSelect: () => void;
}> = ({ conversation, isActive, onSelect }) => {
  const partner = conversation.partner;
  const colorIdx = Math.abs(partner.username?.charCodeAt(0) || 0) % DM_AVATAR_FALLBACK_COLORS.length;
  const color = DM_AVATAR_FALLBACK_COLORS[colorIdx];

  return (
    <div className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition group ${isActive ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
      <button
        onClick={onSelect}
        className="flex-1 flex items-center gap-2.5"
      >
        <div className="relative flex-shrink-0">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold overflow-hidden`}>
            {partner.avatar
              ? <img src={partner.avatar} className="w-full h-full object-cover" />
              : partner.name?.[0]?.toUpperCase()
            }
          </div>
          {partner.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#09090b]" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="truncate">{partner.name}</p>
          <p className="truncate text-xs text-gray-600">@{partner.username}</p>
        </div>
        {conversation.unreadCount > 0 && (
          <span className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
          </span>
        )}
      </button>
      <div
        onClick={e => { e.stopPropagation(); }}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition flex-shrink-0 cursor-pointer"
        title="Unfriend"
      >
        <UserMinus className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

// ── User Search for new DMs ─────────────────────────────────
const NewDMSearch: React.FC<{
  onSearch: (q: string) => Promise<StudexUser[]>;
  onSelect: (userId: string) => void;
  onClose: () => void;
}> = ({ onSearch, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StudexUser[]>([]);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const search = (q: string) => {
    setQuery(q);
    clearTimeout(timer.current);
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    timer.current = setTimeout(async () => {
      try { setResults(await onSearch(q)); }
      finally { setSearching(false); }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-12 px-4">
      <button onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close" />
      <div className="relative w-full max-w-md bg-[#13131a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <input
            autoFocus
            value={query}
            onChange={e => search(e.target.value)}
            placeholder="Search people..."
            className="flex-1 text-sm text-white placeholder-gray-500 bg-transparent focus:outline-none"
          />
          {query && <button onClick={() => search('')}><X className="w-3.5 h-3.5 text-gray-500" /></button>}
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
        {searching && <p className="text-gray-600 text-xs text-center py-4">Searching...</p>}
        {!searching && results.length === 0 && query && <p className="text-gray-600 text-xs text-center py-4">No users found</p>}
        {results.map(u => (
          <button
            key={u._id}
            onClick={() => { onSelect(u.supabaseId || (u as any)._id); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition"
          >
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${DM_AVATAR_FALLBACK_COLORS[Math.abs(u.username?.charCodeAt(0) || 0) % 5]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden`}>
              {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-sm font-medium truncate">{u.name}</p>
              <p className="text-gray-500 text-xs truncate">@{u.username} · {u.college}</p>
            </div>
            <UserPlus className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          </button>
        ))}
        {!query && <p className="text-gray-600 text-xs text-center py-4">Type to search for people</p>}
      </div>
      </div>
    </div>
  );
};

// ── Main Sidebar ─────────────────────────────────────────────
const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations, channels, friends, friendRequests,
  activeView, connected, typing, onlineUsers,
  onSelectChannel, onSelectDM, onSearchUser,
  onSendFriendRequest, onAcceptFriend, onRejectFriend, onUnfriend,
  onCreateChannel, onNewDM,
}) => {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDMsOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDMSearch, setShowDMSearch] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const requestsRef = useRef<HTMLDivElement>(null);

  // ── Helpers ───────────────────────────────────────────────
  const isOnline = useCallback((user: StudexUser) =>
    onlineUsers.some(o => (o._id || o.supabaseId) === (user._id || user.supabaseId)), [onlineUsers]);

  const activeChannelId = activeView?.type === 'channel' ? activeView.channel._id : null;
  const activeDMId = activeView?.type === 'dm' ? (activeView.conversation.partner.supabaseId || (activeView.conversation.partner as any)._id) : null;

  const formatTime = (date?: Date) => {
    if (!date) return '';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  const existingChannelNames = channels.map(c => c.name);

  return (
    <div className="h-full flex flex-col bg-[#09090b]/90 backdrop-blur-2xl border-r border-white/[0.06] overflow-hidden">
      {/* ── Header ─────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#09090b] ${connected ? 'bg-emerald-400' : 'bg-gray-600'}`} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Studex Chat</p>
              <p className="text-gray-600 text-[10px]">{connected ? 'Connected' : 'Connecting...'}</p>
            </div>
          </div>
          {/* Friend requests button */}
          <div className="relative" ref={requestsRef}>
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="relative p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
            >
              <UserPlus className="w-4 h-4" />
              {friendRequests.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                  {friendRequests.length}
                </span>
              )}
            </button>

            {/* Requests dropdown */}
            {showRequests && (
              <div className="absolute top-full right-0 mt-1 w-72 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-white font-medium text-sm">Friend Requests</span>
                  <button onClick={() => setShowRequests(false)}><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                {friendRequests.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-6">No pending requests</p>
                ) : (
                  friendRequests.map(req => (
                    <div key={req._id} className="flex items-center gap-3 p-3 hover:bg-white/[0.03] border-b border-white/5 last:border-0">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${DM_AVATAR_FALLBACK_COLORS[Math.abs(req.fromUsername?.charCodeAt(0) || 0) % 5]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden`}>
                        {req.fromAvatar ? <img src={req.fromAvatar} className="w-full h-full object-cover" /> : req.fromName[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{req.fromName}</p>
                        <p className="text-gray-600 text-xs truncate">{req.fromCollege}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { onAcceptFriend(req._id, req); setShowRequests(false); }}
                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition"
                        >
                          <span className="text-xs">✓</span>
                        </button>
                        <button
                          onClick={() => { onRejectFriend(req._id); setShowRequests(false); }}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input
            placeholder="Search channels..."
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.07] rounded-xl text-white text-sm placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none transition"
          />
        </div>
      </div>

      {/* ── Scrollable Content ────────────────────── */}
      <div className="flex-1 overflow-y-auto">
{/* Section: Channels */}
        <div className="border-b border-white/[0.05]">
          <div className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-400 transition">
            <button onClick={() => setChannelsOpen(!channelsOpen)} className="flex items-center gap-1">
              {channelsOpen ? '▼' : '▶'} Channels · {channels.length}
            </button>
            <div onClick={e => { e.stopPropagation(); setShowCreateModal(true); }} className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-indigo-400 transition cursor-pointer">
              <UserPlus className="w-3.5 h-3.5" />
            </div>
          </div>
          {channelsOpen && (
            <div className="px-2 pb-2 space-y-0.5">
              {channels.map(ch => (
                <ChannelItem
                  key={ch._id}
                  channel={ch}
                  isActive={activeChannelId === ch._id}
                  onSelect={() => onSelectChannel(ch)}
                />
              ))}
              {channels.length === 0 && (
                <div className="px-3 py-4 text-center">
                  <p className="text-gray-700 text-xs mb-2">No public channels yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-indigo-400 text-xs hover:text-indigo-300 transition"
                  >+ Create one</button>
                </div>
              )}
            </div>
          )}
        </div>

{/* Section: DMs */}
        <div>
          <div className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-400 transition">
            <button onClick={() => setDMsOpen(!dmsOpen)} className="flex items-center gap-1">
              {dmsOpen ? '▼' : '▶'} Messages · {conversations.length}
            </button>
            <div className="relative">
              <div onClick={(e) => { e.stopPropagation(); setShowDMSearch(!showDMSearch); }} className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-indigo-400 transition cursor-pointer">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              {showDMSearch && (
                <NewDMSearch onSearch={onSearchUser} onSelect={onNewDM} onClose={() => setShowDMSearch(false)} />
              )}
            </div>
          </div>
          {dmsOpen && (
            <div className="px-2 pb-2 space-y-0.5">
              {conversations.map(conv => (
                <DMItem
                  key={(conv.partner.supabaseId || (conv.partner as any)._id) as string}
                  conversation={conv}
                  isActive={activeDMId === (conv.partner.supabaseId || (conv.partner as any)._id)}
                  onSelect={() => onSelectDM(conv)}
                />
              ))}
              {conversations.length === 0 && (
                <div className="px-3 py-4 text-center">
                  <p className="text-gray-700 text-xs mb-2">No conversations yet</p>
                  <button
                    onClick={() => setShowDMSearch(true)}
                    className="text-indigo-400 text-xs hover:text-indigo-300 transition"
                  >+ Start a chat</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────── */}
      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {onlineUsers.slice(0, 4).map((u: any, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[9px] font-bold border-2 border-[#09090b] overflow-hidden"
              >
                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs">{onlineUsers.length} online</p>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────── */}
      {showCreateModal && (
        <CreateChannelModal
          existingChannelNames={existingChannelNames}
          onCreate={onCreateChannel}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default ChatSidebar;