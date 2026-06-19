import React from 'react';
import {
  X, Calendar, MapPin, Users, Clock, Globe, Link as LinkIcon,
  Star, Heart, Bookmark, Share2, Trophy, DollarSign, Tag,
  User, ExternalLink, ChevronDown, ChevronUp, CheckCircle2,
  MessageCircle, AlertCircle, Wifi, UsersRound
} from 'lucide-react';
import { Event, EventCategory } from '../../types';
import { useAuth } from '../AuthProvider';

interface EventDetailModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (eventId: string) => void;
  onLeave: (eventId: string) => void;
  onToggleSave: (eventId: string) => void;
  onToggleLike: (eventId: string) => void;
  onShare: (event: Event) => void;
  isUserAttending: boolean;
  isUserOrganizer: boolean;
}

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

const difficultyColors: Record<string, string> = {
  beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onJoin,
  onLeave,
  onToggleSave,
  onToggleLike,
  onShare,
  isUserAttending,
  isUserOrganizer,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'schedule' | 'faqs'>('overview');
  const [showAllRequirements, setShowAllRequirements] = React.useState(false);

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.attendees?.length : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        className="bg-[#0d1117] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={event.coverImage || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${categoryColors[event.category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
              {categoryLabels[event.category] || event.category}
            </span>
          </div>

          {/* Featured Badge */}
          {event.isFeatured && (
            <div className="absolute top-4 left-24">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium">
                <Star className="w-3 h-3" /> Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* Title & Meta */}
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{event.title}</h2>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{formatTime(event.date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {event.isOnline ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <MapPin className="w-4 h-4 text-orange-400" />
                )}
                <span>{event.isOnline ? 'Online Event' : event.location}</span>
              </div>
              {event.maxAttendees && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-pink-400" />
                  <span>{event.attendees?.length || 0}/{event.maxAttendees} attending</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-4 p-1 bg-[#161b22] rounded-xl">
            {(['overview', 'schedule', 'faqs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">About</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
                </div>

                {/* Tags */}
                {event.tags?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prize Pool */}
                {event.prizes && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-semibold text-amber-300">Prizes</h3>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-line">{event.prizes}</p>
                  </div>
                )}

                {/* Event Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {event.fee !== undefined && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-gray-500">Fee</span>
                      </div>
                      <span className="text-white font-medium">{event.fee === 0 ? 'Free' : `₹${event.fee}`}</span>
                    </div>
                  )}

                  {event.difficulty && (
                    <div className={`p-3 rounded-xl border ${difficultyColors[event.difficulty]}`}>
                      <span className="text-xs text-gray-400">Difficulty</span>
                      <p className="font-medium capitalize mt-0.5">{event.difficulty}</p>
                    </div>
                  )}

                  {event.minTeamSize && event.maxTeamSize && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <UsersRound className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-500">Team Size</span>
                      </div>
                      <span className="text-white font-medium">
                        {event.minTeamSize === event.maxTeamSize
                          ? `${event.minTeamSize} members`
                          : `${event.minTeamSize}-${event.maxTeamSize} members`}
                      </span>
                    </div>
                  )}

                  {event.eligibility && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-gray-500">Eligibility</span>
                      </div>
                      <span className="text-white font-medium text-sm truncate block">{event.eligibility}</span>
                    </div>
                  )}
                </div>

                {/* Requirements */}
                {event.requirements && event.requirements.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Requirements</h3>
                    <ul className="space-y-1.5">
                      {(showAllRequirements ? event.requirements : event.requirements.slice(0, 3)).map((req, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          {req}
                        </li>
                      ))}
                      {event.requirements.length > 3 && (
                        <li>
                          <button
                            onClick={() => setShowAllRequirements(!showAllRequirements)}
                            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                          >
                            {showAllRequirements ? (
                              <><ChevronUp className="w-4 h-4" /> Show less</>
                            ) : (
                              <><ChevronDown className="w-4 h-4" /> +{event.requirements.length - 3} more</>
                            )}
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Organizer */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Organizer</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{event.organizer.name || 'Anonymous Organizer'}</p>
                      <p className="text-xs text-gray-500">{event.organizer.college}</p>
                    </div>
                    {event.organizer.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 ml-auto" />
                    )}
                  </div>
                  {event.contactEmail && (
                    <p className="text-xs text-gray-500 mt-2">Contact: {event.contactEmail}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-3">
                {event.schedule && event.schedule.length > 0 ? (
                  event.schedule.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="shrink-0 text-center">
                        <span className="text-xs font-medium text-blue-400">{item.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium mb-0.5">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">Schedule will be announced soon</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'faqs' && (
              <div className="space-y-3">
                {event.faqs && event.faqs.length > 0 ? (
                  event.faqs.map((faq, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <h4 className="text-white font-medium mb-2">{faq.question}</h4>
                      <p className="text-sm text-gray-400">{faq.answer}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No FAQs yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-3">
            {isPast ? (
              <div className="w-full text-center py-3 text-gray-500 text-sm">
                This event has ended
              </div>
            ) : isFull ? (
              <div className="w-full text-center py-3 text-red-400 text-sm">
                Event is full
              </div>
            ) : isUserOrganizer ? (
              <button
                onClick={() => {}}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium text-sm"
              >
                You're the organizer
              </button>
            ) : isUserAttending ? (
              <button
                onClick={() => onLeave(event.id)}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 font-medium text-sm hover:bg-red-500/30 transition-colors"
              >
                Leave Event
              </button>
            ) : (
              <button
                onClick={() => onJoin(event.id)}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-colors"
              >
                Join Event
              </button>
            )}

            {/* Engagement Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onToggleSave(event.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  event.isSaved
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                    : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
                title={event.isSaved ? 'Unsave' : 'Save'}
              >
                <Bookmark className={`w-5 h-5 ${event.isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => onToggleLike(event.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  event.isLiked
                    ? 'bg-red-500/20 border-red-500/30 text-red-300'
                    : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
                title={event.isLiked ? 'Unlike' : 'Like'}
              >
                <Heart className={`w-5 h-5 ${event.isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => onShare(event)}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {event.websiteUrl && (
                <a
                  href={event.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;