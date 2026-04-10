import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Lock, 
  Globe, 
  BookOpen, 
  Settings, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Clock, 
  UserPlus, 
  UserMinus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Filter,
  Star,
  TrendingUp,
  Activity,
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  ExternalLink,
  Video,
  Phone,
  Share2,
  Bookmark,
  Flag
} from 'lucide-react';
import { StudyGroup } from '../../types';
import { useAuth } from '../AuthProvider';
import { useStudyGroups } from '../../hooks/useStudyGroups';
import CreateGroupModal from './CreateGroupModal';
import GroupChat from './GroupChat';

const StudyGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my-groups' | 'joined'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showGroupChat, setShowGroupChat] = useState(false);

  const {
    studyGroups,
    loading,
    error,
    joinStudyGroup,
    leaveStudyGroup,
    respondToJoinRequest,
    deleteStudyGroup,
    isUserMember,
    isUserAdmin,
    getJoinState,
    incomingJoinRequests,
    refetch
  } = useStudyGroups();

  const subjects = ['all', 'Computer Science', 'Physics', 'Mechanical Engineering', 'Mathematics', 'Chemistry', 'Biology', 'Economics', 'Psychology'];

  // Filter groups based on search, subject, and tab
  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || group.subject === selectedSubject;
    
    let matchesTab = true;
    if (activeTab === 'my-groups') {
      matchesTab = group.createdBy.id === user?.id;
    } else if (activeTab === 'joined') {
      matchesTab = isUserMember(group.id);
    }
    
    return matchesSearch && matchesSubject && matchesTab;
  });

  // Mock notifications data
  const [notifications] = useState([
    { id: '1', type: 'join_request', message: 'Sarah Chen wants to join your DSA group', time: '2m ago' },
    { id: '2', type: 'new_member', message: 'Mike Johnson joined your Physics group', time: '1h ago' },
    { id: '3', type: 'group_update', message: 'Study session moved to tomorrow', time: '3h ago' }
  ]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinStudyGroup(groupId);
      setNotificationCount(prev => prev + 1);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveStudyGroup(groupId);
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this study group?')) {
      try {
        await deleteStudyGroup(groupId);
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const handleJoinRequestDecision = async (requestId: string, decision: 'accepted' | 'rejected') => {
    try {
      await respondToJoinRequest(requestId, decision);
    } catch (joinRequestError) {
      console.error('Error updating join request:', joinRequestError);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 bg-blue-500 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-400">Loading study groups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error loading study groups</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Study Groups</h1>
          <p className="text-gray-400">Join collaborative learning communities and study together</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-[#161b22] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-[#161b22] border border-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-800 hover:bg-[#0d1117] transition-colors">
                      <p className="text-sm text-white">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#161b22] rounded-lg border border-gray-800 mb-6">
        <div className="flex items-center space-x-1 p-1">
          {[
            { key: 'all', label: 'All Groups', icon: Users },
            { key: 'my-groups', label: 'My Groups', icon: Settings },
            { key: 'joined', label: 'Joined', icon: UserPlus }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      {incomingJoinRequests.length > 0 && (
        <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Pending Join Requests</h2>
          <div className="space-y-3">
            {incomingJoinRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-[#0d1117] border border-gray-700 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{request.requester.name} wants to join {request.groupName}</p>
                  <p className="text-xs text-gray-400">Requested {formatTimeAgo(request.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleJoinRequestDecision(request.id, 'accepted')}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleJoinRequestDecision(request.id, 'rejected')}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search study groups..."
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="bg-[#161b22] rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {group.isPrivate ? (
                      <Lock className="w-4 h-4 text-orange-400" />
                    ) : (
                      <Globe className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                    {group.subject}
                  </span>
                  
                  {/* Group Actions Menu */}
                  <div className="relative">
                    <button className="p-1 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                {group.name}
              </h3>

              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {group.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {group.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
                {group.tags.length > 3 && (
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                    +{group.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 4).map((member, index) => (
                      <div key={index} className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#161b22]">
                        {member.name.charAt(0)}
                      </div>
                    ))}
                    {group.members.length > 4 && (
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#161b22]">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {group.members.length}/{group.maxMembers} members
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {group.createdBy.name.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-400">{group.createdBy.name}</span>
                </div>
                
                <span className="text-xs text-gray-500">{formatTimeAgo(group.createdAt)}</span>
              </div>

              <div className="flex items-center space-x-2">
                {isUserMember(group.id) ? (
                  <button
                    onClick={() => handleLeaveGroup(group.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-all duration-200"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span>Leave</span>
                  </button>
                ) : (
                  (() => {
                    const joinState = getJoinState(group.id);
                    const isDisabled = joinState === 'pending' || joinState === 'full';
                    const isRequest = joinState === 'request' || joinState === 'pending';
                    const buttonText = joinState === 'request'
                      ? 'Request Join'
                      : joinState === 'pending'
                        ? 'Request Pending'
                        : joinState === 'accepted'
                          ? 'Join Now'
                          : joinState === 'full'
                            ? 'Group Full'
                            : 'Join Group';

                    return (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={isDisabled}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white text-sm rounded-lg transition-all duration-200 ${
                          isDisabled
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : isRequest
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{buttonText}</span>
                      </button>
                    );
                  })()
                )}
                
                <button
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowGroupDetails(true);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-200"
                >
                  View
                </button>
                
                {isUserMember(group.id) && (
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowGroupChat(true);
                    }}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat</span>
                  </button>
                )}
              </div>

              {isUserAdmin(group.id) && (
                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-800">
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowEditGroup(true);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs rounded transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No study groups found</h3>
          <p className="text-gray-400 mb-4">Try adjusting your search or create a new study group</p>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Create Your First Group
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={showCreateGroup} 
        onClose={() => setShowCreateGroup(false)} 
      />

      {/* Group Chat */}
      {selectedGroup && (
        <GroupChat 
          group={selectedGroup}
          isOpen={showGroupChat}
          onClose={() => setShowGroupChat(false)}
        />
      )}
    </div>
  );
};

export default StudyGroupsPage;