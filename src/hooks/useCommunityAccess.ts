import { useMemo } from 'react';
import { useAuth } from '../components/AuthProvider';
import type { CommunityAccessLevel } from '../types';

export interface CommunityAccess {
  accessLevel: CommunityAccessLevel;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canComment: boolean;
  canLike: boolean;
  canJoinGroups: boolean;
  isReadOnly: boolean;
  isPartial: boolean;
}

function levelFromUser(level: CommunityAccessLevel | undefined, isVerified: boolean): CommunityAccessLevel {
  if (level) return level;
  return isVerified ? 'full' : 'read_only';
}

export function useCommunityAccess(): CommunityAccess {
  const { user } = useAuth();
  return useMemo(() => {
    const accessLevel = user ? levelFromUser(user.accessLevel, user.isVerified) : 'read_only';
    return {
      accessLevel,
      canCreate: accessLevel === 'full' || accessLevel === 'partial',
      canEdit: accessLevel === 'full' || accessLevel === 'partial',
      canDelete: accessLevel === 'full',
      canComment: accessLevel === 'full' || accessLevel === 'partial',
      canLike: accessLevel === 'full' || accessLevel === 'partial',
      canJoinGroups: accessLevel === 'full' || accessLevel === 'partial',
      isReadOnly: accessLevel === 'read_only',
      isPartial: accessLevel === 'partial',
    };
  }, [user?.accessLevel, user?.isVerified, user]);
}
