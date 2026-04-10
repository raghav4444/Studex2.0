import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image, Paperclip, MoreVertical, User, Phone, Video, MessageCircle } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { Conversation, Message } from '../../types';

interface ChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
  chatHook: ReturnType<typeof import('../../hooks/useChat').useChat>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack, chatHook }) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, fetchMessages, markMessagesAsRead, fetchConversationParticipants } = chatHook;
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationParticipants, setConversationParticipants] = useState(conversation.participants);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherUser = conversationParticipants.find(p => p.id !== user?.id);

  useEffect(() => {
    if (conversation.id) {
      fetchMessages(conversation.id);
    }
  }, [conversation.id, fetchMessages]);

  // Fetch participants when conversation changes
  useEffect(() => {
    if (conversation.id && conversation.participants.length === 0) {
      const loadParticipants = async () => {
        const participants = await fetchConversationParticipants(conversation.id);
        setConversationParticipants(participants);
      };
      loadParticipants();
    } else {
      setConversationParticipants(conversation.participants);
    }
  }, [conversation.id, conversation.participants, fetchConversationParticipants]);

  useEffect(() => {
    // Mark messages as read when conversation is opened
    if (conversation.id) {
      markMessagesAsRead(conversation.id);
    }
  }, [conversation.id, markMessagesAsRead]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation.id) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    await sendMessage(conversation.id, messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString();
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === user?.id;
    const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;
    const showTime = index === messages.length - 1 || 
      new Date(message.createdAt).getTime() - new Date(messages[index + 1]?.createdAt || 0).getTime() > 300000; // 5 minutes

    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3 max-w-[80%] sm:max-w-[70%]`}>
          {/* Avatar */}
          {showAvatar && !isOwn && (
            <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              {message.sender.avatar ? (
                <img
                  src={message.sender.avatar}
                  alt={message.sender.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium text-sm">
                  {message.sender.name ? message.sender.name[0].toUpperCase() : '?'}
                </span>
              )}
            </div>
          )}
          
          {showAvatar && isOwn && <div className="w-8"></div>}

          {/* Message Content */}
          <div className={`${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
            {/* Sender Name */}
            {showAvatar && !isOwn && (
              <p className="text-gray-400 text-xs mb-1 px-2 font-medium">{message.sender.name}</p>
            )}
            
            {/* Message Bubble */}
            <div
              className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 group-hover:shadow-xl ${
                isOwn
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-bl-md border border-gray-600/30'
              }`}
            >
              {message.messageType === 'text' && (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              
              {message.messageType === 'image' && (
                <div>
                  <img
                    src={message.fileUrl}
                    alt="Shared image"
                    className="max-w-xs rounded-lg"
                  />
                  {message.content && (
                    <p className="text-sm mt-2">{message.content}</p>
                  )}
                </div>
              )}
              
              {message.messageType === 'file' && (
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium">{message.fileName}</p>
                    {message.content && (
                      <p className="text-sm opacity-80">{message.content}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Message Time */}
            {showTime && (
              <p className={`text-gray-500 text-xs mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'}`}>
                {formatMessageTime(message.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!otherUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">Invalid conversation</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#0d1117] to-[#161b22]">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-800/50 bg-gradient-to-r from-[#161b22]/80 to-[#1f2937]/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200 lg:hidden group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all" />
          </button>
          
          {/* User Info */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                {otherUser.avatar ? (
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {otherUser.name ? otherUser.name[0].toUpperCase() : '?'}
                  </span>
                )}
              </div>
              {otherUser.lastActive && new Date().getTime() - otherUser.lastActive.getTime() < 300000 && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0d1117] shadow-lg">
                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold truncate text-lg">{otherUser.name}</h2>
              <div className="flex items-center space-x-2">
                <p className="text-gray-400 text-sm">@{otherUser.username}</p>
                <span className="text-gray-600">•</span>
                <p className="text-gray-500 text-sm">{otherUser.college}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-2">
            <button className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
              <Phone className="w-5 h-5 text-gray-400 group-hover:text-green-400 group-hover:scale-110 transition-all" />
            </button>
            <button className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
              <Video className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
            </button>
            <button className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
              <MoreVertical className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-4 sm:p-6 space-y-4">
        {loading && messages.length === 0 && (
          <div className="text-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400/30 rounded-full animate-spin mx-auto mb-4" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-gray-400 font-medium">Loading messages...</p>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Start the conversation</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
              Send a message to <span className="text-blue-400 font-medium">{otherUser.name}</span> to get started and build a connection
            </p>
          </div>
        )}

        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 sm:p-6 border-t border-gray-800/50 bg-gradient-to-r from-[#161b22]/80 to-[#1f2937]/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
            <Image className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
          </button>
          <button className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group">
            <Paperclip className="w-5 h-5 text-gray-400 group-hover:text-green-400 group-hover:scale-110 transition-all" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={`Message ${otherUser.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 bg-[#0d1117]/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm sm:text-base transition-all duration-200 hover:bg-[#0d1117]"
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 group"
          >
            <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
