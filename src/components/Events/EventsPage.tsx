import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Plus, 
  Filter, 
  Search,
  Settings,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  TrendingUp,
  Activity,
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  ExternalLink,
  Video,
  Phone,
  Share2,
  Bookmark,
  Flag,
  UserPlus,
  UserMinus,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  MessageSquare,
  Heart,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Mic,
  MicOff,
  Camera,
  CameraOff
} from 'lucide-react';
import { Event } from '../../types';
import { useAuth } from '../AuthProvider';
import { useEvents } from '../../hooks/useEvents';
import CreateEventModal from './CreateEventModal';

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'my-events'>('upcoming');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
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
    refetch
  } = useEvents();

  // Mock notifications data
  const [notifications] = useState([
    { id: '1', type: 'event_reminder', message: 'AI/ML Study Group starts in 1 hour', time: '1h ago' },
    { id: '2', type: 'new_attendee', message: 'Sarah Chen joined your Physics Workshop', time: '2h ago' },
    { id: '3', type: 'event_update', message: 'Career Fair location changed to online', time: '4h ago' },
    { id: '4', type: 'event_cancelled', message: 'Math Study Session has been cancelled', time: '6h ago' },
    { id: '5', type: 'new_event', message: 'New event: Web Dev Bootcamp', time: '1d ago' }
  ]);

  // Filter events based on search, filter, and tab
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'online' && event.isOnline) ||
                         (selectedFilter === 'offline' && !event.isOnline) ||
                         (selectedFilter === 'my-college' && event.organizer.college === user?.college);
    
    let matchesTab = true;
    if (activeTab === 'upcoming') {
      matchesTab = event.date > new Date();
    } else if (activeTab === 'past') {
      matchesTab = event.date <= new Date();
    } else if (activeTab === 'my-events') {
      matchesTab = isUserOrganizer(event.id) || isUserAttending(event.id);
    }
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await joinEvent(eventId);
      setNotificationCount(prev => prev + 1);
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await leaveEvent(eventId);
    } catch (error) {
      console.error('Error leaving event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const diffInHours = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return { status: 'past', color: 'text-gray-500', bg: 'bg-gray-500/20' };
    if (diffInHours < 1) return { status: 'starting', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (diffInHours < 24) return { status: 'today', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { status: 'upcoming', color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 bg-blue-500 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error loading events</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Campus Events</h1>
          <p className="text-gray-400">Discover and join events happening in your college and beyond</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-[#161b22] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-[#161b22] border border-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Event Notifications</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-800 hover:bg-[#0d1117] transition-colors">
                      <p className="text-sm text-white">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#161b22] rounded-lg border border-gray-800 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
              </div>
            </button>
          </div>

          <button
            onClick={() => setShowCreateEvent(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#161b22] rounded-lg border border-gray-800 mb-6">
        <div className="flex items-center space-x-1 p-1">
          {[
            { key: 'upcoming', label: 'Upcoming', icon: Calendar },
            { key: 'past', label: 'Past Events', icon: Clock },
            { key: 'my-events', label: 'My Events', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none"
            >
              <option value="all">All Events</option>
              <option value="my-college">My College</option>
              <option value="online">Online Events</option>
              <option value="offline">In-Person Events</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </button>
          </div>
        </div>
      </div>

      {/* Events Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventStatus = getEventStatus(event);
            return (
              <div key={event.id} className="bg-[#161b22] rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                      {event.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {event.isOnline ? (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>Online</span>
                        </span>
                      ) : (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>In-Person</span>
                        </span>
                      )}
                      
                      <span className={`text-xs px-2 py-1 rounded-full ${eventStatus.bg} ${eventStatus.color}`}>
                        {eventStatus.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{formatDate(event.date)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">
                        {event.attendees.length}/{event.maxAttendees || '∞'} attending
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {event.organizer.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-400">{event.organizer.name}</span>
                    </div>
                    
                    <span className="text-xs text-gray-500">{formatTimeAgo(event.date)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isUserAttending(event.id) ? (
                      <button
                        onClick={() => handleLeaveEvent(event.id)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-all duration-200"
                      >
                        <UserMinus className="w-4 h-4" />
                        <span>Leave</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all duration-200"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Join Event</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventDetails(true);
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-200"
                    >
                      View
                    </button>
                  </div>

                  {isUserOrganizer(event.id) && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-800">
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEditEvent(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs rounded transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  {event.isOnline && event.meetingLink && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm rounded-lg transition-all duration-200">
                        <Video className="w-4 h-4" />
                        <span>Join Meeting</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const eventStatus = getEventStatus(event);
            return (
              <div key={event.id} className="bg-[#161b22] rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                        {event.isOnline ? (
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                            Online
                          </span>
                        ) : (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                            In-Person
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${eventStatus.bg} ${eventStatus.color}`}>
                          {eventStatus.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4">{event.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees.length}/{event.maxAttendees || '∞'} attending</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {event.organizer.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-400">{event.organizer.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isUserAttending(event.id) ? (
                          <button
                            onClick={() => handleLeaveEvent(event.id)}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-all duration-200"
                          >
                            Leave
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinEvent(event.id)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all duration-200"
                          >
                            Join
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventDetails(true);
                          }}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-200"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
          <p className="text-gray-400 mb-4">Try adjusting your search or create a new event</p>
          <button
            onClick={() => setShowCreateEvent(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal 
        isOpen={showCreateEvent} 
        onClose={() => setShowCreateEvent(false)} 
      />
    </div>
  );
};

export default EventsPage;