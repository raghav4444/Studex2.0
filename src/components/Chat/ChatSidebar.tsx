import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, UserPlus, UserMinus, Lock, Hash, Users } from 'lucide-react';
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
];

// ── DM Item row ────────────────────────────────────────────────
const DMItem: React.FC<{
  conversation: StudexConversation;
  isActive: boolean;
  onSelect: () => void;
}> = ({ conversation, onSelect }) => {
  const partner = conversation.partner;
  const colorIdx = Math.abs(partner.username?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIdx];

  return (
    <div
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${
        false ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
      }`}
    >
      <button onClick={onSelect} className="flex-1 flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold overflow-hidden`}>
            {partner.avatar
              ? <img src={partner.avatar} className="w-full h-full object-cover" />
              : partner.name?.[0]?.toUpperCase() ?? '?'}
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
  const requestsRef = useRef<HTMLDivElement>(null);

  const isOnline = useCallback((user: StudexUser) =>
    onlineUsers.some(o => (o._id || o.supabaseId) === (user._id || user.supabaseId)), [onlineUsers]);

  const activeChannelId = activeView?.type === 'channel' ? activeView.channel._id : null;
  const activeDMId = activeView?.type === 'dm'
    ? (activeView.conversation.partner.supabaseId || (activeView.conversation.partner as any)._id)
    : null;

  const existingChannelNames = channels.map(c => c.name);

  return (
    <div className="h-full flex flex-col bg-[#09090b]/90 backdrop-blur-2xl border-r border-white/[0.06] overflow-hidden">

      {/* ── Header ── */}
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
          {/* Friend requests */}
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
            {showRequests && (
              <div className="absolute top-full right-0 mt-1 w-72 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-white font-medium text-sm">Friend Requests</span>
                  <button onClick={() => setShowRequests(false)}><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                {friendRequests.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-6">No pending requests</p>
                ) : friendRequests.map(req => (
                  <div key={req._id} className="flex items-center gap-3 p-3 hover:bg-white/[0.03] border-b border-white/5 last:border-b-0">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[Math.abs(req.fromUsername?.charCodeAt(0) || 0) % 5]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden`}>
                      {req.fromAvatar ? <img src={req.fromAvatar} className="w-full h-full object-cover" /> : req.fromName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{req.fromName}</p>
                      <p className="text-gray-600 text-xs truncate">{req.fromCollege}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { onAcceptFriend(req._id, req); setShowRequests(false); }}
                        className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition text-xs"
                      >OK</button>
                      <button
                        onClick={() => { onRejectFriend(req._id); setShowRequests(false); }}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition"
                      ><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex px-2 border-b border-white/[0.05]">
          <TabButton
            active={activeTab === 'channels'}
            onClick={() => setActiveTab('channels')}
            icon={<Hash className="w-3.5 h-3.5" />}
            label="Channels"
          />
          <TabButton
            active={activeTab === 'dms'}
            onClick={() => setActiveTab('dms')}
            icon={<Users className="w-3.5 h-3.5" />}
            label="Messages"
            badge={conversations.length}
          />
          <TabButton
            active={activeTab === 'people'}
            onClick={() => setActiveTab('people')}
            icon={<UserPlus className="w-3.5 h-3.5" />}
            label="People"
          />
        </div>
      </div>

      {/* ── Channel search (only when on channels tab) ── */}
      {activeTab === 'channels' && (
        <div className="px-4 py-3 border-b border-white/[0.05]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
            <input
              placeholder="Search channels..."
              className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.07] rounded-xl text-white text-sm placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none transition"
            />
          </div>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Channels tab */}
        {activeTab === 'channels' && (
          <div className="border-b border-white/[0.05]">
            <div className="w-full flex items-center justify-between px-4 py-2.5">
              <button onClick={() => setChannelsOpen(!channelsOpen)} className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-400">
                {channelsOpen ? 'v' : '>'} Channels {channels.length}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-indigo-400 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </div>
            {channelsOpen && (
              <div className="px-2 pb-2 space-y-0.5">
                {channels.map(ch => (
                  <button
                    key={ch._id}
                    onClick={() => onSelectChannel(ch)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      activeChannelId === ch._id
                        ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {ch.isPrivate
                      ? <Lock className="w-4 h-4 flex-shrink-0 text-gray-600" />
                      : <Hash className="w-4 h-4 flex-shrink-0 text-gray-600" />}
                    <span className="truncate">{ch.name}</span>
                  </button>
                ))}
                {channels.length === 0 && (
                  <div className="px-3 py-4 text-center">
                    <p className="text-gray-700 text-xs mb-2">No channels yet</p>
                    <button onClick={() => setShowCreateModal(true)} className="text-indigo-400 text-xs hover:text-indigo-300">+ Create one</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DMs tab */}
        {activeTab === 'dms' && (
          <div>
            <div className="w-full flex items-center gap-1 px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {dmsOpen ? 'v' : '>'} Messages {conversations.length}
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
                    <button onClick={() => setActiveTab('people')} className="text-indigo-400 text-xs hover:text-indigo-300">+ Start a chat</button>
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
      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {onlineUsers.slice(0, 4).map((u: any, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[9px] font-bold border-2 border-[#09090b] overflow-hidden"
              >
                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : (u.name?.[0] ?? '?')}
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs">{onlineUsers.length} online</p>
        </div>
      </div>

      {/* ── Create channel modal ── */}
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
    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition relative ${
      active ? 'text-indigo-400' : 'text-gray-600 hover:text-gray-400'
    }`}
  >
    {icon}
    {label}
    {!active && badge !== undefined && badge > 0 && (
      <span className="w-4 h-4 bg-white/10 rounded-full text-[9px] font-bold flex items-center justify-center">
        {badge}
      </span>
    )}
    {active && (
      <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-500 rounded-full" />
    )}
  </button>
);

export default ChatSidebar;