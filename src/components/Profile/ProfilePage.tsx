import React, { useState, useMemo } from 'react';
import {
  Edit3, Shield, Eye, EyeOff, BookOpen, Award, Calendar, Users,
  Activity, MapPin, GraduationCap, Building, Github, Linkedin, Globe,
  Mail, LogOut, Camera, Upload, ChevronRight, BarChart3, Settings,
  User, X, Check, Clock, TrendingUp, MessageSquare, Heart, Bookmark,
  Star, CalendarCheck, CalendarX, UserPlus, UserCheck, Sparkles,
  Zap, Target, Flame, Trophy, Code, Palette, TrendingDown
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { useEvents } from '../../hooks/useEvents';
import { useStudyGroups } from '../../hooks/useStudyGroups';

const categoryColors: Record<string, string> = {
  hackathon: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  workshop: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  conference: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  competition: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  webinar: 'bg-green-500/20 text-green-300 border-green-500/30',
  meetup: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  cultural: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  sports: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  fest: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  seminar: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
};

const categoryLabels: Record<string, string> = {
  hackathon: 'Hackathon', workshop: 'Workshop', conference: 'Conference',
  competition: 'Competition', webinar: 'Webinar', meetup: 'Meetup',
  cultural: 'Cultural', sports: 'Sports', fest: 'Fest', seminar: 'Seminar',
};

interface ActivityItem {
  id: string;
  type: 'joined_event' | 'joined_group' | 'likes_post' | 'commented' | 'shared' | 'achievement' | 'created_event' | 'created_group';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { events, isUserAttending, isUserOrganizer } = useEvents();
  const { studyGroups, isUserMember, isUserAdmin } = useStudyGroups();

  const [activeTab, setActiveTab] = useState<'posts' | 'groups' | 'events' | 'activity' | 'settings'>('activity');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: user?.name || 'User',
    bio: user?.bio || '',
    college: user?.college || '',
    branch: user?.branch || '',
    year: user?.year?.toString() || '1',
    location: 'India',
    skills: (user?.skills || []).join(', '),
    linkedin: '',
    github: '',
    portfolio: '',
  });

  // Profile data from user
  const displayName = isAnonymous ? 'Anonymous User' : (editForm.name || user?.name || 'User');
  const profilePhoto = user?.avatar;

  // Get user's joined events
  const joinedEvents = useMemo(() => {
    return events.filter(event => isUserAttending(event.id) || isUserOrganizer(event.id));
  }, [events, isUserAttending, isUserOrganizer]);

  // Get user's joined groups
  const joinedGroups = useMemo(() => {
    return studyGroups.filter(group => isUserMember(group.id) || isUserAdmin(group.id));
  }, [studyGroups, isUserMember, isUserAdmin]);

  // Get upcoming and past events
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return joinedEvents.filter(e => new Date(e.date) > now);
  }, [joinedEvents]);

  const pastEvents = useMemo(() => {
    const now = new Date();
    return joinedEvents.filter(e => new Date(e.date) <= now);
  }, [joinedEvents]);

  // Calculate stats
  const stats = useMemo(() => ({
    totalEvents: joinedEvents.length,
    upcomingEventsCount: upcomingEvents.length,
    totalGroups: joinedGroups.length,
    totalPosts: 0,
    totalLikes: joinedEvents.reduce((acc, e) => acc + (e.likeCount || 0), 0),
    totalViews: joinedEvents.reduce((acc, e) => acc + (e.viewCount || 0), 0),
  }), [joinedEvents, upcomingEvents, joinedGroups]);

  // Generate activity feed
  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];

    // Add event activities
    upcomingEvents.slice(0, 3).forEach(event => {
      items.push({
        id: `event-upcoming-${event.id}`,
        type: 'joined_event',
        title: `Registered for ${event.title}`,
        description: `${categoryLabels[event.category]} • ${new Date(event.date).toLocaleDateString()}`,
        timestamp: new Date(event.createdAt || Date.now()),
        icon: <Calendar className="w-4 h-4" />,
        color: 'text-blue-400 bg-blue-500/20',
      });
    });

    // Add group membership
    joinedGroups.slice(0, 3).forEach(group => {
      items.push({
        id: `group-${group.id}`,
        type: 'joined_group',
        title: `Joined ${group.name}`,
        description: `${group.subject} • ${group.members?.length || 0} members`,
        timestamp: new Date(group.createdAt),
        icon: <Users className="w-4 h-4" />,
        color: 'text-purple-400 bg-purple-500/20',
      });
    });

    // Add some sample recent activity
    items.push({
      id: 'sample-1',
      type: 'achievement',
      title: 'Event Enthusiast',
      description: 'Attended 5 or more events',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: <Trophy className="w-4 h-4" />,
      color: 'text-amber-400 bg-amber-500/20',
    });

    items.push({
      id: 'sample-2',
      type: 'achievement',
      title: 'Social Butterfly',
      description: 'Joined 3 study groups',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: <UserPlus className="w-4 h-4" />,
      color: 'text-green-400 bg-green-500/20',
    });

    // Sort by timestamp
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [upcomingEvents, joinedGroups]);

  // Profile completion calculation
  const completionPercentage = useMemo(() => {
    const fields = [
      editForm.name,
      editForm.bio,
      editForm.college,
      editForm.branch,
      editForm.skills,
      profilePhoto,
      editForm.linkedin,
      editForm.github,
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [editForm, profilePhoto]);

  const handleSaveProfile = () => {
    // In a real app, save to backend
    console.log('Saving profile:', editForm);
    setIsEditMode(false);
  };

  // Skills for display
  const skills = useMemo(() => {
    return editForm.skills.split(',').map(s => s.trim()).filter(Boolean);
  }, [editForm.skills]);

  // Navigation helper - dispatches custom event to change app tabs
  const navigateTo = (tab: string) => {
    // Dispatch custom event that App.tsx listens to
    window.dispatchEvent(new CustomEvent('navigate', { detail: { tab } }));
  };

  const openGroup = (groupId: string) => {
    // Navigate to study groups page
    navigateTo('study-groups');
    console.log('Opening group:', groupId);
  };

  if (!user) return null;

  const tabs = [
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0d1016]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0b1020] via-[#0d1117] to-[#161b22] border border-white/10 mb-6">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_40%)]" />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white/20 shadow-2xl">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl sm:text-5xl font-bold text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {user.isVerified && !isAnonymous && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-[#0b1020]">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <button className="absolute -bottom-2 -left-2 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center border-2 border-white/20 transition-colors">
                    <Camera className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
                {/* Member Badge */}
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300">Pro Member</span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col sm:flex-row items-center lg:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        {displayName}
                      </h1>
                      <button
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`p-2 rounded-xl transition-all ${isAnonymous ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        title={isAnonymous ? 'Disable anonymous mode' : 'Enable anonymous mode'}
                      >
                        {isAnonymous ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-gray-400 mb-4">@{user.username || 'user'}</p>

                    {!isAnonymous && editForm.bio && (
                      <p className="text-gray-300 mb-4 max-w-2xl">{editForm.bio}</p>
                    )}

                    {/* Quick Stats */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-gray-300">{stats.totalEvents} <span className="text-gray-500">Events</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-gray-300">{stats.totalGroups} <span className="text-gray-500">Groups</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Flame className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-gray-300">{stats.totalViews} <span className="text-gray-500">Views</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-xl transition-all">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info Chips */}
                {!isAnonymous && (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4">
                    {user.college && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
                        <Building className="w-4 h-4 text-purple-400" />
                        {user.college}
                      </span>
                    )}
                    {user.branch && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
                        <GraduationCap className="w-4 h-4 text-blue-400" />
                        {user.branch}
                      </span>
                    )}
                    {editForm.location && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
                        <MapPin className="w-4 h-4 text-green-400" />
                        {editForm.location}
                      </span>
                    )}
                  </div>
                )}

                {/* Skills */}
                {!isAnonymous && skills.length > 0 && (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4">
                    {skills.slice(0, 6).map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {skills.length > 6 && (
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs">
                        +{skills.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Completion Bar */}
            {completionPercentage < 100 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Profile completion</span>
                  <span className="text-sm font-semibold text-blue-400">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-white/[0.03] rounded-2xl border border-white/10 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                  <button className="text-sm text-blue-400 hover:text-blue-300">View all</button>
                </div>

                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl bg-[#161b22]/80 border border-white/10 hover:border-white/20 transition-all">
                        <div className={`w-12 h-12 rounded-xl ${activity.color} flex items-center justify-center shrink-0`}>
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{activity.title}</p>
                          <p className="text-sm text-gray-400">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Activity className="w-16 h-16" />}
                    title="No activity yet"
                    description="Your activity will appear here once you start engaging"
                  />
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'blue' },
                    { label: 'Upcoming', value: stats.upcomingEventsCount, icon: CalendarCheck, color: 'green' },
                    { label: 'Groups', value: stats.totalGroups, icon: Users, color: 'purple' },
                    { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'red' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-[#161b22]/80 border border-white/10">
                      <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                        stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                        stat.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">My Study Groups</h2>
                  <span className="text-sm text-gray-400">{joinedGroups.length} groups</span>
                </div>

                {joinedGroups.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {joinedGroups.map((group) => (
                      <div key={group.id} className="group p-4 rounded-2xl bg-[#161b22]/80 border border-white/10 hover:border-purple-500/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">{group.name}</h3>
                              <p className="text-xs text-gray-500">{group.subject}</p>
                            </div>
                          </div>
                          {isUserAdmin(group.id) && (
                            <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium">Admin</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{group.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{group.members?.length || 0} / {group.maxMembers}</span>
                          </div>
                          <button onClick={() => openGroup(group.id)} className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-medium hover:bg-purple-500/20 transition-colors">
                            Open
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Users className="w-16 h-16" />}
                    title="No groups joined"
                    description="Join study groups to collaborate with peers"
                  />
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">My Events</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 font-medium">
                      {upcomingEvents.length} Upcoming
                    </button>
                  </div>
                </div>

                {joinedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {/* Upcoming Events */}
                    {upcomingEvents.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Upcoming</h3>
                        {upcomingEvents.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    )}

                    {/* Past Events */}
                    {pastEvents.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Past Events</h3>
                        {pastEvents.map((event) => (
                          <EventCard key={event.id} event={event} isPast />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Calendar className="w-16 h-16" />}
                    title="No events joined"
                    description="Join events to expand your network and learn"
                  />
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[#161b22]/80 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <SettingItem
                      icon={<User className="w-5 h-5" />}
                      title="Personal Information"
                      description="Update your name, bio, and profile picture"
                      onClick={() => setIsEditMode(true)}
                    />
                    <SettingItem
                      icon={<Shield className="w-5 h-5" />}
                      title="Privacy & Security"
                      description="Manage your privacy settings and account security"
                    />
                    <SettingItem
                      icon={<Bell className="w-5 h-5" />}
                      title="Notifications"
                      description="Configure how you receive notifications"
                    />
                    <SettingItem
                      icon={<Globe className="w-5 h-5" />}
                      title="Connected Accounts"
                      description="Link your social media accounts"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Sign Out</p>
                        <p className="text-sm text-gray-400">Sign out of your account on this device</p>
                      </div>
                      <button
                        onClick={signOut}
                        className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="p-5 rounded-2xl bg-[#161b22]/80 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab('events'); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white">Find Events</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 ml-auto" />
                </button>
                <button
                  onClick={() => navigateTo('study-groups')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white">Browse Groups</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 ml-auto" />
                </button>
                <button
                  onClick={() => navigateTo('notes')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white">My Notes</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 ml-auto" />
                </button>
                <button
                  onClick={() => navigateTo('skills')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white">Skill Hub</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 ml-auto" />
                </button>
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="p-5 rounded-2xl bg-[#161b22]/80 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Achievements</h3>
                <span className="text-xs text-blue-400">2/10 Unlocked</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: <Trophy className="w-5 h-5" />, earned: true, color: 'amber' },
                  { icon: <UserPlus className="w-5 h-5" />, earned: true, color: 'green' },
                  { icon: <Star className="w-5 h-5" />, earned: false, color: 'gray' },
                  { icon: <Flame className="w-5 h-5" />, earned: false, color: 'gray' },
                ].map((a, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      a.earned
                        ? a.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                        : 'bg-white/5 text-gray-600'
                    }`}
                  >
                    {a.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Popular in Network */}
            <div className="p-5 rounded-2xl bg-[#161b22]/80 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Trending Events</h3>
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[event.category] || 'bg-gray-500/20 text-gray-300'}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.attendees?.length || 0} attending</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditMode && (
        <EditProfileModal
          editForm={editForm}
          setEditForm={setEditForm}
          onSave={handleSaveProfile}
          onClose={() => setIsEditMode(false)}
        />
      )}
    </div>
  );
};

