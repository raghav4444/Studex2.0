import React, { useState } from 'react';
import {
  Search, Users, Star, Shield, Clock, Award, Calendar,
  MessageCircle, ChevronRight, Heart, Share2, Bookmark,
  Check, X, Send, DollarSign, TrendingUp, Sparkles, Zap,
  BookOpen, GraduationCap, Code, Briefcase
} from 'lucide-react';
import { useMentorship } from '../../hooks/useMentorship';
import { useAuth } from '../AuthProvider';
import { Mentor } from '../../types';

const categoryConfig: Record<string, { icon: React.ReactNode; gradient: string; label: string }> = {
  'Computer Science': { icon: <Code className="w-4 h-4" />, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'CS & Tech' },
  'Physics': { icon: <Sparkles className="w-4 h-4" />, gradient: 'from-purple-500/20 to-pink-500/20', label: 'Physics' },
  'Mechanical Engineering': { icon: <BookOpen className="w-4 h-4" />, gradient: 'from-amber-500/20 to-orange-500/20', label: 'Mech Eng' },
  'Electrical Engineering': { icon: <Zap className="w-4 h-4" />, gradient: 'from-yellow-500/20 to-green-500/20', label: 'Electrical' },
  'Business Administration': { icon: <Briefcase className="w-4 h-4" />, gradient: 'from-emerald-500/20 to-teal-500/20', label: 'Business' },
  'other': { icon: <GraduationCap className="w-4 h-4" />, gradient: 'from-gray-500/20 to-slate-500/20', label: 'Other' },
};

interface MentorDetailModalProps {
  mentor: Mentor;
  isOpen: boolean;
  onClose: () => void;
}

