import React, { useState, useEffect, useRef } from 'react';
import { 
  School, 
  Globe, 
  Users, 
  MessageSquare, 
  Bell, 
  Calendar,
  BookOpen,
  Briefcase,
  Filter,
  Search,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { usePosts } from '../../hooks/usePosts';
import { useCommunityAccess } from '../../hooks/useCommunityAccess';

// Lazy load components for better performance
const PostComposer = React.lazy(() => import('./PostComposer'));
const PostCard = React.lazy(() => import('./PostCard'));
const ChatPage = React.lazy(() => import('../Chat/ChatPage'));
const NotificationDropdown = React.lazy(() => import('./NotificationDropdown'));

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { canCreate, canLike, accessLevel, isReadOnly, isPartial } = useCommunityAccess();
  const [activeTab, setActiveTab] = useState<'college' | 'global' | 'chat'>('college');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const { posts, loading, createPost, likePost, unlikePost } = usePosts(activeTab === 'chat' ? 'college' : activeTab);
  

  // Mock notification count
  const [notificationCount, setNotificationCount] = useState(8);

  const handleCreatePost = async (content: string, file?: File, isAnonymous?: boolean) => {
    try {
      await createPost(content, file, isAnonymous);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle clicking outside notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Welcome Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 truncate">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-400 line-clamp-2">
              Here's what's happening in your {activeTab === 'college' ? 'college' : activeTab === 'global' ? 'global' : 'chat'} community
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 sm:p-2 bg-[#161b22] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors touch-manipulation"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 sm:w-80 max-w-[calc(100vw-2rem)] bg-[#161b22] border border-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold text-white">Notifications</h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="p-1 text-gray-400 hover:text-white transition-colors touch-manipulation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    <React.Suspense fallback={<div className="p-4 text-center text-gray-400">Loading...</div>}>
                      <NotificationDropdown onNotificationCountChange={setNotificationCount} />
                    </React.Suspense>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Actions</span>
              <span className="sm:hidden">Actions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="mb-6 sm:mb-8 bg-[#161b22] rounded-lg p-4 sm:p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button className="flex items-center space-x-3 p-3 sm:p-4 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-blue-500 transition-colors touch-manipulation">
              <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-white text-sm">Share Notes</span>
            </button>
            <button className="flex items-center space-x-3 p-3 sm:p-4 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-green-500 transition-colors touch-manipulation">
              <Users className="w-5 h-5 text-green-400 shrink-0" />
              <span className="text-white text-sm">Create Study Group</span>
            </button>
            <button className="flex items-center space-x-3 p-3 sm:p-4 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-purple-500 transition-colors touch-manipulation">
              <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
              <span className="text-white text-sm">Add Event</span>
            </button>
            <button className="flex items-center space-x-3 p-3 sm:p-4 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-orange-500 transition-colors touch-manipulation">
              <Briefcase className="w-5 h-5 text-orange-400 shrink-0" />
              <span className="text-white text-sm">Find Jobs</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-4 sm:space-y-6">
          {/* Tab Navigation with Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-1 bg-[#161b22] p-1 rounded-lg border border-gray-800 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('college')}
          className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap touch-manipulation ${
            activeTab === 'college'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <School className="w-4 h-4 shrink-0" />
          <span className="font-medium text-sm sm:text-base">College Hub</span>
        </button>
        
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap touch-manipulation ${
            activeTab === 'global'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span className="font-medium text-sm sm:text-base">Global Feed</span>
        </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap touch-manipulation ${
                  activeTab === 'chat'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="font-medium text-sm sm:text-base">Chat</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:gap-0">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-[#161b22] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm sm:text-base touch-manipulation"
                />
              </div>
              <button className="p-2.5 sm:p-2 bg-[#161b22] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors touch-manipulation">
                <Filter className="w-4 h-4 text-gray-400" />
              </button>
            </div>
      </div>

          {/* Content based on active tab */}
          {activeTab === 'chat' ? (
            <React.Suspense fallback={<div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 animate-pulse h-96"></div>}>
              <ChatPage />
            </React.Suspense>
          ) : (
            <>
      {/* Access level banner for non-full users */}
              {(isReadOnly || isPartial) && (
                <div className={`mb-4 rounded-lg border p-3 text-sm ${isReadOnly ? 'border-amber-500/30 bg-amber-500/10 text-amber-100' : 'border-blue-500/30 bg-blue-500/10 text-blue-100'}`}>
                  {isReadOnly ? (
                    <>You have <strong>read-only</strong> access. Verify your college email for full or partial access to post, like, and comment.</>
                  ) : (
                    <>You have <strong>partial</strong> access. You can post and like; some actions are limited until fully verified.</>
                  )}
                </div>
              )}
      {/* Post Composer - only for users who can create */}
              {canCreate && (
              <div>
        <React.Suspense fallback={<div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 animate-pulse h-32"></div>}>
                  <PostComposer onPostCreate={handleCreatePost} />
        </React.Suspense>
      </div>
              )}

      {/* Posts Feed */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base">Loading posts...</p>
        </div>
      ) : (
      <div className="space-y-4 sm:space-y-6">
                  {filteredPosts.length > 0 ? (
          <React.Suspense fallback={<div className="space-y-4 sm:space-y-6">{Array(3).fill(0).map((_, i) => <div key={i} className="bg-[#161b22] rounded-lg p-4 sm:p-6 border border-gray-800 animate-pulse h-40 sm:h-48"></div>)}</div>}>
                      {filteredPosts.map((post) => (
                        <PostCard 
                          key={post.id} 
                          post={post} 
                          onLike={canLike ? likePost : undefined}
                          onUnlike={canLike ? unlikePost : undefined}
                          canLike={canLike}
                        />
            ))}
          </React.Suspense>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'college' ? (
                <School className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
              ) : (
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
              )}
            </div>
                      <h3 className="text-base sm:text-lg font-medium text-white mb-2">No posts found</h3>
            <p className="text-gray-400 text-sm sm:text-base px-4">
                        {searchQuery ? 'Try adjusting your search terms' : `Be the first to share something with your ${activeTab === 'college' ? 'college' : 'global'} community!`}
            </p>
          </div>
        )}
      </div>
      )}
            </>
          )}
        </div>

        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden xl:block space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-blue-500 transition-colors touch-manipulation">
                <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="text-white">Share Notes</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-green-500 transition-colors touch-manipulation">
                <Users className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-white">Create Study Group</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-purple-500 transition-colors touch-manipulation">
                <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
                <span className="text-white">Add Event</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700 hover:border-orange-500 transition-colors touch-manipulation">
                <Briefcase className="w-5 h-5 text-orange-400 shrink-0" />
                <span className="text-white">Find Jobs</span>
              </button>
            </div>
          </div>

          {/* Study Tips */}
          <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Study Tips</h3>
            <div className="space-y-3">
              <div className="p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-1">Pomodoro Technique</h4>
                <p className="text-xs text-gray-400">Study for 25 minutes, then take a 5-minute break</p>
              </div>
              <div className="p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-1">Active Recall</h4>
                <p className="text-xs text-gray-400">Test yourself regularly instead of just re-reading</p>
              </div>
              <div className="p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-1">Spaced Repetition</h4>
                <p className="text-xs text-gray-400">Review material at increasing intervals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;