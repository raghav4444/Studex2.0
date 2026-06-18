import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCheck,
  Maximize2,
  MessageSquare,
  Minimize2,
  Paperclip,
  Send,
  Smile,
  X,
} from 'lucide-react';
import { StudyGroup } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  fileName?: string;
}

interface GroupChatProps {
  group: StudyGroup;
  isOpen: boolean;
  onClose: () => void;
}

const GroupChat: React.FC<GroupChatProps> = ({ group, isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = useMemo(() => user?.id ?? null, [user?.id]);

  const loadMessages = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const { data: rows, error: rowsError } = await supabase
        .from('study_group_messages')
        .select('id, sender_id, content, message_type, file_name, created_at')
        .eq('group_id', group.id)
        .order('created_at', { ascending: true });

      if (rowsError) {
        throw rowsError;
      }

      const senderIds = Array.from(new Set((rows || []).map((row) => row.sender_id)));
      let profileMap = new Map<string, { name: string; avatar_url?: string }>();

      if (senderIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, name, username, avatar_url')
          .in('user_id', senderIds);

        if (profilesError) {
          console.warn('[GroupChat] profile fetch failed:', profilesError);
        }

        profileMap = new Map(
          (profiles || []).map((profile: any) => [
            profile.user_id,
            {
              name: profile.name || profile.username || 'Study Mate',
              avatar_url: profile.avatar_url,
            },
          ]),
        );
      }

      const formattedMessages: Message[] = (rows || []).map((row: any) => ({
        id: row.id,
        content: row.content,
        sender: {
          id: row.sender_id,
          // Always name the sender from profileMap, falling back to the current-user label
          // only when the profile lookup failed for the logged-in user.
          name: row.sender_id === currentUserId
            ? 'You'
            : profileMap.get(row.sender_id)?.name || 'Study Mate',
          avatar: profileMap.get(row.sender_id)?.avatar_url,
        },
        timestamp: new Date(row.created_at),
        type: row.message_type as Message['type'],
        isRead: true,
        fileName: row.file_name || undefined,
      }));

      setMessages(formattedMessages);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat');
      setMessages([]);
      setStatus('error');
    }
  }, [group.id, currentUserId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = 'hidden';

    // Keep chat-open so the hook does not short-circuit while the modal is visible.
    const chatsOpenRef = { current: true };

    void loadMessages();

    const channel = supabase
      .channel(`study-group-chat-${group.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_group_messages',
          filter: `group_id=eq.${group.id}`,
        },
        async (payload) => {
          const row = payload.new as any;
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, username, avatar_url')
            .eq('user_id', row.sender_id)
            .maybeSingle();

          const senderName = row.sender_id === currentUserId
            ? 'You'
            : profile?.name || profile?.username || 'Study Mate';

          setMessages((prev) => {
            if (prev.some((msg) => msg.id === row.id)) {
              return prev;
            }

            return [
              ...prev,
              {
                id: row.id,
                content: row.content,
                sender: {
                  id: row.sender_id,
                  name: senderName,
                  avatar: profile?.avatar_url,
                },
                timestamp: new Date(row.created_at),
                type: (row.message_type as Message['type']) || 'text',
                isRead: true,
                fileName: row.file_name || undefined,
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      chatsOpenRef.current = false;
      document.body.style.overflow = '';
      supabase.removeChannel(channel);
    };
  }, [group.id, isOpen, loadMessages, currentUserId]);

  // Scroll to bottom
  useEffect(() => {
    messagesContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messageInputRef.current?.focus();
    }
  }, [isOpen]);

  const formatTime = useCallback((date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
  []);

  const formatDate = useCallback((date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const getMessageStatus = useCallback(
    (message: Message) => {
      if (message.sender.id !== currentUserId) {
        return null;
      }

      return message.isRead ? (
        <span className="inline-flex items-center gap-1 text-xs text-blue-300">
          <CheckCheck className="h-4 w-4" />
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Check className="h-4 w-4" />
        </span>
      );
    },
    [currentUserId],
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesContainerRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !currentUserId) {
      return;
    }

    setSending(true);
    setNewMessage('');

    try {
      const senderName = 'You';

      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        content: trimmed,
        sender: {
          id: currentUserId,
          name: senderName,
        },
        timestamp: new Date(),
        type: 'text',
        isRead: false,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      scrollToBottom('auto');

      const { data: authData, error: authError } = await supabase.auth.getUser();
      const effectiveUserId = authData.user?.id || currentUserId;

      if (authError || !effectiveUserId) {
        throw new Error('User not authenticated');
      }

      const { data, error: insertError } = await supabase
        .from('study_group_messages')
        .insert({
          group_id: group.id,
          sender_id: effectiveUserId,
          content: trimmed,
          message_type: 'text',
        })
        .select('id, sender_id, created_at')
        .single();

      if (insertError || !data) {
        throw insertError || new Error('Failed to send message');
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? {
                ...msg,
                id: data.id,
                sender: {
                  ...msg.sender,
                  id: data.sender_id || msg.sender.id,
                },
                timestamp: new Date(data.created_at),
                isRead: false,
              }
            : msg,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [currentUserId, group.id, newMessage, scrollToBottom]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !currentUserId) {
        return;
      }

      setSending(true);
      setShowFileUpload(false);

      try {
        const filePath = `study-group/${group.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('study-group-files')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('study-group-files')
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        const { error: insertError } = await supabase
          .from('study_group_messages')
          .insert({
            group_id: group.id,
            sender_id: currentUserId,
            content: '',
            message_type: file.type.startsWith('image/') ? 'image' : 'file',
            file_url: publicUrl,
            file_name: file.name,
          });

        if (insertError) {
          throw insertError;
        }

        await loadMessages();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload file');
      } finally {
        setSending(false);
      }
    },
    [currentUserId, group.id, loadMessages],
  );

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setIsFullscreen(false);
    setShowEmojiPicker(false);
    setShowFileUpload(false);
  }, [onClose]);

  const emojis = useMemo(
    () => ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'],
    [],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      style={{ overflow: 'hidden' }}
    >
      <div
        className={`flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d1117] shadow-2xl shadow-black/60 ${isFullscreen ? 'h-full w-full rounded-none' : 'h-[85vh] w-full max-w-4xl'}`}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{group.name}</h3>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                <span>{group.members.length} members</span>
                <span className="text-gray-600">•</span>
                <span>{group.isPrivate ? 'Private room' : 'Open room'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              type="button"
              className="rounded-lg bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={handleClose}
              type="button"
              className="rounded-lg bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {status === 'loading' && (
            <div className="space-y-4 py-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-white/10" />
                    <div className={`h-16 rounded-2xl bg-white/5`} style={{ width: 200 + i * 60 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === 'error' && error && (
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-200">
              {error}
            </div>
          )}

          {status !== 'loading' && messages.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-500">
              No messages yet. Start the conversation 👋
            </div>
          )}

          <div className="space-y-5">
            {messages.map((message, index) => {
              const showDate =
                index === 0 ||
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
              const isCurrentUser = message.sender.id === currentUserId;

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="my-4 flex items-center justify-center">
                      <span className="rounded-full bg-white/5 px-4 py-1 text-xs text-gray-500">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                      {message.sender.name?.charAt(0).toUpperCase()}
                    </div>

                    <div
                      className={`max-w-xs ${isCurrentUser ? 'text-right' : ''}`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-300">
                          {message.sender.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          isCurrentUser
                            ? 'bg-blue-500 text-white'
                            : 'border border-white/10 bg-white/5 text-white'
                        }`}
                      >
                        {message.content}
                        {message.fileName && (
                          <p
                            className={`mt-2 break-all text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-300'}`}
                          >
                            📎 {message.fileName}
                          </p>
                        )}
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span />
                        <div className="flex items-center">{getMessageStatus(message)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesContainerRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="flex-shrink-0 border-t border-white/10 bg-[#161b22]/80 p-4 backdrop-blur">
          <div className="flex items-end gap-2">
            <button
              onClick={() => setShowFileUpload((prev) => !prev)}
              type="button"
              className="rounded-xl bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <div className="relative flex-1">
              <input
                ref={messageInputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending || status === 'loading'}
                placeholder={status === 'loading' ? 'Loading chat...' : 'Type a message...'}
                className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 rounded-2xl border border-white/10 bg-[#161b22] p-3 shadow-xl">
                  <div className="grid grid-cols-5 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewMessage((prev) => `${prev}${emoji}`)}
                        className="rounded-lg p-2 text-lg transition-colors hover:bg-white/10"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              type="button"
              className="rounded-xl bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Smile className="h-5 w-5" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || status === 'loading'}
              className="rounded-2xl bg-blue-500 p-2.5 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {showFileUpload && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-[#0d1117] p-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl bg-blue-500/20 px-3 py-2 text-sm text-blue-300 transition-colors hover:bg-blue-500/30"
                >
                  Upload File
                </button>
                <span className="text-xs text-gray-500">
                  Images, videos, PDFs, docs (max ~50MB)
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
                multiple
                onChange={handleFileSelect}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
