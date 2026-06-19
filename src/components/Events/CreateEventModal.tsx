import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Globe, Clock, Tag, Hash, AlertCircle, Link as LinkIcon, ChevronDown, Sparkles } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { EventCategory } from '../../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryOptions: { value: EventCategory; label: string; icon: string }[] = [
  { value: 'hackathon', label: 'Hackathon', icon: '💻' },
  { value: 'workshop', label: 'Workshop', icon: '🔧' },
  { value: 'conference', label: 'Conference', icon: '🎤' },
  { value: 'competition', label: 'Competition', icon: '🏆' },
  { value: 'webinar', label: 'Webinar', icon: '📺' },
  { value: 'meetup', label: 'Meetup', icon: '👥' },
  { value: 'cultural', label: 'Cultural', icon: '🎭' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'fest', label: 'Fest', icon: '🎉' },
  { value: 'seminar', label: 'Seminar', icon: '📚' },
];

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner', color: 'text-emerald-400' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-amber-400' },
  { value: 'advanced', label: 'Advanced', color: 'text-red-400' },
];

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { createEvent, refetch } = useEvents();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: 50,
    isOnline: false,
    meetingLink: '',
    tags: [] as string[],
    category: 'workshop' as EventCategory,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    fee: 0,
    allowsTeams: false,
    eligibility: '',
    contactEmail: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Event title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.date || !formData.time) {
      setError('Date and time are required');
      return;
    }
    if (!formData.isOnline && !formData.location.trim()) {
      setError('Location is required for in-person events');
      return;
    }
    if (formData.isOnline && !formData.meetingLink.trim()) {
      setError('Meeting link is required for online events');
      return;
    }

    const eventDate = new Date(`${formData.date}T${formData.time}`);
    if (eventDate <= new Date()) {
      setError('Event date must be in the future');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createEvent({
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: eventDate,
        location: formData.isOnline ? 'Online' : formData.location.trim(),
        maxAttendees: formData.maxAttendees,
        tags: formData.tags,
        isOnline: formData.isOnline,
        meetingLink: formData.isOnline ? formData.meetingLink.trim() : undefined,
        category: formData.category,
        difficulty: formData.difficulty,
        fee: formData.fee,
        allowsTeams: formData.allowsTeams,
        eligibility: formData.eligibility || undefined,
        contactEmail: formData.contactEmail || undefined,
      });

      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        maxAttendees: 50,
        isOnline: false,
        meetingLink: '',
        tags: [],
        category: 'workshop',
        difficulty: 'beginner',
        fee: 0,
        allowsTeams: false,
        eligibility: '',
        contactEmail: '',
      });
      setTagInput('');
      refetch();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5 && tag.length <= 20) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const selectedCategory = categoryOptions.find(c => c.value === formData.category);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div
        className="bg-[#0d1117] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 border-b border-white/10 bg-gradient-to-r from-[#161b22] to-[#0d1117]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Create New Event</h2>
                <p className="text-xs text-gray-500">Fill in the details below</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Annual Tech Fest 2026"
                className="w-full px-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1.5">{formData.title.length}/100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event, what participants can expect, and why they should join..."
                rows={3}
                className="w-full px-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1.5">{formData.description.length}/500 characters</p>
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <button
                  type="button"
                  onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowDifficultyDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white transition-all hover:border-white/20"
                >
                  <span className="flex items-center gap-2">
                    <span>{selectedCategory?.icon}</span>
                    <span>{selectedCategory?.label}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-2 w-full bg-[#161b22] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => { setFormData(prev => ({ ...prev, category: cat.value })); setShowCategoryDropdown(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors ${formData.category === cat.value ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300'}`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <button
                  type="button"
                  onClick={() => { setShowDifficultyDropdown(!showDifficultyDropdown); setShowCategoryDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white transition-all hover:border-white/20"
                >
                  <span className={difficultyOptions.find(d => d.value === formData.difficulty)?.color}>
                    {difficultyOptions.find(d => d.value === formData.difficulty)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {showDifficultyDropdown && (
                  <div className="absolute z-10 mt-2 w-full bg-[#161b22] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                    {difficultyOptions.map((diff) => (
                      <button
                        key={diff.value}
                        type="button"
                        onClick={() => { setFormData(prev => ({ ...prev, difficulty: diff.value as any })); setShowDifficultyDropdown(false); }}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors ${diff.color}`}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={today}
                    className="w-full pl-11 pr-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Event Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Event Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isOnline: false, meetingLink: '' }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    !formData.isOnline
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">In-Person</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isOnline: true }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    formData.isOnline
                      ? 'bg-green-500/20 border-green-500/40 text-green-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">Online</span>
                </button>
              </div>
            </div>

            {/* Location / Meeting Link */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {formData.isOnline ? 'Meeting Link' : 'Location'} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                {formData.isOnline ? (
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                ) : (
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                )}
                <input
                  type={formData.isOnline ? 'url' : 'text'}
                  value={formData.isOnline ? formData.meetingLink : formData.location}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ...(formData.isOnline ? { meetingLink: e.target.value } : { location: e.target.value })
                  }))}
                  placeholder={formData.isOnline ? 'https://meet.google.com/...' : 'Campus Auditorium, Room 101'}
                  className="w-full pl-11 pr-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Max Attendees & Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Attendees</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: Math.max(1, Math.min(10000, parseInt(e.target.value) || 50)) }))}
                    min="1"
                    max="10000"
                    className="w-full pl-11 pr-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entry Fee (₹)</label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, fee: Math.max(0, Math.min(100000, parseInt(e.target.value) || 0)) }))}
                  min="0"
                  max="100000"
                  placeholder="0 for free"
                  className="w-full px-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Allows Teams */}
            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Team Formation</p>
                <p className="text-xs text-gray-500 mt-0.5">Allow participants to form teams</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, allowsTeams: !prev.allowsTeams }))}
                className={`w-12 h-7 rounded-full transition-colors relative ${formData.allowsTeams ? 'bg-blue-500' : 'bg-white/20'}`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${formData.allowsTeams ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="organizer@example.com"
                className="w-full px-4 py-3 bg-[#161b22] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags (Optional)</label>
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    maxLength={20}
                  />
                </div>
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 5}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-gray-500 text-white rounded-xl transition-colors text-sm font-medium"
                >
                  Add
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-300 px-3 py-1.5 rounded-full text-sm border border-blue-500/20"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 p-0.5 rounded-full hover:bg-blue-500/20 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Up to 5 tags, 20 characters each. Press Enter to add.</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.date || !formData.time}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-gray-500 text-white rounded-xl transition-colors text-sm font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Create Event</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;