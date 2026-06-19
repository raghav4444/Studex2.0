import React, { useState, useEffect, useRef } from 'react';
import {
  Home, TrendingUp, Users, Bookmark, Bell, Search, Plus, Sparkles,
  MessageCircle, Heart, Share, Eye, MoreHorizontal, X,
  ArrowUpRight, GraduationCap, Code, Calendar, BookOpen, Award,
  Video, Image, Smile, Send, AtSign, Hash, Clock, ChevronRight,
  Verified, Globe, School, Sparkle
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { usePosts } from '../../hooks/usePosts';
import { useCommunityAccess } from '../../hooks/useCommunityAccess';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { canCreate, canLike, accessLevel, isReadOnly, isPartial } = useCommunityAccess();
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'college'>('for-you');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const { posts, loading, createPost, likePost, unlikePost } = usePosts('college');

  // Mock trending topics
  const trendingTopics = [
    { tag: 'TechFest2026', posts: '2.4K', trend: '+12%' },
    { tag: 'CampusPlacements', posts: '1.8K', trend: '+8%' },
    { tag: 'ResearchPaper', posts: '890', trend: '+5%' },
    { tag: 'CodingChallenge', posts: '654', trend: '+15%' },
  ];

  // Mock suggested users to follow
  const suggestedUsers = [
    { name: 'CS Department', username: '@csdept', followers: '12K', verified: true },
    { name: 'Campus Connect', username: '@campusconnect', followers: '8.5K', verified: false },
    { name: 'Placement Cell', username: '@placements', followers: '5.2K', verified: true },
  ];

  // Quick shortcuts
  const shortcuts = [
    { id: 'events', label: 'Events', icon: Calendar, color: 'from-pink-500 to-rose-500', unread: 3 },
    { id: 'groups', label: 'Groups', icon: Users, color: 'from-blue-500 to-cyan-500', unread: 0 },
    { id: 'notes', label: 'Notes', icon: BookOpen, color: 'from-green-500 to-emerald-500', unread: 2 },
    { id: 'mentors', label: 'Mentors', icon: Award, color: 'from-purple-500 to-violet-500', unread: 0 },
  ];

  // Mock stories
  const stories = [
    { id: '1', name: 'College Updates', avatar: null, hasStory: true },
    { id: '2', name: 'Tech Club', avatar: null, hasStory: true },
    { id: '3', name: 'Placement Cell', avatar: null, hasStory: true },
    { id: '4', name: 'Cultural Fest', avatar: null, hasStory: false },
  ];

  const handleCreatePost = async (content: string) => {
    try {
      await createPost(content);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <div className="min-h-screen bg-[#0d1016]">
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">

          {/* ============ LEFT SIDEBAR ============ */}
          <div className="hidden lg:flex flex-col space-y-4">
            {/* Profile Card */}
            <div className="sticky top-6 bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden">
              {/* Cover */}
              <div className="h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
              <div className="px-4 pb-4 -mt-8">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl border-4 border-[#161b22]">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <h3 className="font-bold text-white mt-2">{user?.name || 'User'}</h3>
                <p className="text-sm text-gray-500">@{user?.username || 'user'}</p>

                <div className="flex justify-between mt-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="font-bold text-white">245</p>
                    <p className="text-xs text-gray-500">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">1.2K</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">89</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-[#161b22] rounded-2xl border border-white/10 p-2">
              {[
                { icon: Home, label: 'Home', active: true },
                { icon: Users, label: 'My Groups', active: false },
                { icon: Bookmark, label: 'Saved Posts', active: false },
                { icon: Calendar, label: 'Events', active: false },
                { icon: Award, label: 'Achievements', active: false },
              ].map((item, i) => (
                <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Shortcuts */}
            <div className="bg-[#161b22] rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Quick Shortcuts</h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <button key={shortcut.id} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${shortcut.color} flex items-center justify-center`}>
                        <shortcut.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">{shortcut.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {shortcut.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">{shortcut.unread}</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ============ MAIN CONTENT ============ */}
          <div className="space-y-6">
            {/* Stories Bar */}
            <div className="bg-[#161b22] rounded-2xl border border-white/10 p-4">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {stories.map((story) => (
                  <div key={story.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer">
                    <div className={`w-14 h-14 rounded-xl ${story.hasStory ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5' : 'bg-white/10'} flex items-center justify-center`}>
                      <div className="w-full h-full rounded-xl bg-[#161b22] flex items-center justify-center text-lg">
                        {story.name.charAt(0)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 max-w-[56px] text-center truncate">{story.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search posts, people, topics..."
                className="w-full pl-12 pr-4 py-3.5 bg-[#161b22] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Feed Tabs */}
            <div className="flex gap-1 p-1 bg-[#161b22] rounded-2xl border border-white/10">
              {[
                { id: 'for-you', label: 'For You', icon: Sparkle },
                { id: 'following', label: 'Following', icon: Users },
                { id: 'college', label: 'College Hub', icon: GraduationCap },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Post Composer */}
            {(isReadOnly || isPartial) && canCreate && (
              <div className={`p-4 rounded-xl border text-sm ${isReadOnly ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-blue-500/30 bg-blue-500/10 text-blue-300'}`}>
                {isReadOnly
                  ? 'You have read-only access. Verify your college email for full access.'
                  : 'You have partial access. Some actions are limited until fully verified.'}
              </div>
            )}

            {canCreate && (
              <div className="bg-[#161b22] rounded-2xl border border-white/10 p-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => setShowComposeModal(true)}
                      className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-500 transition-all"
                    >
                      Share something with your network...
                    </button>
                    <div className="flex gap-4 mt-3">
                      {[
                        { icon: Image, label: 'Media' },
                        { icon: Calendar, label: 'Event' },
                        { icon: Code, label: 'Code' },
                        { icon: Hash, label: 'Poll' },
                      ].map((action, i) => (
                        <button key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                          <action.icon className="w-4 h-4" />
                          <span className="text-xs hidden sm:inline">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#161b22] rounded-2xl border border-white/10 p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-700" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-700 rounded w-1/4" />
                        <div className="h-20 bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    onLike={canLike ? likePost : undefined}
                    onUnlike={canLike ? unlikePost : undefined}
                    canLike={canLike}
                  />
                ))}

                {posts.length === 0 && (
                  <div className="text-center py-16 bg-[#161b22] rounded-2xl border border-white/10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
                    <p className="text-gray-500">Be the first to share something with your network!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============ RIGHT SIDEBAR ============ */}
          <div className="hidden xl:flex flex-col space-y-4">
            {/* Trending */}
            <div className="bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden sticky top-6">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Trending Now
                </h3>
              </div>
              <div className="p-2">
                {trendingTopics.map((topic, i) => (
                  <button key={i} className="w-full p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">#{topic.tag}</span>
                      <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">{topic.trend}</span>
                    </div>
                    <p className="text-xs text-gray-500">{topic.posts} posts</p>
                  </button>
                ))}
              </div>
              <button className="w-full p-3 text-sm text-blue-400 hover:text-blue-300 border-t border-white/10">
                Show more
              </button>
            </div>

            {/* Suggested Users */}
            <div className="bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white">Who to follow</h3>
              </div>
              <div className="p-2">
                {suggestedUsers.map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-medium shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-white truncate">{user.name}</span>
                        {user.verified && <Verified className="w-4 h-4 text-blue-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500">{user.followers} followers</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full p-3 text-sm text-blue-400 hover:text-blue-300 border-t border-white/10">
                Show more
              </button>
            </div>

            {/* Footer Links */}
            <div className="px-4 text-xs text-gray-600">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <a href="#" className="hover:underline">About</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Cookies</a>
                <a href="#" className="hover:underline">Accessibility</a>
                <a href="#" className="hover:underline">Ads</a>
              </div>
              <p className="mt-2">© 2026 Studex</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <ComposeModal
          user={user}
          onClose={() => setShowComposeModal(false)}
          onPost={handleCreatePost}
        />
      )}
    </div>
  );
};

// Post Item Component
interface PostItemProps {
  post: any;
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
  canLike?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({ post, onLike, onUnlike, canLike = true }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const handleLike = () => {
    if (!canLike) return;
    setIsLiked(!isLiked);
    if (isLiked) onUnlike?.(post.id);
    else onLike?.(post.id);
  };

  return (
    <article className="bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {post.isAnonymous ? '?' : post.author.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-white">{post.isAnonymous ? 'Anonymous' : post.author.name}</span>
                {post.author.isVerified && <Verified className="w-4 h-4 text-blue-400" />}
                <span className="text-gray-500 text-sm">•</span>
                <span className="text-gray-500 text-sm">{formatTimeAgo(post.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-500">{post.author.college}</p>
            </div>
          </div>
          <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <p className="text-gray-200 leading-relaxed mb-3">{post.content}</p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag: string, i: number) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {post.fileUrl && (
        <div className="px-4 pb-3">
          <div className="rounded-xl overflow-hidden bg-[#0d1117] border border-white/5">
            <img src={post.fileUrl} alt="Post media" className="w-full h-64 object-cover" />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              disabled={!canLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                !canLike ? 'cursor-not-allowed opacity-50' : ''
              } ${isLiked ? 'text-red-400 bg-red-500/10' : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments?.length || 0}</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-colors">
              <Share className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'}`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 py-3 border-t border-white/10 bg-[#0d1117]">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-medium shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 bg-[#161b22] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm"
              />
              <button disabled={!comment.trim()} className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {(post.comments || []).slice(0, 3).map((c: any) => (
            <div key={c.id} className="flex gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
                {c.author.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white">{c.author.name}</span>
                  <span className="text-xs text-gray-500">{formatTimeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-300">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

// Compose Modal
const ComposeModal: React.FC<{ user: any; onClose: () => void; onPost: (content: string) => void }> = ({ user, onClose, onPost }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onPost(content);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-[#0d1117] rounded-2xl border border-white/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            Post
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="flex-1 min-h-[120px] bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-lg"
              autoFocus
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex gap-2">
            {[
              { icon: Image, label: 'Media' },
              { icon: Code, label: 'Code' },
              { icon: Hash, label: 'Poll' },
              { icon: Calendar, label: 'Event' },
              { icon: AtSign, label: 'Mention' },
            ].map((item, i) => (
              <button key={i} className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors">
                <item.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500">{content.length}/500</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;