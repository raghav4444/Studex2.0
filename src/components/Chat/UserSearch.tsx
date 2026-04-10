import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, MessageCircle, Clock } from 'lucide-react';
import { useUserSearch } from '../../hooks/useUserSearch';
import { ChatSearchResult } from '../../types';

interface UserSearchProps {
  onUserSelect: (user: ChatSearchResult) => void;
  onClose: () => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onUserSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchResults, loading, error, searchUsers, clearSearch } = useUserSearch();
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers, clearSearch]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return 'Never';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={searchRef}
        className="bg-gradient-to-br from-[#0d1117] to-[#161b22] rounded-2xl border border-gray-800/50 w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Start a conversation</h2>
              <p className="text-gray-400 text-sm mt-1">Find someone to chat with</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all" />
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by username, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#161b22]/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm transition-all duration-200 hover:bg-[#161b22]"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {loading && (
            <div className="p-8 text-center">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-blue-400/30 rounded-full animate-spin mx-auto mb-4" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              </div>
              <p className="text-gray-400 text-sm font-medium">Searching...</p>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && searchResults.length === 0 && searchQuery && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
              <p className="text-gray-400 text-sm">Try a different search term</p>
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <div className="space-y-2 p-2">
              {searchResults.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => {
                    console.log('🔍 UserSearch: User clicked:', user);
                    onUserSelect(user);
                  }}
                  className="w-full p-4 hover:bg-gradient-to-r hover:from-[#161b22]/50 hover:to-[#1f2937]/30 transition-all duration-200 text-left rounded-xl mx-2 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-gray-700/30 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-2xl object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-lg">
                            {user.name ? user.name[0].toUpperCase() : '?'}
                          </span>
                        )}
                      </div>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0d1117] shadow-lg">
                          <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-white font-semibold truncate group-hover:text-blue-100 transition-colors">{user.name}</p>
                        <span className="text-gray-500 text-xs bg-gray-800/50 px-2 py-1 rounded-full">@{user.username}</span>
                      </div>
                      <p className="text-gray-400 text-sm truncate mb-2">
                        {user.college} • {user.branch} • Year {user.year}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-500 text-xs">
                          {user.isOnline ? (
                            <span className="text-green-400 font-medium">Online now</span>
                          ) : (
                            `Last seen ${formatLastSeen(user.lastSeen)}`
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Message Button */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-200 shadow-lg group-hover:shadow-xl">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
