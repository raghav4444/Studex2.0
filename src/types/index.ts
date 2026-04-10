/** Community access based on verification. Full = verified, partial = limited write, read_only = view only. */
export type CommunityAccessLevel = 'full' | 'partial' | 'read_only';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  college: string;
  branch: string;
  year: number;
  bio?: string;
  isVerified: boolean;
  isAnonymous: boolean;
  /** Determines create/edit/delete permissions in community features. Defaults from isVerified if omitted. */
  accessLevel?: CommunityAccessLevel;
  avatar?: string;
  skills?: string[];
  achievements?: string[];
  joinedAt: Date;
  lastActive: Date;
}

export interface Post {
  id: string;
  userId: string;
  author: User;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isAnonymous: boolean;
  scope: 'college' | 'global';
  likes: number;
  comments: Comment[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  author: User;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  subject: string;
  semester: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  downloads: number;
  likes: number;
  uploadedBy: User;
  tags: string[];
  description?: string;
  createdAt: Date;
}

export interface Mentor {
  id: string;
  userId: string;
  name: string;
  college: string;
  branch: string;
  year: number;
  skills: string[];
  bio: string;
  isAvailable: boolean;
  rating?: number;
  isVerified: boolean;
  experience: string[];
  achievements: string[];
  hourlyRate?: number;
  responseTime: string;
}

export interface MentorshipRequest {
  id: string;
  requesterId: string;
  mentorId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: User;
  attendees: string[];
  maxAttendees?: number;
  tags: string[];
  isOnline: boolean;
  meetingLink?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  members: User[];
  maxMembers: number;
  createdBy: User;
  isPrivate: boolean;
  tags: string[];
  createdAt: Date;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'internship' | 'full-time' | 'part-time';
  description: string;
  requirements: string[];
  salary?: string;
  postedBy: User;
  applications: number;
  deadline: Date;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'academic' | 'social' | 'contribution';
  earnedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'mentorship' | 'event' | 'achievement' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Chat-related interfaces
export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSearchResult {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  college: string;
  branch: string;
  year: number;
  isOnline: boolean;
  lastSeen?: Date;
}