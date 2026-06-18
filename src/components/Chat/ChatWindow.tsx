import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, MoreVertical, Check, CheckCheck, Smile, Send,
  Image, Paperclip, Repeat2, Trash2, X, Hash, Lock, Users,
} from 'lucide-react';
import {
  ActiveView, ChannelMessage, StudexMessage,
} from '../../hooks/useStudexChat';
import { socketService } from '../../lib/socketService';

const REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '🔥', '👍', '👎'];

interface ChatWindowProps {
  activeView: ActiveView;
  messages: (StudexMessage | ChannelMessage)[];
  typing?: { username: string };
  currentUserId: string;
  loading: boolean;
  hasMore: boolean;
  onSendMessage: (text: string, type?: string, imageUrl?: string, replyTo?: any) => void;
  onLoadMore: () => void;
  onMarkRead: () => void;
  onReact: (messageId: string, emoji: string, action: 'add' | 'remove') => void;
  onDelete: (messageId: string) => void;
  onTyping: () => void;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  activeView, messages, typing, currentUserId, loading, hasMore,
  onSendMessage, onLoadMore, onMarkRead, onReact, onDelete, onTyping, onBack,
}) => {
  const isDM = activeView?.type === 'dm';
  const isChannel = activeView?.type === 'channel';
  const partner = isDM ? activeView.conversation.partner : null;
  const channel = isChannel ? activeView.channel : null;

  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<StudexMessage | ChannelMessage | null>(null);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [showGifSearch, setShowGifSearch] = useState(false);
  const [gifQuery, setGifQuery] = useState('hello');
  const [gifs, setGifs] = useState<any[]>([]);
  const [searchingGifs, setSearchingGifs] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();
  const isTypingRef = useRef(false);
  const typingUsername = isDM ? (partner?.username || 'User') : (channel?.name || 'Someone');

  // ── Scroll ───────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = messagesTopRef.current?.parentElement as HTMLElement;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop < 80) onLoadMore();
  }, [loading, hasMore, onLoadMore]);

  // ── Mark read ────────────────────────────────────────────
  useEffect(() => {
    if (activeView) {
      const t = setTimeout(onMarkRead, 600);
      return () => clearTimeout(t);
    }
  }, [activeView, messages.length]);

  // ── GIF search ───────────────────────────────────────────
  useEffect(() => {
    if (!showGifSearch || !gifQuery) return;
    const t = setTimeout(async () => {
      setSearchingGifs(true);
      try { setGifs((await socketService.searchGifs(gifQuery)).results || []); }
      catch { setGifs([]); }
      setSearchingGifs(false);
    }, 350);
    return () => clearTimeout(t);
  }, [gifQuery, showGifSearch]);

  // ── Send ────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = newMessage.trim();
    if (!trimmed && images.length === 0) return;
    console.log('[Chat] Sending message to channel:', channel?._id, 'text:', trimmed);
    onSendMessage(trimmed).catch((err: any) => {
      console.error('[Chat] Send failed:', err?.message);
      // Don't clear message on failure — leave it for retry
      return;
    });
    setNewMessage('');
    setReplyTo(null);
    setImages([]);
    setShowGifSearch(false);
    isTypingRef.current = false;
    if (isDM) {
      socketService.stopTyping(currentUserId, partner?.supabaseId || '');
    } else if (isChannel) {
      socketService.stopChannelTyping(currentUserId, channel?._id || '');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      if (isChannel) socketService.sendChannelTyping(currentUserId, typingUsername, channel?._id || '');
      else if (isDM) socketService.sendTyping(currentUserId, partner?.supabaseId || '', typingUsername);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false;
      if (isChannel) socketService.stopChannelTyping(currentUserId, channel?._id || '');
      else if (isDM) socketService.stopTyping(currentUserId, partner?.supabaseId || '');
    }, 2000);
    onTyping();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, { file, preview: ev.target!.result as string }]);
      reader.readAsDataURL(file);
    });
  };

  const handleGifSelect = (gif: any) => {
    onSendMessage(gif.title || 'GIF', 'gif', gif.url);
    setShowGifSearch(false);
    setGifQuery('hello');
  };

  const myReaction = (msg: any) => {
    if (!msg.reactions) return '';
    for (const [, list] of Object.entries(msg.reactions)) {
      const r = (list as any[]).find((r: any) => r.userId === currentUserId);
      if (r) return r.emoji;
    }
    return '';
  };

  const formatTime = (d: Date) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) => {
    const dt = new Date(d);
    const today = new Date();
    if (dt.toDateString() === today.toDateString()) return 'Today';
    const y = new Date(today); y.setDate(y.getDate() - 1);
    if (dt.toDateString() === y.toDateString()) return 'Yesterday';
    return dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // isOwn: true if this message was sent by the current user
  // Check both raw senderId AND populated sender's supabaseId (populated after server broadcast)
  const isOwn = (msg: any) => {
    const raw = msg.sender?.supabaseId || (msg.sender as any)?.supabaseId;
    return msg.senderId === currentUserId || msg.senderId === (currentUserId as any)?._id || raw === currentUserId;
  };

  // Group by date
  const grouped: { date: string; msgs: any[] }[] = [];
  let lastDate = '', group: any[] = [];
  messages.forEach(msg => {
    const d = formatDate(msg.createdAt);
    if (d !== lastDate) {
      if (group.length) grouped.push({ date: lastDate, msgs: group });
      group = []; lastDate = d;
    }
    group.push(msg);
  });
  if (group.length) grouped.push({ date: lastDate, msgs: group });

  // Header subtitle
  const headerSubtitle = isDM
    ? partner?.isOnline ? `Online · @${partner.username}` : partner?.lastSeen ? `Last seen ${formatDate(partner.lastSeen)}` : `@${partner?.username} · ${partner?.college}`
    : channel?.description || `${channel?.memberCount || 0} members`;

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #0d0d12 0%, #09090b 50%, #0d0d12 100%)' }}>
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 border-b border-white/[0.05] bg-[#0d0d12]/90 backdrop-blur-xl">
        <button onClick={onBack} className="md:hidden p-2 hover:bg-white/5 rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-black/20">
            {isChannel ? <Hash className="w-5 h-5" /> : partner?.avatar
              ? <img src={partner.avatar} className="w-full h-full rounded-2xl object-cover" />
              : (isDM ? partner?.name?.[0]?.toUpperCase() : <Hash className="w-5 h-5" />)
            }
          </div>
          {isDM && partner?.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#09090b] shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-base truncate flex items-center gap-1.5">
            {isChannel && (channel?.isPrivate ? <Lock className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" /> : <Hash className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />)}
            {isChannel ? `#${channel?.name}` : partner?.name}
          </h2>
          <p className="text-gray-500 text-xs truncate">{headerSubtitle}</p>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-xl transition text-gray-400 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* ── Typing indicator ──────────────────────── */}
      {typing && (
        <div className="px-4 py-1 text-xs text-indigo-400 italic flex items-center gap-1.5">
          <span className="flex gap-0.5">
            {[0,1,2].map(i => (
              <span key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}} />
            ))}
          </span>
          {typing.username} is typing...
        </div>
      )}

      {/* ── Messages ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" onScroll={handleScroll}>
        <div ref={messagesTopRef} className="h-1" />

        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Loading messages...</p>
            </div>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{isChannel ? '#' : '💬'}</span>
              </div>
              <h3 className="text-white font-semibold mb-2">
                {isChannel ? `#${channel?.name}` : `Say hi to ${partner?.name}`}
              </h3>
              <p className="text-gray-600 text-sm max-w-xs">
                {isChannel ? `Be the first to message #${channel?.name}!` : 'Start building a connection!'}
              </p>
            </div>
          </div>
        )}

        {grouped.map(({ date, msgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-gray-700 text-[11px] font-medium px-2">{date}</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>
            {msgs.map((msg, idx) => {
              const own = isOwn(msg);
              const emoji = myReaction(msg);
              const showAvatar = idx === 0 || msgs[idx - 1]?.senderId !== msg.senderId;
              const reactions = msg.reactions ? Object.entries(msg.reactions).filter(([, r]) => (r as any[]).length > 0) : [];

              return (
                <div key={msg._id} className={`flex ${own ? 'justify-end' : 'justify-start'} mb-3 group-message`}>
                  <div className={`flex ${own ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[75%] sm:max-w-[65%]`}>
                    {!own && showAvatar ? (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden shadow-lg">
                        {(msg.sender as any)?.avatar ? <img src={(msg.sender as any).avatar} className="w-full h-full object-cover" /> : (msg.sender as any)?.name?.[0]?.toUpperCase()}
                      </div>
                    ) : !own ? <div className="w-7 flex-shrink-0" /> : null}
                    {own ? <div className="w-7 flex-shrink-0" /> : null}

                    <div className={`flex flex-col ${own ? 'items-end' : 'items-start'}`}>
                      {showAvatar && !own && (msg.sender as any)?.name && (
                        <p className="text-gray-600 text-[10px] mb-0.5 ml-1 font-medium">{(msg.sender as any).username || (msg.sender as any).name}</p>
                      )}

                      {/* Bubble */}
                      <div
                        className={`relative px-4 py-2.5 rounded-2xl shadow-lg cursor-pointer transition-all duration-200 ${own ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-sm' : 'bg-white/[0.06] text-white rounded-bl-sm border border-white/[0.06] hover:border-white/[0.12]'}`}
                        onContextMenu={e => { e.preventDefault(); setShowReactionMenu(showReactionMenu === msg._id ? null : msg._id); }}
                        onClick={() => setShowReactionMenu(showReactionMenu === msg._id ? null : msg._id)}
                      >
                        {/* Reply */}
                        {msg.replyTo && (
                          <div className={`flex items-center gap-1.5 mb-1.5 text-xs ${own ? 'text-indigo-200' : 'text-gray-500'} border-l-2 border-${own ? 'indigo-300' : 'gray-600'} pl-2`}>
                            <Repeat2 className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{msg.replyTo.senderName}: {String(msg.replyTo.text)?.slice(0, 40)}</span>
                          </div>
                        )}
                        {msg.type === 'gif' && msg.imageUrl && (
                          <img src={msg.imageUrl} alt="GIF" className="max-w-[200px] rounded-lg mb-1.5" style={{ maxHeight: 180 }} />
                        )}
                        {msg.type === 'image' && msg.imageUrl && (
                          <img src={msg.imageUrl} alt="" className="max-w-[200px] rounded-lg mb-1.5 cursor-pointer hover:opacity-90" onClick={() => setShowImagePreview(msg.imageUrl!)} />
                        )}
                        {msg.text && msg.type !== 'system' && (
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                        )}
                        {msg.type === 'system' && (
                          <p className="text-xs text-gray-600 italic">{msg.text}</p>
                        )}
                      </div>

                      {/* Reactions + time */}
                      <div className={`flex items-center gap-1 mt-0.5 mx-1 ${own ? 'flex-row-reverse' : ''}`}>
                        {reactions.map(([emo, list]) => (
                          <button
                            key={emo as string}
                            onClick={() => onReact(msg._id, emo as string, emoji === emo ? 'remove' : 'add')}
                            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition hover:scale-105 ${emoji === emo ? 'bg-indigo-500/30 border-indigo-500/50' : 'bg-white/[0.06] border-white/[0.08]'}`}
                          >
                            <span>{(emo as string)}</span>
                            <span className="text-gray-500">{(list as any[]).length}</span>
                          </button>
                        ))}
                        {reactions.length < 8 && (
                          <button onClick={() => setShowReactionMenu(msg._id)} className="p-0.5 text-gray-600 hover:text-gray-400 opacity-0 group-message-hover:opacity-100 transition">
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-gray-700 text-[10px]">{formatTime(msg.createdAt)}</span>
                      </div>

                      {/* Reaction picker */}
                      {showReactionMenu === msg._id && (
                        <div className={`absolute bottom-full mb-2 ${own ? 'right-0' : 'left-0'} z-50`}>
                          <div className="bg-[#1c1c2a] border border-white/12 rounded-2xl shadow-2xl p-2 flex gap-1">
                            {REACTIONS.map(e => (
                              <button key={e} onClick={() => { onReact(msg._id, e, emoji === e ? 'remove' : 'add'); setShowReactionMenu(null); }}
                                className={`w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-base transition hover:scale-110 ${emoji === e ? 'bg-indigo-500/30 scale-110' : ''}`}>{e}</button>
                            ))}
                            <div className="w-px bg-white/10 self-center h-5" />
                            <button onClick={() => { setReplyTo(msg); setShowReactionMenu(null); }} className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-gray-400 transition">
                              <Repeat2 className="w-4 h-4" />
                            </button>
                            {own && (
                              <button onClick={() => { onDelete(msg._id); setShowReactionMenu(null); }} className="w-8 h-8 rounded-xl hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <button onClick={() => setShowReactionMenu(null)} className="absolute -top-1 -right-1 w-4 h-4 bg-white/10 rounded-full flex items-center justify-center"><X className="w-2.5 h-2.5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Reply bar ─────────────────────────────── */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border-t border-indigo-500/20">
          <Repeat2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <p className="flex-1 text-xs text-indigo-400 truncate">Replying to {(replyTo.sender as any)?.name}</p>
          <button onClick={() => setReplyTo(null)}><X className="w-3.5 h-3.5 text-gray-500" /></button>
        </div>
      )}

      {/* ── Image previews ─────────────────────────── */}
      {images.length > 0 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto border-t border-white/5">
          {images.map((img, i) => (
            <div key={i} className="relative flex-shrink-0">
              <img src={img.preview} className="w-14 h-14 rounded-xl object-cover" />
              <button onClick={() => setImages(p => p.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"><X className="w-2.5 h-2.5 text-white" /></button>
            </div>
          ))}
        </div>
      )}

      {/* ── GIF Picker ───────────────────────────── */}
      {showGifSearch && (
        <div className="px-4 py-2 bg-[#0d0d12] border-t border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <input autoFocus value={gifQuery} onChange={e => setGifQuery(e.target.value)} placeholder="Search GIFs..." className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:border-indigo-500/50 outline-none" />
            <button onClick={() => setShowGifSearch(false)}><X className="w-3.5 h-3.5 text-gray-500" /></button>
          </div>
          <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
            {searchingGifs ? <p className="text-gray-600 text-xs py-2">Searching...</p>
              : gifs.slice(0, 16).map(g => (
                <button key={g.id} onClick={() => handleGifSelect(g)} className="w-16 h-16 rounded-lg overflow-hidden hover:ring-2 ring-indigo-500 transition">
                  <img src={g.preview || g.url} alt={g.title} className="w-full h-full object-cover" />
                </button>
              ))
            }
          </div>
        </div>
      )}

      {/* ── Input ──────────────────────────────── */}
      <div className="p-3 border-t border-white/[0.05] bg-[#09090b]/50">
        <div className="flex items-end gap-1.5">
          <button onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-indigo-400 transition"><Image className="w-4.5 h-4.5" /></button>
          <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-emerald-400 transition"><Paperclip className="w-4.5 h-4.5" /></button>
          <button onClick={() => setShowGifSearch(!showGifSearch)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-pink-400 transition"><span className="text-xs font-bold">GIF</span></button>
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown as any}
              placeholder={`Message ${isChannel ? `#${channel?.name}` : partner?.name}...`}
              rows={1}
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white text-sm placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none resize-none transition"
              style={{ maxHeight: 120 }}
              onInput={e => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() && images.length === 0}
            className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 text-white rounded-2xl transition shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleImageSelect} />
      </div>

      {/* ── Lightbox ────────────────────────────── */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center" onClick={() => setShowImagePreview(null)}>
          <img src={showImagePreview} className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl" />
          <button onClick={() => setShowImagePreview(null)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full"><X className="w-5 h-5 text-white" /></button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;