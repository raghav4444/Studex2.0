import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Search, User, Clock } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { Conversation } from '../../types';
import UserSearch from './UserSearch';
import { ChatSearchResult } from '../../types';

interface ChatListProps {
  onConversationSelect: (conversation: Conversation) => void;
  chatHook: ReturnType<typeof import('../../hooks/useChat').useChat>;
}

const ChatList: React.FC<ChatListProps> = ({ onConversationSelect, chatHook }) => {
  const { user } = useAuth();
  const { conversations, loading, fetchConversations, startConversation } = chatHook;
  const [showUserSearch, setShowUserSearch] = useState(false);

  useEffect(() => {
    console.log('🔍 ChatList: Conversations state updated:', {
      length: conversations.length,
      conversations: conversations.map(c => ({ id: c.id, participantsCount: c.participants.length }))
    });
  }, [conversations]);

  const handleUserSelect = async (selectedUser: ChatSearchResult) => {
    console.log('🔍 User selected:', selectedUser);
    
    try {
      const conversationId = await startConversation(selectedUser.id);
      console.log('🔍 Conversation ID:', conversationId);
      
      if (conversationId) {
        // Find the conversation and select it
        const conversation = conversations.find(c => c.id === conversationId);
        console.log('🔍 Found conversation:', conversation);
        
        if (conversation) {
          onConversationSelect(conversation);
        } else {
          // If conversation not found in current list, refresh conversations
          console.log('🔄 Conversation not found, refreshing...');
          await fetchConversations();
        }
      } else {
        console.log('❌ Failed to create conversation');
      }
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
    }
    
    setShowUserSearch(false);
  };

  const handleConversationClick = (conversation: Conversation) => {
    onConversationSelect(conversation);
  };

  const formatLastMessage = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const message = conversation.lastMessage;
    const senderName = message.sender.id === user?.id ? 'You' : message.sender.name;
    
    if (message.messageType === 'text') {
      return `${senderName}: ${message.content}`;
    } else if (message.messageType === 'image') {
      return `${senderName}: 📷 Image`;
    } else if (message.messageType === 'file') {
      return `${senderName}: 📎 ${message.fileName}`;
    }
    
    return `${senderName}: Message`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user?.id);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#0d1117] to-[#161b22]">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-800/50 bg-gradient-to-r from-[#0d1117] to-[#161b22]/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-gray-400 text-sm mt-1">Connect with your peers</p>
          </div>
          <button
            onClick={() => setShowUserSearch(true)}
            className="group p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-12 pr-4 py-3 bg-[#161b22]/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm sm:text-base transition-all duration-200 hover:bg-[#161b22]"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {loading && (
          <div className="p-8 text-center">
            <div className="relative">
              <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-blue-400/30 rounded-full animate-spin mx-auto mb-4" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-gray-400 text-sm font-medium">Loading conversations...</p>
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No conversations yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              Start a conversation with someone from your college and build meaningful connections
            </p>
            <button
              onClick={() => setShowUserSearch(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start Chatting
            </button>
          </div>
        )}

        {!loading && conversations.length > 0 && (
          <div className="space-y-2 p-2">
            {conversations.map((conversation, index) => {
              const otherUser = getOtherParticipant(conversation);
              if (!otherUser) return null;

              return (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className="group w-full p-4 hover:bg-gradient-to-r hover:from-[#161b22]/50 hover:to-[#1f2937]/30 transition-all duration-200 text-left rounded-xl mx-2 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-gray-700/30"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                        {otherUser.avatar ? (
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" />
                        )}
                      </div>
                      {otherUser.lastActive && new Date().getTime() - otherUser.lastActive.getTime() < 300000 && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0d1117] shadow-lg">
                          <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-semibold truncate text-base group-hover:text-blue-100 transition-colors">
                            {otherUser.name}
                          </p>
                          <span className="text-gray-500 text-xs hidden sm:inline bg-gray-800/50 px-2 py-1 rounded-full">
                            @{otherUser.username}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 text-xs font-medium bg-gray-800/30 px-2 py-1 rounded-full">
                            {formatTime(conversation.updatedAt)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm truncate mb-2 group-hover:text-gray-300 transition-colors">
                        {formatLastMessage(conversation)}
                      </p>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span className="truncate">
                          {otherUser.college} • {otherUser.branch} • Year {otherUser.year}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearch
          onUserSelect={handleUserSelect}
          onClose={() => setShowUserSearch(false)}
        />
      )}
    </div>
  );
};

export default ChatList;
