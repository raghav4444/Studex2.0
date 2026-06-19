import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { Mentor, MentorshipRequest } from '../types';

interface Review {
  id: string;
  reviewerName: string;
  reviewerCollege: string;
  reviewerAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
}

interface Session {
  id: string;
  mentorId: string;
  date: Date;
  duration: number; // in minutes
  topic: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const useMentorship = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});

  // Mock mentors data
  const mockMentors: Mentor[] = [
    {
      id: '1',
      userId: '1',
      name: 'Sarah Chen',
      college: 'MIT',
      branch: 'Computer Science',
      year: 4,
      skills: ['React', 'Node.js', 'Machine Learning', 'Data Structures', 'System Design'],
      bio: 'Senior CS student with internship experience at Google. Love helping juniors with coding and career guidance.',
      isAvailable: true,
      rating: 4.9,
      isVerified: true,
      experience: ['Software Engineer Intern at Google', 'ML Research Assistant', '3+ years teaching coding'],
      achievements: ['ACM ICPC Regionalist', 'Google Code Jam Qualified', 'Published ML Paper'],
      hourlyRate: 500,
      responseTime: 'Within 2 hours',
    },
    {
      id: '2',
      userId: '2',
      name: 'Alex Rodriguez',
      college: 'Caltech',
      branch: 'Physics',
      year: 4,
      skills: ['Quantum Mechanics', 'Research', 'LaTeX', 'MATLAB', 'Python'],
      bio: 'Physics PhD candidate specializing in quantum computing. Happy to help with physics concepts and research methodology.',
      isAvailable: true,
      rating: 4.7,
      isVerified: true,
      experience: ['PhD Researcher at Caltech', 'NASA Summer Research Fellow', 'Published 5 papers'],
      achievements: ['APS Outstanding Student Award', 'Quantum Computing Research Grant'],
      hourlyRate: 750,
      responseTime: 'Within 4 hours',
    },
    {
      id: '3',
      userId: '3',
      name: 'Emily Wang',
      college: 'Stanford',
      branch: 'Mechanical Engineering',
      year: 3,
      skills: ['CAD Design', 'Thermodynamics', 'Project Management', 'Internships'],
      bio: 'Mechanical engineering student with hands-on project experience. Can help with design thinking and industry preparation.',
      isAvailable: false,
      rating: 4.8,
      isVerified: true,
      experience: ['Product Design Intern at Apple', 'Formula Student Team Lead'],
      achievements: ['iDA Design Award Winner', 'Published Design Patent'],
      hourlyRate: 400,
      responseTime: 'Within 1 day',
    },
    {
      id: '4',
      userId: '4',
      name: 'Raj Patel',
      college: 'IIT Bombay',
      branch: 'Electrical Engineering',
      year: 4,
      skills: ['Embedded Systems', 'VLSI', 'PCB Design', 'C/C++', 'FPGA'],
      bio: 'Passionate about hardware and embedded systems. Crack interviews at top semiconductor companies with my guidance.',
      isAvailable: true,
      rating: 4.9,
      isVerified: true,
      experience: ['Hardware Engineer at Intel', 'Research Intern at IISc'],
      achievements: ['VLSI Design Competition Winner', 'IEEE Student Award'],
      hourlyRate: 600,
      responseTime: 'Within 3 hours',
    },
    {
      id: '5',
      userId: '5',
      name: 'Priya Sharma',
      college: 'Delhi University',
      branch: 'Business Administration',
      year: 4,
      skills: ['Marketing', 'Finance', 'Startup', 'Case Studies', ' Excel'],
      bio: 'MBA aspirant with 99+ percentile in CAT. Let me help you crack top B-schools and build your startup.',
      isAvailable: true,
      rating: 4.6,
      isVerified: true,
      experience: ['Marketing Lead at Startup', 'Consulting Intern at McKinsey'],
      achievements: ['CAT 99.5 percentile', 'National Level Case Competition Winner'],
      hourlyRate: 350,
      responseTime: 'Within 5 hours',
    },
    {
      id: '6',
      userId: '6',
      name: 'James Wilson',
      college: 'UC Berkeley',
      branch: 'Data Science',
      year: 3,
      skills: ['Python', 'TensorFlow', 'Statistics', 'SQL', 'Tableau'],
      bio: 'Data Science enthusiast who has worked on real ML projects. Happy to guide you into the world of data.',
      isAvailable: true,
      rating: 4.8,
      isVerified: true,
      experience: ['Data Scientist at Netflix', 'Research Assistant in AI Lab'],
      achievements: ['Kaggle Competition Master', 'Published ML Models on GitHub'],
      hourlyRate: 550,
      responseTime: 'Within 2 hours',
    },
    {
      id: '7',
      userId: '7',
      name: 'Aisha Khan',
      college: 'NUS',
      branch: 'Biotechnology',
      year: 4,
      skills: ['Molecular Biology', 'PCR', 'Research Methods', 'Paper Writing'],
      bio: 'Passionate researcher helping students navigate through biotech research and career paths abroad.',
      isAvailable: true,
      rating: 4.7,
      isVerified: true,
      experience: ['Research Intern at Max Planck Institute', ' Published 3 papers'],
      achievements: ['Gold Medal in Biotechnology', 'Fully Funded PhD Offer from MIT'],
      hourlyRate: 450,
      responseTime: 'Within 6 hours',
    },
    {
      id: '8',
      userId: '8',
      name: 'Michael Brown',
      college: 'CMU',
      branch: 'Computer Science',
      year: 5,
      skills: ['C++', 'Algorithms', 'Game Development', 'Unity', 'Graphics'],
      bio: 'Game developer and CS PhD student. Help students prepare for FAANG interviews and game industry.',
      isAvailable: false,
      rating: 4.9,
      isVerified: true,
      experience: ['Game Developer at EA Sports', 'Teaching Assistant for 3 years'],
      achievements: ['Published indie game with 100k+ downloads', 'ACM ICPC World Finalist'],
      hourlyRate: 800,
      responseTime: 'Within 1 day',
    },
  ];

  // Mock reviews
  const mockReviews: Record<string, Review[]> = {
    '1': [
      { id: 'r1', reviewerName: 'Tech Student', reviewerCollege: 'Stanford', rating: 5, comment: 'Sarah helped me crack my Google interview! Her system design insights are incredible.', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { id: 'r2', reviewerName: 'CS Junior', reviewerCollege: 'MIT', rating: 5, comment: 'Amazing mentor! Very patient and explains complex concepts clearly.', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    ],
    '2': [
      { id: 'r3', reviewerName: 'Physics Enthusiast', reviewerCollege: 'Caltech', rating: 4, comment: 'Great insights on quantum computing. Would recommend!', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    ],
    '4': [
      { id: 'r4', reviewerName: 'EE Student', reviewerCollege: 'IIT Delhi', rating: 5, comment: 'Raj\'s guidance helped me land an intern at Intel. He\'s extremely knowledgeable about VLSI!', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ],
  };

  // Fetch mentors
  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from database
      const { data, error: dbError } = await supabase
        .from('mentors')
        .select('*')
        .eq('is_available', true);

      if (dbError) {
        // Fall back to mock data
        setMentors(mockMentors);
      } else if (data && data.length > 0) {
        setMentors(data as Mentor[]);
      } else {
        setMentors(mockMentors);
      }

      // Load reviews for all available mentors
      setReviews(mockReviews);
    } catch (err) {
      // Use mock data on error
      setMentors(mockMentors);
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search and filter mentors
  const searchMentors = useCallback((query: string) => {
    const lowered = query.toLowerCase();
    return mentors.filter(mentor =>
      mentor.name.toLowerCase().includes(lowered) ||
      mentor.skills.some(s => s.toLowerCase().includes(lowered)) ||
      mentor.college.toLowerCase().includes(lowered) ||
      mentor.branch.toLowerCase().includes(lowered)
    );
  }, [mentors]);

  // Filter by specialization
  const filterBySpecialization = useCallback((specialization: string) => {
    if (specialization === 'all') return mentors;
    return mentors.filter(mentor => mentor.specialization === specialization || mentor.branch === specialization);
  }, [mentors]);

  // Get mentors by category
  const getMentorsByCategory = useCallback((category: string) => {
    return mentors.filter(mentor =>
      mentor.specialization === category ||
      mentor.skills.some(s => s.toLowerCase().includes(category.toLowerCase()))
    );
  }, [mentors]);

  // Request mentorship
  const requestMentorship = useCallback(async (mentorId: string, message: string) => {
    if (!user) throw new Error('User must be logged in');

    const request: MentorshipRequest = {
      id: `req_${Date.now()}`,
      requesterId: user.id,
      mentorId,
      message,
      status: 'pending',
      createdAt: new Date(),
    };

    // In a real app, save to database
    // For now, just add to local state
    setRequests(prev => [...prev, request]);

    return request;
  }, [user]);

  // Accept mentorship request (for mentors)
  const acceptRequest = useCallback(async (requestId: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: 'accepted' } : req
      )
    );
  }, []);

  // Decline mentorship request
  const declineRequest = useCallback(async (requestId: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: 'declined' } : req
      )
    );
  }, []);

  // Add review
  const addReview = useCallback(async (mentorId: string, rating: number, comment: string) => {
    if (!user) throw new Error('User must be logged in');

    const review: Review = {
      id: `rev_${Date.now()}`,
      reviewerName: user.name || 'Anonymous',
      reviewerCollege: user.college || '',
      reviewerAvatar: user.avatar,
      rating,
      comment,
      date: new Date(),
    };

    setReviews(prev => ({
      ...prev,
      [mentorId]: [...(prev[mentorId] || []), review],
    }));

    // Update mentor rating
    setMentors(prev =>
      prev.map(mentor => {
        if (mentor.id === mentorId) {
          const allReviews = [...(reviews[mentorId] || []), review];
          const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
          return { ...mentor, rating: Math.round(avgRating * 10) / 10 };
        }
        return mentor;
      })
    );
  }, [user, reviews]);

  // Get user's requests
  const getMyRequests = useCallback(() => {
    if (!user) return [];
    return requests.filter(req => req.requesterId === user.id);
  }, [requests, user]);

  // Get requests for a specific mentor (to manage as a mentor)
  const getMentorRequests = useCallback((mentorId: string) => {
    return requests.filter(req => req.mentorId === mentorId);
  }, [requests]);

  // Get reviews for a mentor
  const getMentorReviews = useCallback((mentorId: string) => {
    return reviews[mentorId] || [];
  }, [reviews]);

  // Update mentor availability
  const updateAvailability = useCallback(async (mentorId: string, isAvailable: boolean) => {
    setMentors(prev =>
      prev.map(mentor =>
        mentor.id === mentorId ? { ...mentor, isAvailable } : mentor
      )
    );
  }, []);

  // Get top mentors
  const topMentors = useMemo(() => {
    return [...mentors].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  }, [mentors]);

  // Get available mentors
  const availableMentors = useMemo(() => {
    return mentors.filter(m => m.isAvailable);
  }, [mentors]);

  // Get all unique specializations
  const specializations = useMemo(() => {
    const specs = new Set(mentors.map(m => m.branch));
    return Array.from(specs);
  }, [mentors]);

  // Initialize - fetch mentors on mount
  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  return {
    mentors,
    loading,
    error,
    requests,
    fetchMentors,
    searchMentors,
    filterBySpecialization,
    getMentorsByCategory,
    requestMentorship,
    acceptRequest,
    declineRequest,
    addReview,
    getMyRequests,
    getMentorRequests,
    getMentorReviews,
    updateAvailability,
    topMentors,
    availableMentors,
    specializations,
    reviews,
  };
};