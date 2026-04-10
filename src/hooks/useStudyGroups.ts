import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { StudyGroup, User } from '../types';

type JoinRequestStatus = 'pending' | 'accepted' | 'rejected';

interface JoinRequestRecord {
  id: string;
  group_id: string;
  requester_id: string;
  status: JoinRequestStatus;
  created_at: string;
}

interface IncomingJoinRequest {
  id: string;
  groupId: string;
  groupName: string;
  status: JoinRequestStatus;
  requester: User;
  createdAt: Date;
}

type JoinState = 'member' | 'join' | 'request' | 'pending' | 'accepted' | 'full';
type CreatorColumn = 'creator_id' | 'created_by';

export const useStudyGroups = () => {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [creatorColumn, setCreatorColumn] = useState<CreatorColumn>('creator_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incomingJoinRequests, setIncomingJoinRequests] = useState<IncomingJoinRequest[]>([]);
  const [myJoinRequestStatusByGroup, setMyJoinRequestStatusByGroup] = useState<Record<string, JoinRequestStatus>>({});

  // Mock data for when database is not available
  const mockStudyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'Data Structures & Algorithms Mastery',
      subject: 'Computer Science',
      description: 'Weekly problem-solving sessions focusing on coding interview preparation and algorithmic thinking.',
      members: [
        {
          id: '1',
          name: 'Sarah Chen',
          username: 'sarahchen',
          email: 'sarah@mit.edu',
          college: 'MIT',
          branch: 'Computer Science',
          year: 3,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        },
        {
          id: '2',
          name: 'Mike Johnson',
          username: 'mikejohnson',
          email: 'mike@stanford.edu',
          college: 'Stanford',
          branch: 'Computer Science',
          year: 2,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        }
      ],
      maxMembers: 15,
      createdBy: {
        id: '1',
        name: 'Sarah Chen',
        username: 'sarahchen',
        email: 'sarah@mit.edu',
        college: 'MIT',
        branch: 'Computer Science',
        year: 3,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      isPrivate: false,
      tags: ['DSA', 'Coding', 'Interview Prep'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'Quantum Physics Discussion Circle',
      subject: 'Physics',
      description: 'Deep dive into quantum mechanics concepts, problem-solving, and research discussions.',
      members: [
        {
          id: '3',
          name: 'Alex Rodriguez',
          username: 'alexrodriguez',
          email: 'alex@caltech.edu',
          college: 'Caltech',
          branch: 'Physics',
          year: 4,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        }
      ],
      maxMembers: 10,
      createdBy: {
        id: '3',
        name: 'Alex Rodriguez',
        username: 'alexrodriguez',
        email: 'alex@caltech.edu',
        college: 'Caltech',
        branch: 'Physics',
        year: 4,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      isPrivate: true,
      tags: ['Quantum', 'Physics', 'Research'],
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      name: 'Mechanical Design Project Team',
      subject: 'Mechanical Engineering',
      description: 'Collaborative group working on innovative mechanical design projects and CAD modeling.',
      members: [
        {
          id: '4',
          name: 'Emily Wang',
          username: 'emilywang',
          email: 'emily@stanford.edu',
          college: 'Stanford',
          branch: 'Mechanical Engineering',
          year: 3,
          isVerified: true,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        }
      ],
      maxMembers: 8,
      createdBy: {
        id: '4',
        name: 'Emily Wang',
        username: 'emilywang',
        email: 'emily@stanford.edu',
        college: 'Stanford',
        branch: 'Mechanical Engineering',
        year: 3,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      isPrivate: false,
      tags: ['CAD', 'Design', 'Projects'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  const resolveAuthUserId = useCallback(async () => {
    if (authUserId) return authUserId;
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) {
      throw new Error('User not authenticated');
    }
    setAuthUserId(data.user.id);
    return data.user.id;
  }, [authUserId]);

  const detectCreatorColumn = useCallback(async (): Promise<CreatorColumn> => {
    const creatorIdResult = await supabase
      .from('study_groups')
      .select('id, creator_id')
      .limit(1);

    if (!creatorIdResult.error) {
      if (creatorColumn !== 'creator_id') {
        setCreatorColumn('creator_id');
      }
      return 'creator_id';
    }

    const createdByResult = await supabase
      .from('study_groups')
      .select('id, created_by')
      .limit(1);

    if (!createdByResult.error) {
      if (creatorColumn !== 'created_by') {
        setCreatorColumn('created_by');
      }
      return 'created_by';
    }

    return creatorColumn;
  }, [creatorColumn]);

  const toUiUser = useCallback((profile: any, fallbackUserId: string): User => {
    const email = profile?.email || 'unknown@studex.app';
    const name = profile?.name || email.split('@')[0] || 'Unknown User';
    const username = profile?.username || name.toLowerCase().replace(/[^a-z0-9]/g, '') || `user${fallbackUserId.slice(0, 6)}`;

    return {
      id: profile?.id || fallbackUserId,
      name,
      username,
      email,
      college: profile?.college || 'Unknown College',
      branch: profile?.branch || 'Unknown Branch',
      year: profile?.year || 1,
      isVerified: Boolean(profile?.is_verified),
      isAnonymous: false,
      avatar: profile?.avatar_url || undefined,
      joinedAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
      lastActive: profile?.updated_at ? new Date(profile.updated_at) : new Date(),
    };
  }, []);

  const fetchJoinRequestData = useCallback(async (_groups: StudyGroup[], currentAuthUserId: string, creatorCol: CreatorColumn) => {
    try {
      const { data: myRequests, error: myRequestsError } = await supabase
        .from('study_group_join_requests')
        .select('group_id, status')
        .eq('requester_id', currentAuthUserId);

      if (myRequestsError) {
        throw myRequestsError;
      }

      const statusByGroup: Record<string, JoinRequestStatus> = {};
      (myRequests || []).forEach((request: { group_id: string; status: JoinRequestStatus }) => {
        statusByGroup[request.group_id] = request.status;
      });
      setMyJoinRequestStatusByGroup(statusByGroup);

      const { data: creatorGroups, error: creatorGroupsError } = await supabase
        .from('study_groups')
        .select('id, name')
        .eq(creatorCol, currentAuthUserId);

      if (creatorGroupsError) {
        throw creatorGroupsError;
      }

      if (!creatorGroups || creatorGroups.length === 0) {
        setIncomingJoinRequests([]);
        return;
      }

      const groupIds = creatorGroups.map((group: { id: string; name: string }) => group.id);
      const groupNameById = new Map(creatorGroups.map((group: { id: string; name: string }) => [group.id, group.name]));

      const { data: pendingRequests, error: pendingRequestsError } = await supabase
        .from('study_group_join_requests')
        .select('id, group_id, requester_id, status, created_at')
        .in('group_id', groupIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (pendingRequestsError) {
        throw pendingRequestsError;
      }

      const requesterAuthIds = Array.from(new Set((pendingRequests || []).map((request: JoinRequestRecord) => request.requester_id)));

      let profilesByUserId = new Map<string, any>();
      if (requesterAuthIds.length > 0) {
        const { data: requesterProfiles, error: requesterProfilesError } = await supabase
          .from('profiles')
          .select('id, user_id, name, username, email, college, branch, year, is_verified, avatar_url, created_at, updated_at')
          .in('user_id', requesterAuthIds);

        if (requesterProfilesError) {
          throw requesterProfilesError;
        }

        profilesByUserId = new Map((requesterProfiles || []).map((profile: any) => [profile.user_id, profile]));
      }

      const mappedRequests: IncomingJoinRequest[] = (pendingRequests || []).map((request: JoinRequestRecord) => ({
        id: request.id,
        groupId: request.group_id,
        groupName: groupNameById.get(request.group_id) || 'Study Group',
        status: request.status,
        requester: toUiUser(profilesByUserId.get(request.requester_id), request.requester_id),
        createdAt: new Date(request.created_at),
      }));

      setIncomingJoinRequests(mappedRequests);
    } catch (requestError) {
      console.warn('Error fetching join requests:', requestError);
      setIncomingJoinRequests([]);
      setMyJoinRequestStatusByGroup({});
    }
  }, [toUiUser, user?.id]);

  useEffect(() => {
    if (!user) {
      setAuthUserId(null);
      return;
    }

    const syncAuthId = async () => {
      try {
        await resolveAuthUserId();
      } catch {
        setAuthUserId(null);
      }
    };

    syncAuthId();
  }, [user, resolveAuthUserId]);

  const fetchStudyGroups = useCallback(async () => {
    if (!user) {
      setStudyGroups([]);
      setIncomingJoinRequests([]);
      setMyJoinRequestStatusByGroup({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const currentAuthUserId = await resolveAuthUserId();
      const creatorCol = await detectCreatorColumn();

      const { data: groups, error: groupsError } = await supabase
        .from('study_groups')
        .select(`id, ${creatorCol}, name, subject, description, max_members, is_private, tags, created_at`)
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.warn('Database not available, using mock data:', groupsError.message);
        setStudyGroups(mockStudyGroups);
        setIncomingJoinRequests([]);
        setMyJoinRequestStatusByGroup({});
        return;
      }

      const groupRows = groups || [];
      const groupIds = groupRows.map((group: any) => group.id);

      let memberRows: Array<{ group_id: string; user_id: string }> = [];
      if (groupIds.length > 0) {
        const { data: members, error: membersError } = await supabase
          .from('study_group_members')
          .select('group_id, user_id')
          .in('group_id', groupIds);

        if (membersError) {
          throw membersError;
        }

        memberRows = members || [];
      }

      const creatorAuthIds = groupRows.map((group: any) => group[creatorCol]);
      const memberAuthIds = memberRows.map((member) => member.user_id);
      const allAuthUserIds = Array.from(new Set([...creatorAuthIds, ...memberAuthIds].filter(Boolean)));

      let profilesByUserId = new Map<string, any>();
      if (allAuthUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, user_id, name, username, email, college, branch, year, is_verified, avatar_url, created_at, updated_at')
          .in('user_id', allAuthUserIds);

        if (profilesError) {
          throw profilesError;
        }

        profilesByUserId = new Map((profiles || []).map((profile: any) => [profile.user_id, profile]));
      }

      const membersByGroup = memberRows.reduce((acc, member) => {
        const list = acc.get(member.group_id) || [];
        list.push(member.user_id);
        acc.set(member.group_id, list);
        return acc;
      }, new Map<string, string[]>());

      const formattedGroups: StudyGroup[] = groupRows.map((group: any) => ({
        id: group.id,
        name: group.name,
        subject: group.subject,
        description: group.description,
        members: (membersByGroup.get(group.id) || []).map((memberAuthId) =>
          toUiUser(profilesByUserId.get(memberAuthId), memberAuthId)
        ),
        maxMembers: group.max_members,
        createdBy: toUiUser(profilesByUserId.get(group[creatorCol]), group[creatorCol]),
        isPrivate: group.is_private,
        tags: group.tags || [],
        createdAt: new Date(group.created_at),
      }));

      setStudyGroups(formattedGroups);
      await fetchJoinRequestData(formattedGroups, currentAuthUserId, creatorCol);
    } catch (err) {
      console.warn('Error fetching study groups, using mock data:', err);
      setStudyGroups(mockStudyGroups);
      setIncomingJoinRequests([]);
      setMyJoinRequestStatusByGroup({});
      setError(err instanceof Error ? err.message : 'Failed to fetch study groups');
    } finally {
      setLoading(false);
    }
  }, [user, fetchJoinRequestData, resolveAuthUserId, toUiUser, detectCreatorColumn]);

  useEffect(() => {
    fetchStudyGroups();
  }, [fetchStudyGroups]);

  const createStudyGroup = async (groupData: {
    name: string;
    subject: string;
    description: string;
    maxMembers: number;
    isPrivate: boolean;
    tags: string[];
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const currentAuthUserId = await resolveAuthUserId();
      const creatorCol = await detectCreatorColumn();
      const insertPayload = {
        name: groupData.name,
        subject: groupData.subject,
        description: groupData.description,
        max_members: groupData.maxMembers,
        is_private: groupData.isPrivate,
        tags: groupData.tags,
        [creatorCol]: currentAuthUserId,
      };

      const { data, error } = await supabase
        .from('study_groups')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to create study group');
      }

      // Add creator as first member
      await supabase
        .from('study_group_members')
        .insert({
          group_id: data.id,
          user_id: currentAuthUserId,
        });

      await fetchStudyGroups();
      return data;
    } catch (err) {
      console.error('Error creating study group:', err);
      throw err;
    }
  };

  const joinStudyGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const currentAuthUserId = await resolveAuthUserId();

      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .select('id, is_private, max_members')
        .eq('id', groupId)
        .single();

      if (groupError || !group) {
        throw new Error('Study group not found');
      }

      const { count: memberCount, error: memberCountError } = await supabase
        .from('study_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      if (memberCountError) {
        throw memberCountError;
      }

      const { data: existingMembership, error: membershipError } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('group_id', groupId)
        .eq('user_id', currentAuthUserId)
        .maybeSingle();

      if (membershipError) {
        throw membershipError;
      }

      if (existingMembership) {
        return 'already_member' as const;
      }

      if ((memberCount || 0) >= group.max_members) {
        throw new Error('This group has reached the member limit');
      }

      if (group.is_private) {
        const { data: existingRequest, error: requestLookupError } = await supabase
          .from('study_group_join_requests')
          .select('status')
          .eq('group_id', groupId)
          .eq('requester_id', currentAuthUserId)
          .maybeSingle();

        if (requestLookupError) {
          throw requestLookupError;
        }

        if (existingRequest?.status === 'pending') {
          await fetchJoinRequestData(studyGroups, currentAuthUserId, creatorColumn);
          return 'request_pending' as const;
        }

        if (existingRequest?.status !== 'accepted') {
          const { error: upsertRequestError } = await supabase
            .from('study_group_join_requests')
            .upsert(
              {
                group_id: groupId,
                requester_id: currentAuthUserId,
                status: 'pending',
              },
              { onConflict: 'group_id,requester_id' }
            );

          if (upsertRequestError) {
            throw upsertRequestError;
          }

          await fetchJoinRequestData(studyGroups, currentAuthUserId, creatorColumn);
          return 'request_sent' as const;
        }
      }

      const { error: joinError } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: currentAuthUserId,
        });

      if (joinError) {
        throw joinError;
      }

      await fetchStudyGroups();
      return 'joined' as const;
    } catch (err) {
      console.error('Error joining study group:', err);
      throw err;
    }
  };

  const leaveStudyGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const currentAuthUserId = await resolveAuthUserId();

      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentAuthUserId);

      if (error) {
        console.warn('Database not available, using mock data for leave');
        // Update mock data
        setStudyGroups(prev => prev.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              members: group.members.filter(member => member.id !== user.id)
            };
          }
          return group;
        }));
        return;
      }

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error leaving study group:', err);
      throw err;
    }
  };

  const updateStudyGroup = async (groupId: string, updates: Partial<{
    name: string;
    subject: string;
    description: string;
    maxMembers: number;
    isPrivate: boolean;
    tags: string[];
  }>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const currentAuthUserId = await resolveAuthUserId();
      const creatorCol = await detectCreatorColumn();

      const { error } = await supabase
        .from('study_groups')
        .update({
          name: updates.name,
          subject: updates.subject,
          description: updates.description,
          max_members: updates.maxMembers,
          is_private: updates.isPrivate,
          tags: updates.tags,
        })
        .eq('id', groupId)
        .eq(creatorCol, currentAuthUserId);

      if (error) throw error;

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error updating study group:', err);
      throw err;
    }
  };

  const deleteStudyGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const currentAuthUserId = await resolveAuthUserId();
      const creatorCol = await detectCreatorColumn();

      // Delete all members first
      await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId);

      // Delete the group
      const { error } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId)
        .eq(creatorCol, currentAuthUserId);

      if (error) throw error;

      await fetchStudyGroups();
    } catch (err) {
      console.error('Error deleting study group:', err);
      throw err;
    }
  };

  const respondToJoinRequest = async (requestId: string, decision: 'accepted' | 'rejected') => {
    if (!user) throw new Error('User not authenticated');

    try {
      const currentAuthUserId = await resolveAuthUserId();
      const creatorCol = await detectCreatorColumn();
      const { error: updateError } = await supabase
        .from('study_group_join_requests')
        .update({ status: decision })
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }

      await fetchJoinRequestData(studyGroups, currentAuthUserId, creatorCol);
    } catch (err) {
      console.error('Error responding to join request:', err);
      throw err;
    }
  };

  const isUserMember = (groupId: string) => {
    if (!user) return false;
    const group = studyGroups.find(g => g.id === groupId);
    return group?.members.some(member => member.id === user.id) || false;
  };

  const isUserAdmin = (groupId: string) => {
    if (!user) return false;
    const group = studyGroups.find(g => g.id === groupId);
    return group?.createdBy.id === user.id;
  };

  const getJoinState = (groupId: string): JoinState => {
    const group = studyGroups.find((item) => item.id === groupId);
    if (!group) return 'join';

    if (isUserMember(groupId)) return 'member';
    if (group.members.length >= group.maxMembers) return 'full';
    if (!group.isPrivate) return 'join';

    const requestStatus = myJoinRequestStatusByGroup[groupId];
    if (requestStatus === 'pending') return 'pending';
    if (requestStatus === 'accepted') return 'accepted';
    return 'request';
  };

  return {
    studyGroups,
    loading,
    error,
    incomingJoinRequests,
    myJoinRequestStatusByGroup,
    createStudyGroup,
    joinStudyGroup,
    leaveStudyGroup,
    respondToJoinRequest,
    updateStudyGroup,
    deleteStudyGroup,
    isUserMember,
    isUserAdmin,
    getJoinState,
    refetch: fetchStudyGroups,
  };
};
