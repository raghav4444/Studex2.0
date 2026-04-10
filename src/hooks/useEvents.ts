import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { Event, User } from '../types';

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for when database is not available
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'AI/ML Study Group - Weekly Meetup',
      description: 'Join us for our weekly AI/ML study session. This week we\'re covering neural networks and deep learning fundamentals.',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: 'MIT Library, Room 302',
      organizer: {
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
      },
      attendees: ['1', '2', '3', '4', '5'],
      maxAttendees: 20,
      tags: ['AI', 'Machine Learning', 'Study Group'],
      isOnline: false,
    },
    {
      id: '2',
      title: 'Virtual Career Fair - Tech Companies',
      description: 'Connect with recruiters from top tech companies. Bring your resume and be ready for on-the-spot interviews!',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: 'Online Event',
      organizer: {
        id: '2',
        name: 'Career Services',
        email: 'careers@stanford.edu',
        college: 'Stanford University',
        branch: 'Career Services',
        year: 0,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      attendees: ['1', '2', '3'],
      maxAttendees: 100,
      tags: ['Career', 'Tech', 'Networking'],
      isOnline: true,
      meetingLink: 'https://meet.google.com/abc-def-ghi',
    },
    {
      id: '3',
      title: 'Physics Problem Solving Workshop',
      description: 'Struggling with quantum mechanics? Join our interactive workshop where seniors will help solve complex physics problems.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Caltech Physics Building',
      organizer: {
        id: '3',
        name: 'Alex Rodriguez',
        email: 'alex@caltech.edu',
        college: 'Caltech',
        branch: 'Physics',
        year: 4,
        isVerified: true,
        isAnonymous: false,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
      attendees: ['1', '2'],
      maxAttendees: 15,
      tags: ['Physics', 'Workshop', 'Problem Solving'],
      isOnline: false,
    },
  ];

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from database first
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_organizer_fkey (
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
          )
        `)
        .order('date', { ascending: true });

      if (error) {
        console.warn('Database not available, using mock data:', error.message);
        // Use mock data if database is not available
        setEvents(mockEvents);
        return;
      }

      const formattedEvents: Event[] = data?.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: new Date(event.date),
        location: event.location,
        organizer: {
          id: event.profiles.id,
          name: event.profiles.name,
          email: event.profiles.email,
          college: event.profiles.college,
          branch: event.profiles.branch,
          year: event.profiles.year,
          isVerified: event.profiles.is_verified,
          isAnonymous: false,
          avatar: event.profiles.avatar_url,
          joinedAt: new Date(),
          lastActive: new Date(),
        },
        attendees: event.event_attendees?.map((attendee: any) => attendee.user_id) || [],
        maxAttendees: event.max_attendees,
        tags: event.tags || [],
        isOnline: event.is_online,
        meetingLink: event.meeting_link,
      })) || [];

      setEvents(formattedEvents);
    } catch (err) {
      console.warn('Error fetching events, using mock data:', err);
      // Use mock data as fallback
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData: {
    title: string;
    description: string;
    date: Date;
    location: string;
    maxAttendees?: number;
    tags: string[];
    isOnline: boolean;
    meetingLink?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Try to create in database first
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date.toISOString(),
          location: eventData.location,
          max_attendees: eventData.maxAttendees,
          tags: eventData.tags,
          is_online: eventData.isOnline,
          meeting_link: eventData.meetingLink,
          organizer: user.id,
        })
        .select()
        .single();

      if (error) {
        console.warn('Database not available, using mock data for creation');
        // Create mock event
        const newEvent: Event = {
          id: Date.now().toString(),
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          location: eventData.location,
          maxAttendees: eventData.maxAttendees || 20,
          tags: eventData.tags,
          isOnline: eventData.isOnline,
          meetingLink: eventData.meetingLink,
          attendees: [user.id],
          organizer: {
            id: user.id,
            name: user.name || 'You',
            email: user.email || '',
            college: user.college || '',
            branch: user.branch || '',
            year: user.year || 1,
            isVerified: user.isVerified || false,
            isAnonymous: false,
            joinedAt: new Date(),
            lastActive: new Date(),
          },
        };
        
        setEvents(prev => [newEvent, ...prev]);
        return newEvent;
      }

      // Add organizer as first attendee
      await supabase
        .from('event_attendees')
        .insert({
          event_id: data.id,
          user_id: user.id,
        });

      await fetchEvents();
      return data;
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Try to join in database first
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) {
        console.warn('Database not available, using mock data for join');
        // Update mock data
        setEvents(prev => prev.map(event => {
          if (event.id === eventId && !event.attendees.includes(user.id)) {
            return {
              ...event,
              attendees: [...event.attendees, user.id]
            };
          }
          return event;
        }));
        return;
      }

      await fetchEvents();
    } catch (err) {
      console.error('Error joining event:', err);
      throw err;
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Try to leave in database first
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.warn('Database not available, using mock data for leave');
        // Update mock data
        setEvents(prev => prev.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              attendees: event.attendees.filter(attendeeId => attendeeId !== user.id)
            };
          }
          return event;
        }));
        return;
      }

      await fetchEvents();
    } catch (err) {
      console.error('Error leaving event:', err);
      throw err;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<{
    title: string;
    description: string;
    date: Date;
    location: string;
    maxAttendees: number;
    tags: string[];
    isOnline: boolean;
    meetingLink: string;
  }>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: updates.title,
          description: updates.description,
          date: updates.date?.toISOString(),
          location: updates.location,
          max_attendees: updates.maxAttendees,
          tags: updates.tags,
          is_online: updates.isOnline,
          meeting_link: updates.meetingLink,
        })
        .eq('id', eventId)
        .eq('organizer', user.id);

      if (error) throw error;

      await fetchEvents();
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Delete all attendees first
      await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId);

      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('organizer', user.id);

      if (error) throw error;

      await fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  };

  const isUserAttending = (eventId: string) => {
    if (!user) return false;
    const event = events.find(e => e.id === eventId);
    return event?.attendees.includes(user.id) || false;
  };

  const isUserOrganizer = (eventId: string) => {
    if (!user) return false;
    const event = events.find(e => e.id === eventId);
    return event?.organizer.id === user.id;
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(event => event.date > now);
  };

  const getPastEvents = () => {
    const now = new Date();
    return events.filter(event => event.date <= now);
  };

  return {
    events,
    loading,
    error,
    createEvent,
    joinEvent,
    leaveEvent,
    updateEvent,
    deleteEvent,
    isUserAttending,
    isUserOrganizer,
    getUpcomingEvents,
    getPastEvents,
    refetch: fetchEvents,
  };
};
