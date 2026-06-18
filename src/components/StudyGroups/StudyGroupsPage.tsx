import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeInfo,
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDot,
  Filter,
  Globe,
  Info,
  Link2,
  Lock,
  MapPin,
  Megaphone,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Clock3,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
  Edit,
} from 'lucide-react';
import { StudyGroup } from '../../types';
import { useAuth } from '../AuthProvider';
import { useStudyGroups } from '../../hooks/useStudyGroups';
import CreateGroupModal from './CreateGroupModal';
import GroupChat from './GroupChat';

type GroupTab = 'all' | 'my-groups' | 'joined';
type SortMode = 'recent' | 'members' | 'name';

const StudyGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPrivacy, setSelectedPrivacy] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<GroupTab>('all');
  const [showNotifications, setShowNotifications] = useState(false);
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
    myJoinRequestStatusByGroup,
    refetch
  } = useStudyGroups();

  const currentSelectedGroup = useMemo(() => {
    if (!selectedGroup) return null;
    return studyGroups.find((group) => group.id === selectedGroup.id) || selectedGroup;
  }, [selectedGroup, studyGroups]);

  const subjects = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(studyGroups.map((group) => group.subject))).sort();
    return ['all', ...uniqueSubjects];
  }, [studyGroups]);

  const filteredGroups = useMemo(() => {
    const loweredSearch = searchTerm.trim().toLowerCase();

    return [...studyGroups]
      .filter((group) => {
        const matchesSearch = !loweredSearch ||
          group.name.toLowerCase().includes(loweredSearch) ||
          group.description.toLowerCase().includes(loweredSearch) ||
          group.subject.toLowerCase().includes(loweredSearch) ||
          group.createdBy.name.toLowerCase().includes(loweredSearch) ||
          group.tags.some((tag) => tag.toLowerCase().includes(loweredSearch));

        const matchesSubject = selectedSubject === 'all' || group.subject === selectedSubject;
        const matchesPrivacy = selectedPrivacy === 'all' || (selectedPrivacy === 'private' ? group.isPrivate : !group.isPrivate);

        let matchesTab = true;
        if (activeTab === 'my-groups') {
          matchesTab = group.createdBy.id === user?.id;
        } else if (activeTab === 'joined') {
          matchesTab = isUserMember(group.id);
        }

        return matchesSearch && matchesSubject && matchesPrivacy && matchesTab;
      })
      .sort((left, right) => {
        if (sortMode === 'members') {
          return right.members.length - left.members.length;
        }

        if (sortMode === 'name') {
          return left.name.localeCompare(right.name);
        }

        return right.createdAt.getTime() - left.createdAt.getTime();
      });
  }, [activeTab, isUserMember, searchTerm, selectedPrivacy, selectedSubject, sortMode, studyGroups, user?.id]);

  const stats = useMemo(() => {
    const joinedGroups = studyGroups.filter((group) => isUserMember(group.id)).length;
    const myGroups = studyGroups.filter((group) => group.createdBy.id === user?.id).length;
    const privateGroups = studyGroups.filter((group) => group.isPrivate).length;
    const pendingRequests = incomingJoinRequests.length;
    const nextSession = [...studyGroups]
      .filter((group) => group.nextSessionAt)
      .sort((left, right) => (left.nextSessionAt?.getTime() || 0) - (right.nextSessionAt?.getTime() || 0))[0];

    return {
      totalGroups: studyGroups.length,
      joinedGroups,
      myGroups,
      privateGroups,
      pendingRequests,
      nextSession,
    };
  }, [incomingJoinRequests.length, isUserMember, studyGroups, user?.id]);

  const subjectChips = useMemo(() => {
    return subjects
      .filter((subject) => subject !== 'all')
      .map((subject) => ({
        label: subject,
        count: studyGroups.filter((group) => group.subject === subject).length,
      }))
      .slice(0, 8);
  }, [studyGroups, subjects]);

  const notificationItems = [
    ...incomingJoinRequests.map((request) => ({
      id: request.id,
      title: `${request.requester.name} wants to join ${request.groupName}`,
      detail: `Requested ${formatTimeAgo(request.createdAt)}`,
      tone: 'request',
    })),
    ...studyGroups
      .filter((group) => myJoinRequestStatusByGroup[group.id] === 'pending')
      .map((group) => ({
        id: group.id,
        title: `Waiting on approval for ${group.name}`,
        detail: group.subject,
        tone: 'pending',
      })),
  ];

  const tabs: Array<{ key: GroupTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { key: 'all', label: 'All Groups', icon: Users },
    { key: 'my-groups', label: 'My Groups', icon: Settings },
    { key: 'joined', label: 'Joined', icon: UserPlus },
  ];

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinStudyGroup(groupId);
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

  const formatDateTime = (date?: Date) => {
    if (!date) return 'Not scheduled';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[#161b22] p-10 text-center shadow-xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-2xl bg-blue-500/70" />
          <p className="text-gray-300">Loading study groups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-[2rem] border border-red-500/20 bg-[#161b22] p-10 text-center shadow-xl">
          <h3 className="text-lg font-medium text-white mb-2">Error loading study groups</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="rounded-2xl bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b1020] via-[#0d1117] to-[#161b22] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_28%)]" />
        <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-20 left-12 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative grid gap-5 p-4 sm:p-6 md:p-8 xl:grid-cols-[1.4fr_0.9fr] xl:gap-8">
          <div className="space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-200 sm:px-4 sm:py-2 sm:text-sm">
              <Sparkles className="h-4 w-4" />
              Study Groups
            </div>

            <div className="space-y-3 sm:space-y-4 flex-wrap">
              <h1 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-5xl sm:leading-tight">
                Build study circles, approve members, and keep every session in one place.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-gray-300 sm:text-lg sm:leading-7">
                Join open groups, request access to private rooms, manage approvals, and open a real group chat with the same polished surface as the notes library.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur sm:p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Groups</p>
                <p className="mt-2 text-2xl font-semibold text-white leading-none">{stats.totalGroups}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur sm:p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Joined</p>
                <p className="mt-2 text-2xl font-semibold text-white leading-none">{stats.joinedGroups}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur sm:p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Mine</p>
                <p className="mt-2 text-2xl font-semibold text-white leading-none">{stats.myGroups}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur sm:col-span-1 sm:p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Private</p>
                <p className="mt-2 text-2xl font-semibold text-white leading-none">{stats.privateGroups}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-blue-100 sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Create Group
              </button>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:border-white/25 hover:bg-white/10 sm:w-auto"
              >
                <Bell className="h-4 w-4" />
                {notificationItems.length} alerts
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {subjectChips.map((chip) => {
                const active = selectedSubject === chip.label;

                return (
                  <button
                    key={chip.label}
                    onClick={() => setSelectedSubject(active ? 'all' : chip.label)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-all ${active ? 'border-blue-400/40 bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'}`}
                  >
                    {chip.label}
                    <span className="ml-2 rounded-full bg-black/15 px-2 py-0.5 text-xs">{chip.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden gap-4 xl:grid">
            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4 backdrop-blur-xl sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400 sm:text-sm sm:normal-case sm:tracking-normal">Next session</p>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                    {stats.nextSession?.name || 'Nothing scheduled yet'}
                  </h2>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 sm:h-12 sm:w-12">
                  <CalendarClock className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-4 space-y-3 sm:mt-5">
                {studyGroups.slice(0, 3).map((group, index) => (
                  <div key={group.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3 sm:p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 text-blue-300 sm:h-11 sm:w-11">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white sm:text-sm">{group.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400 sm:text-xs">
                        <span>{group.subject}</span>
                        <span>•</span>
                        <span>{group.members.length}/{group.maxMembers} members</span>
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <BadgeInfo className="h-4 w-4 text-blue-300" />
                Quick filters
              </div>
              <div className="mt-4 grid gap-3">
                <select
                  value={selectedPrivacy}
                  onChange={(e) => setSelectedPrivacy(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All groups</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>

                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="recent">Most recent</option>
                  <option value="members">Most members</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-gray-300">
                <div className="flex items-center gap-2 text-white">
                  <Shield className="h-4 w-4 text-cyan-300" />
                  Privacy snapshot
                </div>
                <p className="mt-2">{stats.privateGroups} private rooms need approval, and all joins honor the membership limit in the database.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-[#161b22] p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
            <button onClick={() => setShowNotifications(false)} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {notificationItems.length > 0 ? (
            <div className="space-y-3">
              {notificationItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-400">{item.detail}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300">{item.tone}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No notifications right now.</p>
          )}
        </div>
      )}

      {incomingJoinRequests.length > 0 && (
        <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-[#161b22] p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300">Pending requests</p>
              <h2 className="text-xl font-semibold text-white">Approve or reject new members</h2>
            </div>
            <Megaphone className="h-5 w-5 text-blue-300" />
          </div>

          <div className="space-y-3">
            {incomingJoinRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0d1117] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{request.requester.name} wants to join {request.groupName}</p>
                  <p className="text-sm text-gray-400">Requested {formatTimeAgo(request.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleJoinRequestDecision(request.id, 'accepted')}
                    className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleJoinRequestDecision(request.id, 'rejected')}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-[#161b22]/90 p-4 shadow-xl backdrop-blur sm:mb-8 sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.9fr_0.7fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search groups, creators, or tags..."
              className="w-full rounded-2xl border border-white/10 bg-[#0d1117] pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 sm:py-3.5"
            />
          </div>

          <div className="relative">
            <BookOpen className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-12 pr-4 text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 sm:py-3.5"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSortMode((prev) => (prev === 'recent' ? 'members' : prev === 'members' ? 'name' : 'recent'))}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10 sm:py-3.5"
          >
            <Clock3 className="h-4 w-4" />
            {sortMode === 'recent' ? 'Recent' : sortMode === 'members' ? 'Members' : 'Name'}
          </button>

          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10 sm:py-3.5">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-[1.75rem] border border-white/10 bg-[#161b22] p-1 shadow-xl">
        <div className="grid gap-1 md:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-2 rounded-[1.35rem] px-4 py-3 text-sm font-medium transition-all ${active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 sm:gap-6">
        {filteredGroups.map((group) => {
          const joinState = getJoinState(group.id);
          const isMember = isUserMember(group.id);
          const canEdit = isUserAdmin(group.id);
          const topMembers = group.members.slice(0, 4);

          return (
            <article
              key={group.id}
              className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#161b22] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/10 sm:rounded-[1.75rem]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="h-28 bg-gradient-to-br from-blue-500/20 via-cyan-400/10 to-violet-500/15 sm:h-32">
                <div className="flex h-full items-start justify-between p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gray-200">{group.subject}</span>
                    {group.isPrivate ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/20 bg-orange-500/15 px-3 py-1 text-xs text-orange-200">
                        <Lock className="h-3.5 w-3.5" />
                        Private
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">
                        <Globe className="h-3.5 w-3.5" />
                        Public
                      </span>
                    )}
                  </div>
                  <button className="rounded-full border border-white/10 bg-black/20 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 text-blue-300 ring-1 ring-white/5">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>{formatTimeAgo(group.createdAt)}</p>
                    <p className="mt-1">{group.members.length}/{group.maxMembers} members</p>
                  </div>
                </div>

                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-white sm:text-xl">
                  {group.name}
                </h3>

                <p className="mb-4 line-clamp-3 text-sm leading-6 text-gray-400">
                  {group.description}
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {group.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                      #{tag}
                    </span>
                  ))}
                  {group.tags.length > 3 && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                      +{group.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="mb-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Creator</p>
                    <p className="mt-2 truncate text-sm font-medium text-white">{group.createdBy.name}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Next session</p>
                    <p className="mt-2 truncate text-sm font-medium text-white">{formatDateTime(group.nextSessionAt)}</p>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {topMembers.map((member) => (
                      <div key={member.id} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#161b22] bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                        {member.name.charAt(0)}
                      </div>
                    ))}
                    {group.members.length > 4 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#161b22] bg-gray-700 text-xs font-bold text-white">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">{group.members.length}/{group.maxMembers} members</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isMember ? (
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500/15 px-4 py-2.5 text-sm font-medium text-red-300 transition-all hover:bg-red-500/25"
                    >
                      <UserMinus className="h-4 w-4" />
                      Leave
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={joinState === 'pending' || joinState === 'full'}
                      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition-all ${joinState === 'pending' || joinState === 'full' ? 'cursor-not-allowed bg-gray-700 text-gray-400' : joinState === 'request' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      <UserPlus className="h-4 w-4" />
                      {joinState === 'request' ? 'Request Join' : joinState === 'pending' ? 'Pending' : joinState === 'full' ? 'Full' : 'Join Group'}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowGroupDetails(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10"
                  >
                    View
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {isMember && (
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowGroupChat(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </button>
                  )}
                </div>

                {canEdit && (
                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowEditGroup(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-200 transition-colors hover:bg-blue-500/20"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-400/15 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 transition-colors hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="rounded-[1.75rem] border border-white/10 bg-[#161b22] px-6 py-12 text-center shadow-xl">
          <Users className="mx-auto mb-4 h-10 w-10 text-gray-500" />
          <h3 className="text-lg font-medium text-white mb-2">No study groups found</h3>
          <p className="text-gray-400 mb-4">Try adjusting your filters or create a new study group.</p>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="rounded-2xl bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Create Your First Group
          </button>
        </div>
      )}

      {showGroupDetails && currentSelectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" style={{ overflow: 'hidden' }}>
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#161b22] shadow-2xl shadow-black/40">
            <div className="p-5 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-blue-300">Group details</p>
                  <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{currentSelectedGroup.name}</h2>
                  <p className="mt-2 text-sm text-gray-400">{currentSelectedGroup.description}</p>
                </div>
                <button onClick={() => setShowGroupDetails(false)} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Members</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{currentSelectedGroup.members.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Capacity</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{currentSelectedGroup.maxMembers}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Privacy</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{currentSelectedGroup.isPrivate ? 'Private' : 'Public'}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-300">
                      <BadgeInfo className="h-4 w-4 text-blue-300" />
                      Group info
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Creator</p>
                        <p className="mt-2 text-white">{currentSelectedGroup.createdBy.name}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Subject</p>
                        <p className="mt-2 text-white">{currentSelectedGroup.subject}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Created</p>
                        <p className="mt-2 text-white">{formatTimeAgo(currentSelectedGroup.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Next session</p>
                        <p className="mt-2 text-white">{formatDateTime(currentSelectedGroup.nextSessionAt)}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="h-4 w-4 text-cyan-300" />
                          Location
                        </div>
                        <p className="mt-2 text-white">{currentSelectedGroup.meetingLocation || 'Not set'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-[#0d1117] p-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Link2 className="h-4 w-4 text-cyan-300" />
                          Meeting link
                        </div>
                        <p className="mt-2 truncate text-white">{currentSelectedGroup.meetingLink || 'Not set'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-medium text-gray-300 mb-4">Members</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {currentSelectedGroup.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#0d1117] p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{member.name}</p>
                            <p className="truncate text-xs text-gray-400">{member.branch}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-medium text-gray-300 mb-3">Actions</p>
                    <div className="space-y-3">
                      {isUserMember(currentSelectedGroup.id) ? (
                        <button
                          onClick={() => handleLeaveGroup(currentSelectedGroup.id)}
                          className="w-full rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/25"
                        >
                          Leave group
                        </button>
                      ) : (
                        (() => {
                          const joinState = getJoinState(currentSelectedGroup.id);

                          return (
                            <button
                              onClick={() => handleJoinGroup(currentSelectedGroup.id)}
                              disabled={joinState === 'pending' || joinState === 'full'}
                              className="w-full rounded-2xl bg-blue-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-400"
                            >
                              {joinState === 'request' ? 'Request join' : joinState === 'pending' ? 'Pending approval' : joinState === 'full' ? 'Full' : 'Join group'}
                            </button>
                          );
                        })()
                      )}

                      {isUserMember(currentSelectedGroup.id) && (
                        <button
                          onClick={() => setShowGroupChat(true)}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                        >
                          Open chat
                        </button>
                      )}

                      {isUserAdmin(currentSelectedGroup.id) && (
                        <button
                          onClick={() => {
                            setShowGroupDetails(false);
                            setShowEditGroup(true);
                          }}
                          className="w-full rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-500/20"
                        >
                          Edit group
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <CircleDot className="h-4 w-4 text-blue-300" />
                      Tags
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedGroup.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isUserAdmin(selectedGroup.id) && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <p className="text-sm font-medium text-gray-300 mb-3">Admin tools</p>
                      <button
                        onClick={() => handleDeleteGroup(currentSelectedGroup.id)}
                        className="w-full rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/25"
                      >
                        Delete group
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSuccess={refetch}
      />

      {currentSelectedGroup && (
        <CreateGroupModal
          isOpen={showEditGroup}
          onClose={() => setShowEditGroup(false)}
          onSuccess={refetch}
          mode="edit"
          initialGroup={currentSelectedGroup}
        />
      )}

      {currentSelectedGroup && (
        <GroupChat
          group={currentSelectedGroup}
          isOpen={showGroupChat}
          onClose={() => setShowGroupChat(false)}
        />
      )}
    </div>
  );
};

export default StudyGroupsPage;