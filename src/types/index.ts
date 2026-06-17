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

/** Event categories inspired by Unstop/Devpost competition taxonomy. */
export type EventCategory =
  | 'hackathon'
  | 'workshop'
  | 'conference'
  | 'competition'
  | 'webinar'
  | 'meetup'
  | 'cultural'
  | 'sports'
  | 'fest'
  | 'seminar';

/** Difficulty for filtering/labeling events. */
export type EventDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** Event lifecycle status. */
export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  /** End time of the event. Optional — used when isMultiDay is true. */
  endDate?: Date;
  location: string;
  organizer: User;
  attendees: string[];
  maxAttendees?: number;
  tags: string[];
  isOnline: boolean;
  meetingLink?: string;
  /** Cover image/banner for the event card and detail view. */
  coverImage?: string;
  /** Unstop-style categorization. */
  category: EventCategory;
  /** Sub-category — e.g. "AI/ML", "Web3", "Design". */
  subcategory?: string;
  /** Difficulty targeted. */
  difficulty: EventDifficulty;
  /** Lifecycle status. */
  status: EventStatus;
  /** Whether the event spans multiple days. */
  isMultiDay?: boolean;
  /** Markdown/plaintext eligibility text. */
  eligibility?: string;
  /** Rules / guidelines text. */
  rules?: string;
  /** Prize information text — e.g. "1st: ₹50k, 2nd: ₹25k". */
  prizes?: string;
  /** Total prize pool value (numeric) for sort/filter. */
  prizePool?: number;
  /** Currency code for prizePool. */
  prizeCurrency?: string;
  /** Entry fee. 0 = free. */
  fee?: number;
  /** Min team size (1 for solo). */
  minTeamSize?: number;
  /** Max team size (1 for solo). */
  maxTeamSize?: number;
  /** Deadline for registration/start of event. */
  registrationDeadline?: Date;
  /** Featured hackathons/highlights surfaced in hero. */
  isFeatured?: boolean;
  /** Trending score computed by views/likes/saveCount. */
  trendingScore?: number;
  /** Optional FAQs in the detail view. */
  faqs?: FAQ[];
  /** Day-of schedule timeline. */
  schedule?: ScheduleItem[];
  /** List of requirements. */
  requirements?: string[];
  /** Contact email for organizer. */
  contactEmail?: string;
  /** External website URL. */
  websiteUrl?: string;
  /** Primary language (e.g. "English", "Hindi"). */
  language?: string;
  /** Number of saved/bookmarked users. */
  saveCount?: number;
  /** Number of likes. */
  likeCount?: number;
  /** Number of detail-page views. */
  viewCount?: number;
  /** Optional gallery of past-event media URLs (recap). */
  gallery?: string[];
  /** Allow teams to be formed in-app. */
  allowsTeams?: boolean;
  /** Set when the user has bookmarked/saved the event (client state). */
  isSaved?: boolean;
  /** Set when the user has liked the event (client state). */
  isLiked?: boolean;
  /** Set when the user is registered/attending (mirrors isUserAttending). */
  isRegistered?: boolean;
  createdAt?: Date;
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
  coverImage?: string;
  coverImageUrl?: string;
  meetingLocation?: string;
  meetingLink?: string;
  nextSessionAt?: Date;
  nextSessionTopic?: string;
  lastActivityAt?: Date;
  updatedAt?: Date;
}

export interface StudyGroupAnnouncement {
  id: string;
  groupId: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: Date;
}

export interface StudyGroupResource {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: Date;
}

export interface StudyGroupSession {
  id: string;
  groupId: string;
  topic: string;
  startsAt: Date;
  endsAt?: Date;
  location?: string;
  meetingLink?: string;
  notes?: string;
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

// ============================================================================
// Event Team System (Unstop-style)
// ============================================================================

export type TeamMemberRole = 'captain' | 'developer' | 'designer' | 'pm' | 'researcher' | 'member';

export interface TeamMember {
  userId: string;
  user: User;
  role: TeamMemberRole;
  joinedAt: Date;
}

export interface EventTeam {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  captainId: string;
  members: TeamMember[];
  maxSize: number;
  inviteCode?: string;
  projectTitle?: string;
  projectUrl?: string;
  isOpen: boolean; // accepting new members
  status: 'active' | 'disbanded';
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamJoinRequest {
  id: string;
  teamId: string;
  eventId: string;
  userId: string;
  user: User;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  eventId: string;
  email: string;
  inviteCode: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}