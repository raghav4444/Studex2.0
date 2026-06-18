import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojis = useMemo(() => ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'], []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const { data: rows, error } = await supabase
        .from('study_group_messages')
        .select('id, sender_id, content, message_type, file_name, created_at')
        .eq('group_id', group.id)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      const senderIds = Array.from(new Set((rows || []).map((row) => row.sender_id)));
      const { data: profiles } = senderIds.length > 0
        ? await supabase
            .from('profiles')
            .select('user_id, name, username, avatar_url')
            .in('user_id', senderIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map((profile: any) => [profile.user_id, profile]));

      setMessages((rows || []).map((row: any) => {
        const profile = profileMap.get(row.sender_id);
        const senderName = row.sender_id === user?.id ? 'You' : profile?.name || profile?.username || 'Study Mate';

        return {
          id: row.id,
          content: row.content,
          sender: {
            id: row.sender_id,
            name: senderName,
            avatar: profile?.avatar_url,
          },
          timestamp: new Date(row.created_at),
          type: row.message_type,
          isRead: true,
          fileName: row.file_name || undefined,
        };
      }));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load chat');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void loadMessages();
    }
  }, [group.id, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender.id === user?.id) {
      return message.isRead ? <CheckCheck className="w-4 h-4 text-blue-400" /> : <Check className="w-4 h-4 text-gray-400" />;
    }

    return null;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);

      const { data } = await supabase.auth.getUser();
      const currentUserId = data.user?.id || user?.id;

      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.from('study_group_messages').insert({
        group_id: group.id,
        sender_id: currentUserId,
        content: newMessage.trim(),
        message_type: 'text',
      });

      if (error) {
        throw error;
      }

      setNewMessage('');
      setShowEmojiPicker(false);
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#161b22] ${isFullscreen ? 'h-full w-full rounded-none' : 'h-[80vh] w-full max-w-4xl'}`}>
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{group.name}</h3>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span>{group.members.length} members</span>
                <span>•</span>
                <span>{group.isPrivate ? 'Private room' : 'Open room'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="rounded-lg bg-gray-700 p-2 text-gray-400 transition-colors hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-700 p-2 text-gray-400 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <div className="py-10 text-center text-gray-400">Loading group chat...</div>}
          {loadError && <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-200">{loadError}</div>}

          {messages.map((message, index) => {
            const showDate = index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
            const isCurrentUser = message.sender.id === user?.id;

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="my-4 flex items-center justify-center">
                    <span className="rounded-full bg-[#0d1117] px-3 py-1 text-xs text-gray-500">{formatDate(message.timestamp)}</span>
                  </div>
                )}

                <div className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                    {message.sender.name.charAt(0)}
                  </div>

                  <div className={`max-w-xs flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
                    <div className="mb-1 flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">{message.sender.name}</span>
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                    </div>

                    <div className={`rounded-2xl p-3 ${isCurrentUser ? 'bg-blue-500 text-white' : 'border border-white/10 bg-[#0d1117] text-white'}`}>
                      <p className="text-sm leading-6">{message.content}</p>
                      {message.fileName && <p className="mt-2 text-xs text-gray-300">{message.fileName}</p>}
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <div />
                      <div>{getMessageStatus(message)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFileUpload((prev) => !prev)}
              className="p-2 text-gray-400 transition-colors hover:text-white"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />

              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 rounded-2xl border border-white/10 bg-[#0d1117] p-3 shadow-xl">
                  <div className="grid grid-cols-5 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewMessage((prev) => `${prev}${emoji}`)}
                        className="rounded-lg p-2 transition-colors hover:bg-white/10"
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
              className="p-2 text-gray-400 transition-colors hover:text-white"
            >
              <Smile className="h-5 w-5" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="rounded-2xl bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {showFileUpload && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-[#0d1117] p-3">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl bg-blue-500/20 px-3 py-2 text-sm text-blue-300 transition-colors hover:bg-blue-500/30"
                >
                  Upload File
                </button>
                <button type="button" className="rounded-xl bg-emerald-500/20 px-3 py-2 text-sm text-emerald-300 transition-colors hover:bg-emerald-500/30">
                  Share Screen
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
                multiple
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
