import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import {
  Event,
  User,
  EventCategory,
  FAQ,
  ScheduleItem,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_COVERS: Record<EventCategory, string> = {
  hackathon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop',
  workshop: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop',
  conference: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
  competition: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&h=600&fit=crop',
  webinar: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&h=600&fit=crop',
  meetup: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200&h=600&fit=crop',
  cultural: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=600&fit=crop',
  fest: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop',
  seminar: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1200&h=600&fit=crop',
};

const CATEGORY_COVER = (cat: EventCategory): string =>
  DEFAULT_COVERS[cat] ?? DEFAULT_COVERS.workshop;

/**
 * Build a fully-populated mock event so the UI has rich content even before
 * the database has populated rows. Returning the same shape as the database
 * formatter keeps the rest of the page from caring which path it took.
 */
const buildMockEvents = (): Event[] => {
  const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
  const user: User = {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@mit.edu',
    college: 'MIT',
    branch: 'Computer Science',
    year: 3,
    isVerified: true,
    isAnonymous: false,
    joinedAt: new Date(),
    lastActive: new Date(),
  };

  const faqs: FAQ[] = [
    { question: 'Who can participate?', answer: 'All college students with a valid college ID are welcome.' },
    { question: 'Do I need a team?', answer: 'No — you can participate solo or form a team of up to 4 members.' },
    { question: 'Is there a registration fee?', answer: 'No, participation is completely free.' },
  ];

  const baseSchedule: ScheduleItem[] = [
    { time: '09:00 AM', title: 'Registration & Check-in', description: 'Pick up your badge and swag.' },
    { time: '10:00 AM', title: 'Opening Keynote', description: 'Industry leaders share their insights.' },
    { time: '11:30 AM', title: 'Hands-on Session', description: 'Build, design, and ship your project.' },
    { time: '04:00 PM', title: 'Demos & Judging', description: 'Top teams pitch to a panel of experts.' },
    { time: '06:00 PM', title: 'Awards & Wrap-up', description: 'Winners announced, prizes distributed.' },
  ];

  return [
    {
      id: 'evt_1',
      title: 'HackOn 2026 — National AI Hackathon',
      description:
        '48 hours of building, learning, and shipping. Form a team, pick a track (Healthcare, Climate, Education, FinTech), and turn your idea into a working prototype.',
      date: days(3),
      endDate: days(5),
      location: 'MIT Media Lab, Cambridge, MA',
      organizer: { ...user, name: 'HackOn Foundation', college: 'MIT', branch: 'Student Affairs' },
      attendees: ['1', '2', '3', '4', '5', '6', '7', '8'],
      maxAttendees: 200,
      tags: ['AI', 'Hackathon', 'National', '48hr'],
      isOnline: false,
      category: 'hackathon',
      subcategory: 'AI/ML',
      difficulty: 'intermediate',
      status: 'published',
      isMultiDay: true,
      coverImage: CATEGORY_COVER('hackathon'),
      eligibility: 'Open to all undergraduate and graduate students. Valid college ID required.',
      rules: 'All code must be written during the event. Pre-existing libraries and APIs are allowed.',
      prizes: '🥇 1st Prize — ₹1,00,000 + Internship Offers\n🥈 2nd Prize — ₹50,000\n🥉 3rd Prize — ₹25,000\nTrack Winners — ₹10,000 each',
      prizePool: 200000,
      prizeCurrency: 'INR',
      fee: 0,
      minTeamSize: 1,
      maxTeamSize: 4,
      registrationDeadline: days(2),
      isFeatured: true,
      trendingScore: 92,
      faqs,
      schedule: baseSchedule,
      requirements: ['Laptop', 'College ID', 'Idea (optional)'],
      contactEmail: 'team@hackon.events',
      websiteUrl: 'https://hackon.events',
      language: 'English',
      saveCount: 412,
      likeCount: 538,
      viewCount: 1820,
      allowsTeams: true,
      createdAt: new Date(),
    },
    {
      id: 'evt_2',
      title: 'Virtual Career Fair — Top 50 Tech Recruiters',
      description:
        'Meet recruiters from Google, Microsoft, Atlassian, Razorpay, and more. Resume reviews, mock interviews, and on-the-spot offers.',
      date: days(7),
      location: 'Online (Zoom)',
      organizer: { ...user, id: '2', name: 'Career Services', college: 'Stanford University', branch: 'Career Services' },
      attendees: ['1', '2', '3'],
      maxAttendees: 500,
      tags: ['Career', 'Tech', 'Networking'],
      isOnline: true,
      meetingLink: 'https://example.com/career-fair',
      category: 'conference',
      subcategory: 'Career',
      difficulty: 'beginner',
      status: 'published',
      coverImage: CATEGORY_COVER('conference'),
      eligibility: 'All students. Pre-final-year and final-year encouraged.',
      rules: 'Sign up for at least 3 company slots.',
      prizes: 'On-the-spot internship offers for top performers.',
      prizePool: 0,
      fee: 0,
      minTeamSize: 1,
      maxTeamSize: 1,
      isFeatured: true,
      trendingScore: 78,
      saveCount: 230,
      likeCount: 310,
      viewCount: 980,
      allowsTeams: false,
      createdAt: new Date(),
    },
    {
      id: 'evt_3',
      title: 'Design Sprint — UX Research Workshop',
      description:
        'Hands-on workshop with Figma, Miro, and real product problems. Senior UX mentors from Flipkart and CRED walk you through the process.',
      date: days(10),
      location: 'Caltech Design Studio',
      organizer: { ...user, id: '3', name: 'Alex Rodriguez', college: 'Caltech', branch: 'Design', year: 4 },
      attendees: ['1', '2'],
      maxAttendees: 30,
      tags: ['UX', 'Figma', 'Workshop', 'Design'],
      isOnline: false,
      category: 'workshop',
      subcategory: 'UX Design',
      difficulty: 'beginner',
      status: 'published',
      coverImage: CATEGORY_COVER('workshop'),
      eligibility: 'No prior experience required. Laptop + Figma account.',
      fees: 0,
      fee: 0,
      minTeamSize: 1,
      maxTeamSize: 2,
      isFeatured: false,
      trendingScore: 54,
      saveCount: 88,
      likeCount: 102,
      viewCount: 360,
      allowsTeams: true,
      prizes: 'Top 3 projects get featured on the design studio wall.',
      prizePool: 15000,
      createdAt: new Date(),
    },
    {
      id: 'evt_4',
      title: 'CodeArena — Inter-College Coding Contest',
      description:
        '5-hour ICPC-style contest. Solve 8 problems across data structures, algorithms, and math. Live leaderboard.',
      date: days(14),
      location: 'Stanford CS Building, Room 104',
      organizer: { ...user, id: '4', name: 'ACM Stanford', college: 'Stanford University', branch: 'Computer Science' },
      attendees: ['1', '2', '3', '5', '7'],
      maxAttendees: 100,
      tags: ['Competitive Programming', 'ICPC', 'Algorithms'],
      isOnline: false,
      category: 'competition',
      subcategory: 'Competitive Programming',
      difficulty: 'advanced',
      status: 'published',
      coverImage: CATEGORY_COVER('competition'),
      eligibility: 'Open to all undergraduates. Solo participation.',
      rules: 'Standard ICPC rules apply. No internet access during the contest.',
      prizes: '🥇 ₹30,000  🥈 ₹15,000  🥉 ₹10,000',
      prizePool: 60000,
      fee: 100,
      minTeamSize: 1,
      maxTeamSize: 1,
      isFeatured: false,
      trendingScore: 70,
      saveCount: 145,
      likeCount: 220,
      viewCount: 740,
      allowsTeams: false,
      createdAt: new Date(),
    },
    {
      id: 'evt_5',
      title: 'Webinar — Building a Startup from Campus',
      description:
        'Founders who started from their dorm share learnings. Q&A with founders of Unstop, Talview, and more.',
      date: days(2),
      location: 'Online (YouTube Live)',
      organizer: { ...user, id: '5', name: 'E-Cell IIT', college: 'IIT Bombay', branch: 'Entrepreneurship Cell' },
      attendees: ['1', '2', '3', '4', '6', '8', '9'],
      maxAttendees: 1000,
      tags: ['Startup', 'Founders', 'Live'],
      isOnline: true,
      meetingLink: 'https://youtube.com/live',
      category: 'webinar',
      subcategory: 'Startup',
      difficulty: 'beginner',
      status: 'published',
      coverImage: CATEGORY_COVER('webinar'),
      fee: 0,
      eligibility: 'Everyone welcome.',
      minTeamSize: 1,
      maxTeamSize: 1,
      isFeatured: true,
      trendingScore: 88,
      saveCount: 320,
      likeCount: 460,
      viewCount: 1240,
      allowsTeams: false,
      createdAt: new Date(),
    },
    {
      id: 'evt_6',
      title: 'Annual Cultural Fest — Rivieræ 2026',
      description:
        'Three days of music, dance, art, and food. Featuring 30+ events, celebrity night, and an inter-college pro-night.',
      date: days(21),
      endDate: days(23),
      location: 'MIT Open Air Theater',
      organizer: { ...user, id: '6', name: 'MIT Student Council', college: 'MIT', branch: 'Student Affairs' },
      attendees: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      maxAttendees: 1500,
      tags: ['Cultural', 'Fest', 'Music', 'Dance'],
      isOnline: false,
      category: 'fest',
      subcategory: 'Cultural',
      difficulty: 'beginner',
      status: 'published',
      isMultiDay: true,
      coverImage: CATEGORY_COVER('fest'),
      eligibility: 'Open to all students and alumni.',
      rules: 'Carry college ID for entry.',
      prizePool: 0,
      fee: 200,
      minTeamSize: 1,
      maxTeamSize: 8,
      isFeatured: true,
      trendingScore: 95,
      saveCount: 540,
      likeCount: 712,
      viewCount: 2340,
      allowsTeams: true,
      createdAt: new Date(),
    },
    {
      id: 'evt_7',
      title: 'Cricket Premier League — Inter-College T20',
      description:
        'Inter-college cricket league. 16 teams, knockout format, T20 rules. Trophy + ₹50,000 in cash prizes.',
      date: days(28),
      location: 'MIT Sports Complex',
      organizer: { ...user, id: '7', name: 'MIT Sports Board', college: 'MIT', branch: 'Sports' },
      attendees: ['1', '2', '3', '4', '5'],
      maxAttendees: 16,
      tags: ['Sports', 'Cricket', 'T20'],
      isOnline: false,
      category: 'sports',
      subcategory: 'Cricket',
      difficulty: 'intermediate',
      status: 'published',
      coverImage: CATEGORY_COVER('sports'),
      eligibility: 'Players must be enrolled in a college and produce valid ID.',
      rules: 'Standard T20 rules. Squad of 15 per team.',
      prizes: '🏆 Winners — ₹30,000\n🥈 Runners-up — ₹15,000\n🏅 Man of the Series — ₹5,000',
      prizePool: 50000,
      fee: 1500,
      minTeamSize: 11,
      maxTeamSize: 15,
      isFeatured: false,
      trendingScore: 60,
      saveCount: 90,
      likeCount: 145,
      viewCount: 480,
      allowsTeams: true,
      createdAt: new Date(),
    },
    {
      id: 'evt_8',
      title: 'Past — AI Ethics Symposium 2025',
      description:
        'A recap of last year\'s sold-out symposium on AI Ethics. Photos, recordings, and award-winning project showcases.',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      location: 'Stanford Memorial Auditorium',
      organizer: { ...user, id: '8', name: 'Stanford AI Society', college: 'Stanford University', branch: 'Computer Science' },
      attendees: ['1', '2', '3', '4', '5', '6'],
      maxAttendees: 200,
      tags: ['AI', 'Ethics', 'Symposium'],
      isOnline: false,
      category: 'seminar',
      subcategory: 'AI Ethics',
      difficulty: 'intermediate',
      status: 'completed',
      coverImage: CATEGORY_COVER('seminar'),
      fee: 0,
      prizePool: 0,
      minTeamSize: 1,
      maxTeamSize: 1,
      trendingScore: 30,
      saveCount: 22,
      likeCount: 60,
      viewCount: 410,
      allowsTeams: false,
      gallery: [
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=600&h=400&fit=crop',
      ],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
  ];
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface EventFilterOptions {
  search?: string;
  category?: EventCategory | 'all';
  online?: 'online' | 'offline' | 'all';
  fee?: 'free' | 'paid' | 'all';
  when?: 'today' | 'week' | 'month' | 'all';
  college?: 'mine' | 'all';
}

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Keep a local copy of mocks so we can apply mutations without round-tripping
  // the DB. Keeps the offline/demo path interactive.
  const mockEvents = useMemo(() => buildMockEvents(), []);

  const applyClientState = useCallback(
    (list: Event[]): Event[] =>
      list.map((evt) => ({
        ...evt,
        isSaved: savedIds.has(evt.id),
        isLiked: likedIds.has(evt.id),
        isRegistered:
          user?.id !== undefined
            ? evt.attendees.includes(user.id)
            : evt.isRegistered ?? false,
      })),
    [savedIds, likedIds, user?.id]
  );

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('events')
        .select(
          `
          *,
          profiles!events_organizer_id_fkey (
            id,
            name,
            email,
            college,
            branch,
            year,
            is_verified,
            avatar_url
          ),
          event_attendees (
            user_id
          ),
          event_saves!event_saves_event_id_fkey ( user_id ),
          event_likes!event_likes_event_id_fkey ( user_id )
        `
        )
        .order('event_date', { ascending: true });

      if (error) {
        console.warn('Database not available, using mock data:', error.message);
        setEvents(applyClientState(mockEvents));
        return;
      }

      const formatted: Event[] =
        data?.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          date: new Date(row.event_date),
          endDate: row.end_date ? new Date(row.end_date) : undefined,
          location: row.location,
          organizer: {
            id: row.profiles?.id ?? row.organizer_id,
            name: row.profiles?.name ?? 'Organizer',
            email: row.profiles?.email ?? '',
            college: row.profiles?.college ?? '',
            branch: row.profiles?.branch ?? '',
            year: row.profiles?.year ?? 0,
            isVerified: row.profiles?.is_verified ?? false,
            isAnonymous: false,
            avatar: row.profiles?.avatar_url,
            joinedAt: new Date(),
            lastActive: new Date(),
          },
          attendees: row.event_attendees?.map((a: any) => a.user_id) ?? [],
          maxAttendees: row.max_attendees ?? undefined,
          tags: row.tags ?? [],
          isOnline: row.is_online ?? false,
          meetingLink: row.meeting_link ?? undefined,
          coverImage: row.cover_image ?? CATEGORY_COVER(row.category ?? 'workshop'),
          category: (row.category ?? 'workshop') as EventCategory,
          subcategory: row.subcategory ?? undefined,
          difficulty: row.difficulty ?? 'beginner',
          status: row.status ?? 'published',
          isMultiDay: row.is_multi_day ?? false,
          eligibility: row.eligibility ?? undefined,
          rules: row.rules ?? undefined,
          prizes: row.prizes ?? undefined,
          prizePool: row.prize_pool ? Number(row.prize_pool) : undefined,
          prizeCurrency: row.prize_currency ?? 'INR',
          fee: row.fee ? Number(row.fee) : 0,
          minTeamSize: row.min_team_size ?? 1,
          maxTeamSize: row.max_team_size ?? 1,
          registrationDeadline: row.registration_deadline
            ? new Date(row.registration_deadline)
            : undefined,
          isFeatured: row.is_featured ?? false,
          trendingScore: row.trending_score ? Number(row.trending_score) : 0,
          faqs: row.faqs ?? [],
          schedule: row.schedule ?? [],
          requirements: row.requirements ?? [],
          contactEmail: row.contact_email ?? undefined,
          websiteUrl: row.website_url ?? undefined,
          language: row.language ?? 'English',
          saveCount: row.save_count ?? 0,
          likeCount: row.like_count ?? 0,
          viewCount: row.view_count ?? 0,
          gallery: row.gallery ?? [],
          allowsTeams: row.allows_teams ?? false,
          isSaved: (row.event_saves ?? []).some(
            (s: any) => s.user_id === user.id
          ),
          isLiked: (row.event_likes ?? []).some(
            (l: any) => l.user_id === user.id
          ),
          isRegistered: (row.event_attendees ?? []).some(
            (a: any) => a.user_id === user.id
          ),
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        })) ?? [];

      setEvents(formatted);
    } catch (err) {
      console.warn('Error fetching events, using mock data:', err);
      setEvents(applyClientState(mockEvents));
    } finally {
      setLoading(false);
    }
  }, [user, applyClientState, mockEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ---------------------------------------------------------------------
  // Optimistic state updates for client-only operations
  // ---------------------------------------------------------------------

  const updateLocal = (id: string, patch: Partial<Event>) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  // ---------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------

  const createEvent = async (eventData: {
    title: string;
    description: string;
    date: Date;
    endDate?: Date;
    location: string;
    maxAttendees?: number;
    tags: string[];
    isOnline: boolean;
    meetingLink?: string;
    category?: EventCategory;
    subcategory?: string;
    difficulty?: Event['difficulty'];
    fee?: number;
    minTeamSize?: number;
    maxTeamSize?: number;
    registrationDeadline?: Date;
    eligibility?: string;
    rules?: string;
    prizes?: string;
    prizePool?: number;
    allowsTeams?: boolean;
    coverImage?: string;
    contactEmail?: string;
    websiteUrl?: string;
    isFeatured?: boolean;
  }): Promise<Event> => {
    if (!user) throw new Error('User not authenticated');

    const cat: EventCategory = eventData.category ?? 'workshop';
    const baseRow = {
      title: eventData.title,
      description: eventData.description,
      event_date: eventData.date.toISOString(),
      end_date: eventData.endDate?.toISOString() ?? null,
      location: eventData.location,
      max_attendees: eventData.maxAttendees ?? null,
      tags: eventData.tags,
      is_online: eventData.isOnline,
      meeting_link: eventData.meetingLink ?? null,
      category: cat,
      subcategory: eventData.subcategory ?? null,
      difficulty: eventData.difficulty ?? 'beginner',
      status: 'published',
      cover_image: eventData.coverImage ?? CATEGORY_COVER(cat),
      eligibility: eventData.eligibility ?? null,
      rules: eventData.rules ?? null,
      prizes: eventData.prizes ?? null,
      prize_pool: eventData.prizePool ?? 0,
      fee: eventData.fee ?? 0,
      min_team_size: eventData.minTeamSize ?? 1,
      max_team_size: eventData.maxTeamSize ?? 1,
      registration_deadline: eventData.registrationDeadline?.toISOString() ?? null,
      is_featured: eventData.isFeatured ?? false,
      allows_teams: eventData.allowsTeams ?? false,
      contact_email: eventData.contactEmail ?? null,
      website_url: eventData.websiteUrl ?? null,
      organizer_id: user.id,
    };

    try {
      const { data, error } = await supabase
        .from('events')
        .insert(baseRow)
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('event_attendees')
        .insert({ event_id: data.id, user_id: user.id });

      await fetchEvents();
      return data as unknown as Event;
    } catch (err) {
      console.warn('Database insert failed, using offline mock:', err);
      const newEvent: Event = {
        id: `evt_local_${Date.now()}`,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        endDate: eventData.endDate,
        location: eventData.location,
        maxAttendees: eventData.maxAttendees,
        tags: eventData.tags,
        isOnline: eventData.isOnline,
        meetingLink: eventData.meetingLink,
        attendees: [user.id],
        category: cat,
        subcategory: eventData.subcategory,
        difficulty: eventData.difficulty ?? 'beginner',
        status: 'published',
        coverImage: eventData.coverImage ?? CATEGORY_COVER(cat),
        eligibility: eventData.eligibility,
        rules: eventData.rules,
        prizes: eventData.prizes,
        prizePool: eventData.prizePool ?? 0,
        fee: eventData.fee ?? 0,
        minTeamSize: eventData.minTeamSize ?? 1,
        maxTeamSize: eventData.maxTeamSize ?? 1,
        registrationDeadline: eventData.registrationDeadline,
        allowsTeams: eventData.allowsTeams ?? false,
        isFeatured: eventData.isFeatured ?? false,
        trendingScore: Math.floor(Math.random() * 40) + 30,
        faqs: [],
        schedule: [],
        saveCount: 0,
        likeCount: 0,
        viewCount: 0,
        organizer: {
          id: user.id,
          name: user.name ?? 'You',
          email: user.email ?? '',
          college: user.college ?? '',
          branch: user.branch ?? '',
          year: user.year ?? 1,
          isVerified: user.isVerified ?? false,
          isAnonymous: false,
          joinedAt: new Date(),
          lastActive: new Date(),
        },
        createdAt: new Date(),
      };

      setEvents((prev) => applyClientState([newEvent, ...prev]));
      return newEvent;
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, user_id: user.id });

      if (error) throw error;
      await fetchEvents();
    } catch (err) {
      console.warn('DB join failed, applying locally:', err);
      updateLocal(eventId, {
        attendees: Array.from(
          new Set([
            ...(events.find((e) => e.id === eventId)?.attendees ?? []),
            user.id,
          ])
        ),
        isRegistered: true,
      });
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchEvents();
    } catch (err) {
      console.warn('DB leave failed, applying locally:', err);
      updateLocal(eventId, {
        attendees: (events.find((e) => e.id === eventId)?.attendees ?? []).filter(
          (id) => id !== user.id
        ),
        isRegistered: false,
      });
    }
  };

  const updateEvent = async (
    eventId: string,
    updates: Partial<{
      title: string;
      description: string;
      date: Date;
      endDate?: Date;
      location: string;
      maxAttendees: number;
      tags: string[];
      isOnline: boolean;
      meetingLink: string;
      category: EventCategory;
      subcategory: string;
      difficulty: Event['difficulty'];
      fee: number;
      minTeamSize: number;
      maxTeamSize: number;
      eligibility: string;
      rules: string;
      prizes: string;
      prizePool: number;
      allowsTeams: boolean;
      coverImage: string;
    }>
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: updates.title,
          description: updates.description,
          event_date: updates.date?.toISOString(),
          end_date: updates.endDate?.toISOString(),
          location: updates.location,
          max_attendees: updates.maxAttendees,
          tags: updates.tags,
          is_online: updates.isOnline,
          meeting_link: updates.meetingLink,
          category: updates.category,
          subcategory: updates.subcategory,
          difficulty: updates.difficulty,
          fee: updates.fee,
          min_team_size: updates.minTeamSize,
          max_team_size: updates.maxTeamSize,
          eligibility: updates.eligibility,
          rules: updates.rules,
          prizes: updates.prizes,
          prize_pool: updates.prizePool,
          allows_teams: updates.allowsTeams,
          cover_image: updates.coverImage,
        })
        .eq('id', eventId)
        .eq('organizer_id', user.id);

      if (error) throw error;
      await fetchEvents();
    } catch (err) {
      console.warn('DB update failed, applying locally:', err);
      updateLocal(eventId, updates);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await supabase.from('event_attendees').delete().eq('event_id', eventId);
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('organizer_id', user.id);

      if (error) throw error;
      await fetchEvents();
    } catch (err) {
      console.warn('DB delete failed, applying locally:', err);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  };

  // ---------------------------------------------------------------------
  // Engagement (save / like / view)
  // ---------------------------------------------------------------------

  const toggleSave = async (eventId: string) => {
    if (!user) return;

    const isSaved = savedIds.has(eventId);

    // Optimistic update
    const next = new Set(savedIds);
    if (isSaved) next.delete(eventId);
    else next.add(eventId);
    setSavedIds(next);

    const target = events.find((e) => e.id === eventId);
    updateLocal(eventId, {
      isSaved: !isSaved,
      saveCount: Math.max(0, (target?.saveCount ?? 0) + (isSaved ? -1 : 1)),
    });

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('event_saves')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('event_saves')
          .insert({ event_id: eventId, user_id: user.id });
        if (error) throw error;
      }
    } catch (err) {
      console.warn('Save toggle DB failed (kept local change):', err);
    }
  };

  const toggleLike = async (eventId: string) => {
    if (!user) return;

    const isLiked = likedIds.has(eventId);
    const next = new Set(likedIds);
    if (isLiked) next.delete(eventId);
    else next.add(eventId);
    setLikedIds(next);

    const target = events.find((e) => e.id === eventId);
    updateLocal(eventId, {
      isLiked: !isLiked,
      likeCount: Math.max(0, (target?.likeCount ?? 0) + (isLiked ? -1 : 1)),
    });

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('event_likes')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('event_likes')
          .insert({ event_id: eventId, user_id: user.id });
        if (error) throw error;
      }
    } catch (err) {
      console.warn('Like toggle DB failed (kept local change):', err);
    }
  };

  const recordView = async (eventId: string) => {
    if (!user) return;
    updateLocal(eventId, {
      viewCount: (events.find((e) => e.id === eventId)?.viewCount ?? 0) + 1,
    });
    try {
      await supabase
        .from('event_views')
        .upsert({ event_id: eventId, user_id: user.id });
    } catch {
      /* ignore — non-critical analytics */
    }
  };

  // ---------------------------------------------------------------------
  // Bulk helpers
  // ---------------------------------------------------------------------

  const isUserAttending = useCallback(
    (eventId: string) => !!events.find((e) => e.id === eventId)?.isRegistered,
    [events]
  );

  const isUserOrganizer = useCallback(
    (eventId: string) =>
      !!user && events.find((e) => e.id === eventId)?.organizer.id === user.id,
    [events, user]
  );

  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter((event) => event.date > now);
  };

  const getPastEvents = () => {
    const now = new Date();
    return events.filter((event) => event.date <= now);
  };

  const getSavedEvents = () => events.filter((e) => e.isSaved);

  return {
    events,
    loading,
    error,
    createEvent,
    joinEvent,
    leaveEvent,
    updateEvent,
    deleteEvent,
    toggleSave,
    toggleLike,
    recordView,
    isUserAttending,
    isUserOrganizer,
    isSaved: (id: string) => savedIds.has(id),
    isLiked: (id: string) => likedIds.has(id),
    getUpcomingEvents,
    getPastEvents,
    getSavedEvents,
    refetch: fetchEvents,
  };
};