// Helper Components
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-sm">{description}</p>
  </div>
);

const SettingItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}> = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-left"
  >
    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-medium text-white">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-600" />
  </button>
);

const EventCard: React.FC<{ event: any; isPast?: boolean }> = ({ event, isPast }) => {
  const eventDate = new Date(event.date);
  const spotsLeft = event.maxAttendees ? event.maxAttendees - (event.attendees?.length || 0) : null;

  return (
    <div className={`p-4 rounded-2xl bg-[#161b22]/80 border transition-all ${isPast ? 'border-white/5 opacity-70' : 'border-white/10 hover:border-white/20'}`}>
      <div className="flex gap-4">
        <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${categoryColors[event.category] || 'bg-gray-500/20 text-gray-300'}`}>
          <span className="text-[10px] font-bold uppercase">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
          <span className="text-xl font-bold">{eventDate.getDate()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white line-clamp-1">{event.title}</h3>
            {isPast ? (
              <span className="shrink-0 px-2 py-1 rounded-lg bg-gray-500/20 text-gray-400 text-xs">Attended</span>
            ) : (
              <span className="shrink-0 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs">Registered</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
            <span>{categoryLabels[event.category]}</span>
            {event.isOnline ? (
              <span className="flex items-center gap-1 text-green-400">Online</span>
            ) : (
              <span className="truncate">{event.location}</span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-500">{event.attendees?.length || 0} attending</span>
            {spotsLeft !== null && !isPast && spotsLeft <= 10 && (
              <span className="text-xs text-amber-400">{spotsLeft} spots left</span>
            )}
            {event.fee === 0 && <span className="text-xs text-green-400">Free</span>}
            {event.fee > 0 && <span className="text-xs text-gray-400">₹{event.fee}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditProfileModal: React.FC<{
  editForm: any;
  setEditForm: (form: any) => void;
  onSave: () => void;
  onClose: () => void;
}> = ({ editForm, setEditForm, onSave, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d1117] border border-white/10" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="Your name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* College & Branch */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">College</label>
              <input
                type="text"
                value={editForm.college}
                onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Branch</label>
              <input
                type="text"
                value={editForm.branch}
                onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Year & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
              <select
                value={editForm.year}
                onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-white/10 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">Graduate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              value={editForm.skills}
              onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="JavaScript, Python, React..."
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-medium text-gray-400">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                  placeholder="linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">GitHub</label>
                <input
                  type="url"
                  value={editForm.github}
                  onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                  placeholder="github.com/..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Portfolio</label>
                <input
                  type="url"
                  value={editForm.portfolio}
                  onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b22] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                  placeholder="yoursite.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Check className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility function
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function Bell({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default ProfilePage;