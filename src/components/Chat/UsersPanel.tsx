import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, UserPlus, Check, Users } from 'lucide-react';

const AVATAR_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
];

interface UserResult {
  _id: string;
  supabaseId: string;
  name: string;
  username: string;
  avatar: string;
  college: string;
  isOnline: boolean;
  lastSeen?: Date;
  isFriend?: boolean;
  hasSentRequest?: boolean;
  isSentByOther?: boolean;
}

interface UsersPanelProps {
  currentUserId: string;
  onStartDM: (userId: string) => void;
  onSendFriendRequest: (userId: string) => void;
  onlineUsers: UserResult[]; // pass live online set from parent
}

export const UsersPanel: React.FC<UsersPanelProps> = ({
  currentUserId,
  onStartDM,
  onSendFriendRequest,
  onlineUsers,
}) => {
  const [allUsers, setAllUsers] = useState<UserResult[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchUsers = useCallback(async (q: string, p: number, signal: AbortSignal) => {
    const serverUrl = (window as any).__ENV__?.VITE_API_URL || 'http://localhost:3001';
    const params = new URLSearchParams({
      page: String(p),
      limit: '20',
      ...(q.trim() && q.trim().length >= 1 ? { q: q.trim() } : {}),
    });
    const res = await fetch(`${serverUrl}/api/users?${params}&supabaseId=${currentUserId}`, { signal });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.users || []);
  }, [currentUserId]);

  // Initial load
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetchUsers('', 1, ctrl.signal)
      .then(users => {
        setAllUsers(users);
        setPage(1);
        setHasMore(users.length >= 20);
      })
      .catch(() => {}) // abort errors are fine
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [fetchUsers]);

  // Search with debounce
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!search.trim()) return;
    timerRef.current = setTimeout(() => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      fetchUsers(search, 1, abortRef.current.signal)
        .then(users => {
          setAllUsers(users);
          setPage(1);
          setHasMore(users.length >= 20);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [search, fetchUsers]);

  // Merge live online status from parent into local list
  useEffect(() => {
    if (onlineUsers.length === 0) return;
    const onlineIds = new Set(onlineUsers.map(u => u.supabaseId || u._id));
    setAllUsers(prev => prev.map(u => ({
      ...u,
      isOnline: onlineIds.has(u.supabaseId || (u as any)._id),
    })));
  }, [onlineUsers]);

  // Split into online / offline
  const filtered = search.trim()
    ? allUsers.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.college?.toLowerCase().includes(search.toLowerCase())
      )
    : allUsers;

  const onlineUsers2 = filtered.filter(u =>
    (u.supabaseId && onlineUsers.some(o => o.supabaseId === u.supabaseId)) ||
    onlineUsers.some(o => o._id === u._id)
  );
  const offlineUsers = filtered.filter(u => !onlineUsers2.some(o => o._id === u._id));

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    fetchUsers(search, nextPage, new AbortController().signal)
      .then(users => {
        if (users.length === 0) { setHasMore(false); return; }
        setAllUsers(prev => {
          const existingIds = new Set(prev.map(u => String(u._id)));
          const newOnly = users.filter(u => !existingIds.has(String(u._id)));
          return [...prev, ...newOnly];
        });
        setPage(nextPage);
        if (users.length < 20) setHasMore(false);
      })
      .finally(() => setLoadingMore(false));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-4 pb-3 border-b border-white/[0.05]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or @username..."
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.07] rounded-xl text-white text-sm placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none transition"
          />
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">
              {search ? 'No users match your search' : 'No users found'}
            </p>
          </div>
        )}

        {/* ── Online section ────────────────────────────────── */}
        {onlineUsers2.length > 0 && (
          <div className="py-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 py-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Online · {onlineUsers2.length}
            </p>
            {onlineUsers2.map(u => (
              <UserRow
                key={u._id}
                user={u}
                onStartDM={() => onStartDM(u.supabaseId || (u as any)._id)}
                onSendRequest={() => onSendFriendRequest(u.supabaseId || (u as any)._id)}
              />
            ))}
          </div>
        )}

        {/* ── Offline section ────────────────────────────────── */}
        {offlineUsers.length > 0 && (
          <div className="py-1">
            {onlineUsers2.length > 0 && (
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 py-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block" />
                Offline · {offlineUsers.length}
              </p>
            )}
            {offlineUsers.map(u => (
              <UserRow
                key={u._id}
                user={u}
                onStartDM={() => onStartDM(u.supabaseId || (u as any)._id)}
                onSendRequest={() => onSendFriendRequest(u.supabaseId || (u as any)._id)}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <button
            onClick={loadMore}
            className="w-full py-3 text-gray-600 hover:text-white text-xs transition"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Single user row ───────────────────────────────────────────
const UserRow: React.FC<{
  user: UserResult;
  onStartDM: () => void;
  onSendRequest: () => void;
}> = ({ user, onStartDM, onSendRequest }) => {
  const [reqStatus, setReqStatus] = useState(
    user.isFriend ? 'friend' :
    user.hasSentRequest ? 'sent' :
    (user as any).isSentByOther ? 'received' : 'none'
  );
  const colorIdx = Math.abs(user.username?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIdx];

  const handleSendRequest = () => {
    onSendRequest();
    setReqStatus('sent');
  };

  return (
    <div className="group flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.03] transition cursor-pointer"
      onClick={onStartDM}
    >
      {/* Avatar with online dot */}
      <div className="relative flex-shrink-0">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold overflow-hidden`}>
          {user.avatar
            ? <img src={user.avatar} className="w-full h-full object-cover" />
            : user.name?.[0]?.toUpperCase()
          }
        </div>
        {/* Online indicator */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#09090b] ${reqStatus === 'friend' ? 'bg-emerald-400' : 'bg-gray-700'}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-white text-sm font-medium truncate flex items-center gap-1.5">
          {user.name}
          {user.isVerified && <span className="text-indigo-400 text-xs">✓</span>}
        </p>
        <p className="text-gray-600 text-xs truncate">@{user.username}</p>
      </div>

      {/* Action */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
        {reqStatus === 'friend' ? (
          <button
            onClick={e => { e.stopPropagation(); onStartDM(); }}
            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-xs font-medium rounded-lg transition"
          >
            Message
          </button>
        ) : reqStatus === 'sent' ? (
          <span className="px-2.5 py-1 bg-white/[0.04] text-gray-600 text-xs rounded-lg flex items-center gap-1">
            <Check className="w-3 h-3" /> Sent
          </span>
        ) : reqStatus === 'received' ? (
          <button
            onClick={e => e.stopPropagation()}
            className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 text-xs font-medium rounded-lg transition"
          >
            Accept
          </button>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); handleSendRequest(); }}
            className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 text-xs font-medium rounded-lg transition flex items-center gap-1"
          >
            <UserPlus className="w-3 h-3" /> Add
          </button>
        )}
      </div>
    </div>
  );
};