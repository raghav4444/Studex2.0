import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, UserPlus, Check, Users, Radio, Sparkles, MessageSquare } from 'lucide-react';

const AVATAR_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-purple-600',
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
  onlineUsers: UserResult[];
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
      .catch(() => {})
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

  const totalUsers = onlineUsers2.length + offlineUsers.length;

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, @username..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-500 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition"
          />
        </div>
        {totalUsers > 0 && (
          <p className="text-[10px] text-gray-600 mt-2 px-1">
            {totalUsers} {totalUsers === 1 ? 'user' : 'users'} found
          </p>
        )}
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto px-3">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-2 border-blue-500/20 border-t-blue-500 rounded-xl animate-spin" />
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-gray-700" />
            </div>
            <p className="text-gray-500 text-sm">
              {search ? 'No users match your search' : 'No users found'}
            </p>
            {search && (
              <p className="text-gray-600 text-xs mt-1">Try a different search term</p>
            )}
          </div>
        )}

        {/* ── Online section ────────────────────────────────── */}
        {onlineUsers2.length > 0 && (
          <div className="py-1">
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <Radio className="w-3 h-3 text-emerald-400" />
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Online · {onlineUsers2.length}
              </p>
            </div>
            <div className="space-y-0.5">
              {onlineUsers2.map(u => (
                <UserRow
                  key={u._id}
                  user={u}
                  onStartDM={() => onStartDM(u.supabaseId || (u as any)._id)}
                  onSendRequest={() => onSendFriendRequest(u.supabaseId || (u as any)._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Offline section ────────────────────────────────── */}
        {offlineUsers.length > 0 && (
          <div className="py-1">
            <div className="flex items-center gap-2 px-2 py-2 mt-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-gray-600" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Offline · {offlineUsers.length}
              </p>
            </div>
            <div className="space-y-0.5">
              {offlineUsers.map(u => (
                <UserRow
                  key={u._id}
                  user={u}
                  onStartDM={() => onStartDM(u.supabaseId || (u as any)._id)}
                  onSendRequest={() => onSendFriendRequest(u.supabaseId || (u as any)._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <button
            onClick={loadMore}
            className="w-full py-4 text-center text-gray-600 hover:text-blue-400 text-xs transition"
          >
            {loadingMore ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              'Load more users'
            )}
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
    <div
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition cursor-pointer border border-transparent hover:border-white/5"
      onClick={onStartDM}
    >
      {/* Avatar with online dot */}
      <div className="relative flex-shrink-0">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-lg ring-2 ring-transparent group-hover:ring-white/10 transition-all`}>
          {user.avatar
            ? <img src={user.avatar} className="w-full h-full object-cover" />
            : user.name?.[0]?.toUpperCase()
          }
        </div>
        {/* Online indicator */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d1016] ${user.isOnline ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-gray-700'}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
          {user.name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          @{user.username}
          {user.college && <span className="text-gray-700 ml-1">· {user.college}</span>}
        </p>
      </div>

      {/* Action */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
        {reqStatus === 'friend' ? (
          <button
            onClick={e => { e.stopPropagation(); onStartDM(); }}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
          >
            <MessageSquare className="w-3 h-3" /> Chat
          </button>
        ) : reqStatus === 'sent' ? (
          <span className="px-3 py-1.5 bg-white/[0.04] text-gray-500 text-xs rounded-lg flex items-center gap-1.5">
            <Check className="w-3 h-3" /> Sent
          </span>
        ) : reqStatus === 'received' ? (
          <button
            onClick={e => e.stopPropagation()}
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 text-xs font-medium rounded-lg transition"
          >
            Accept
          </button>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); handleSendRequest(); }}
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
          >
            <UserPlus className="w-3 h-3" /> Add
          </button>
        )}
      </div>
    </div>
  );
};