const MentorDetailModal: React.FC<MentorDetailModalProps> = ({ mentor, isOpen, onClose }) => {
  const { getMentorReviews, addReview } = useMentorship();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'sessions'>('overview');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const reviews = getMentorReviews(mentor.id);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!isOpen) return null;

  const handleSubmitReview = () => {
    if (reviewComment.trim() && user) {
      addReview(mentor.id, reviewRating, reviewComment);
      setReviewComment('');
      setReviewRating(5);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d1117] border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="relative p-6 bg-gradient-to-br from-[#161b22] to-[#0d1117] border-b border-white/10">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {(mentor.name || 'M').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{mentor.name || 'Mentor'}</h2>
                {mentor.isVerified && <Shield className="w-5 h-5 text-blue-400" />}
              </div>
              <p className="text-gray-400 mt-1">{(mentor.college || 'College')} • {(mentor.branch || 'Branch')}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">{mentor.rating?.toFixed(1) || '4.5'}</span>
                  <span className="text-gray-500 text-sm">({reviews?.length || 0} reviews)</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${mentor.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {mentor.isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-2xl font-bold text-white">{mentor.responseTime?.split(' ')[2] || '2'}</p>
              <p className="text-xs text-gray-500">Hours Response</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-2xl font-bold text-white">{reviews?.length || 0}</p>
              <p className="text-xs text-gray-500">Mentees Helped</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-2xl font-bold text-white">₹{mentor.hourlyRate || 500}</p>
              <p className="text-xs text-gray-500">Per Session</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'reviews', label: `Reviews (${reviews?.length || 0})` },
            { id: 'sessions', label: 'Sessions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">About</h3>
                <p className="text-gray-300 leading-relaxed">{mentor.bio || 'No bio available'}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {(mentor.skills || []).map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {(mentor.experience || []).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Experience</h3>
                  <div className="space-y-2">
                    {mentor.experience.map((exp, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-gray-300">{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(mentor.achievements || []).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.achievements.map((achievement, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 text-xs border border-amber-500/20">
                        <Award className="w-3 h-3" />
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {user && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="text-sm font-medium text-white mb-3">Leave a Review</h4>
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button key={rating} onClick={() => setReviewRating(rating)} className="p-1 hover:scale-110 transition-transform">
                        <Star className={`w-5 h-5 ${rating <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="flex-1 px-4 py-2 rounded-xl bg-[#161b22] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                    />
                    <button onClick={handleSubmitReview} disabled={!reviewComment.trim()} className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {(reviews || []).length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-xl bg-[#161b22]/50 border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {(review.reviewerName || 'A').charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{review.reviewerName || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">{review.reviewerCollege || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(review.date)}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">Session History</p>
              <p className="text-sm text-gray-500">Your sessions will appear here</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex gap-3">
          <button
            onClick={() => setShowRequestModal(true)}
            disabled={!mentor.isAvailable}
            className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Request Mentorship
          </button>
          <button className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {showRequestModal && (
          <RequestMentorshipModal mentor={mentor} onClose={() => setShowRequestModal(false)} />
        )}
      </div>
    </div>
  );
};

const RequestMentorshipModal: React.FC<{ mentor: Mentor; onClose: () => void }> = ({ mentor, onClose }) => {
  const { requestMentorship } = useMentorship();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      await requestMentorship(mentor.id, `Topic: ${topic}\n\n${message}`);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-[#0d1117] border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Request Mentorship</h2>
          <p className="text-sm text-gray-400 mt-1">Send a request to {mentor.name}</p>
        </div>

        {submitted ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Request Sent!</h3>
            <p className="text-sm text-gray-400 mb-4">You'll be notified when they respond.</p>
            <button onClick={onClose} className="px-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium">Done</button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Topic *</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., React Interview Prep"
                className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Tell about your goals..."
                className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium">Cancel</button>
              <button onClick={handleSubmit} disabled={loading || !topic.trim()} className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MentorCard: React.FC<{ mentor: Mentor; onViewProfile: (mentor: Mentor) => void }> = ({ mentor, onViewProfile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const categoryInfo = categoryConfig[mentor.branch] || categoryConfig['other'];

  return (
    <div onClick={() => onViewProfile(mentor)} className="group relative rounded-2xl bg-[#161b22]/80 border border-white/10 overflow-hidden hover:border-white/20 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryInfo.gradient}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {(mentor.name || 'M').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{mentor.name || 'Mentor'}</h3>
              <p className="text-xs text-gray-500">{mentor.college || 'College'}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${mentor.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
            {mentor.isAvailable ? 'Available' : 'Busy'}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(mentor.skills || []).slice(0, 3).map((skill, i) => (
            <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-xs">{skill}</span>
          ))}
          {(mentor.skills || []).length > 3 && (
            <span className="px-2 py-1 rounded-lg text-xs text-gray-500">+{(mentor.skills || []).length - 3}</span>
          )}
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{mentor.bio || 'No description available'}</p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-white">{mentor.rating?.toFixed(1) || '4.5'}</span>
            </div>
            <span className="text-xs text-gray-500">•</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{mentor.responseTime?.split('Within ')[1] || '2h'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span>₹{mentor.hourlyRate || 500}</span>
            <span className="text-xs text-gray-500">/hr</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MentorshipPage: React.FC = () => {
  const { mentors, loading, searchMentors, topMentors, availableMentors, specializations, fetchMentors } = useMentorship();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showTopMentors, setShowTopMentors] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [ratingFilter, setRatingFilter] = useState(0);

  React.useEffect(() => {
    fetchMentors();
  }, []);

  const filteredMentors = React.useMemo(() => {
    let result = searchQuery ? searchMentors(searchQuery) : (mentors || []);

    if (selectedCategory !== 'all') {
      result = result.filter(m => m.branch === selectedCategory);
    }

    result = result.filter(m =>
      (m.hourlyRate || 500) >= priceRange[0] &&
      (m.hourlyRate || 500) <= priceRange[1] &&
      (m.rating || 0) >= ratingFilter
    );

    return result;
  }, [mentors, searchQuery, searchMentors, selectedCategory, priceRange, ratingFilter]);

  const categories = ['all', ...(specializations || [])];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1016] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Finding the best mentors for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1016]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1020] via-[#0d1117] to-[#161b22] border border-white/10 mb-8 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_40%)]" />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Perfect Mentor</span>
            </h1>
            <p className="text-gray-400 mb-6 max-w-xl">
              Connect with experienced students who can guide you through academics, career, and personal growth.
            </p>

            <div className="relative max-w-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skill, or college..."
                className="w-full pl-14 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-all text-lg"
              />
            </div>

            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{(availableMentors || []).length}</p>
                  <p className="text-xs text-gray-500">Available Mentors</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{(mentors || []).length}</p>
                  <p className="text-xs text-gray-500">Total Mentors</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{(specializations || []).length}</p>
                  <p className="text-xs text-gray-500">Specializations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.slice(0, 8).map((cat) => {
            const info = categoryConfig[cat] || categoryConfig['other'];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-[#161b22]/80 text-gray-400 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {cat === 'all' ? <Sparkles className="w-4 h-4" /> : info.icon}
                {cat === 'all' ? 'All' : info.label}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#161b22]/80 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3">Price Range</h3>
              <input type="range" min={0} max={1500} value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full accent-blue-500" />
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">₹0</span>
                <span className="text-white font-medium">Up to ₹{priceRange[1]}/hr</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#161b22]/80 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3">Minimum Rating</h3>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map((r) => (
                  <button key={r} onClick={() => setRatingFilter(r)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      ratingFilter === r ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}>
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {showTopMentors && searchQuery === '' && selectedCategory === 'all' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    Top Mentors
                  </h2>
                  <button onClick={() => setShowTopMentors(false)} className="text-sm text-gray-500 hover:text-gray-300">Hide</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(topMentors || []).slice(0, 4).map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} onViewProfile={setSelectedMentor} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {searchQuery ? `Search Results (${filteredMentors.length})` : 'All Mentors'}
                </h2>
                {!showTopMentors && (
                  <button onClick={() => setShowTopMentors(true)} className="text-sm text-blue-400 hover:text-blue-300">
                    Show Top Mentors
                  </button>
                )}
              </div>

              {filteredMentors.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMentors.map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} onViewProfile={setSelectedMentor} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 rounded-2xl bg-[#161b22]/80 border border-white/10">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No mentors found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                  <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setPriceRange([0, 1500]); setRatingFilter(0); }}
                    className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 font-medium">
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedMentor && (
        <MentorDetailModal mentor={selectedMentor} isOpen={!!selectedMentor} onClose={() => setSelectedMentor(null)} />
      )}
    </div>
  );
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffDays > 7) return date.toLocaleDateString();
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
}

export default MentorshipPage;