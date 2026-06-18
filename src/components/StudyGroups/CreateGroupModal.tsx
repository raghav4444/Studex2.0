import React, { useEffect, useState } from 'react';
import { X, Users, Lock, Globe, BookOpen, Tag, Hash, AlertCircle, Link2, CalendarClock, ImagePlus, MapPin } from 'lucide-react';
import { useStudyGroups } from '../../hooks/useStudyGroups';
import { StudyGroup } from '../../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  mode?: 'create' | 'edit';
  initialGroup?: StudyGroup | null;
}

const emptyForm = {
  name: '',
  subject: '',
  description: '',
  maxMembers: 10,
  isPrivate: false,
  tags: [] as string[],
  coverImageUrl: '',
  meetingLocation: '',
  meetingLink: '',
  nextSessionAt: '',
};

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSuccess, mode = 'create', initialGroup }) => {
  const { createStudyGroup, updateStudyGroup } = useStudyGroups();
  const [formData, setFormData] = useState({
    ...emptyForm,
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && initialGroup) {
      setFormData({
        name: initialGroup.name,
        subject: initialGroup.subject,
        description: initialGroup.description,
        maxMembers: initialGroup.maxMembers,
        isPrivate: initialGroup.isPrivate,
        tags: initialGroup.tags,
        coverImageUrl: initialGroup.coverImageUrl || '',
        meetingLocation: initialGroup.meetingLocation || '',
        meetingLink: initialGroup.meetingLink || '',
        nextSessionAt: initialGroup.nextSessionAt ? new Date(initialGroup.nextSessionAt).toISOString().slice(0, 16) : '',
      });
      setTagInput('');
      setError(null);
      return;
    }

    setFormData({ ...emptyForm });
    setTagInput('');
    setError(null);
  }, [isOpen, initialGroup, mode]);

  const subjects = [
    'Computer Science',
    'Physics',
    'Mechanical Engineering',
    'Mathematics',
    'Chemistry',
    'Biology',
    'Economics',
    'Psychology',
    'Business',
    'Medicine',
    'Law',
    'Arts',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedSession = formData.nextSessionAt ? new Date(formData.nextSessionAt) : null;
      const payload = {
        name: formData.name.trim(),
        subject: formData.subject,
        description: formData.description.trim(),
        maxMembers: formData.maxMembers,
        isPrivate: formData.isPrivate,
        tags: formData.tags,
        coverImageUrl: formData.coverImageUrl.trim() || undefined,
        meetingLocation: formData.meetingLocation.trim() || undefined,
        meetingLink: formData.meetingLink.trim() || undefined,
        nextSessionAt: parsedSession && !Number.isNaN(parsedSession.getTime()) ? parsedSession : null,
      };

      if (mode === 'edit' && initialGroup) {
        await updateStudyGroup(initialGroup.id, payload);
      } else {
        await createStudyGroup(payload);
      }

      await onSuccess?.();

      setFormData({ ...emptyForm });
      setTagInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create study group');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#161b22] shadow-2xl shadow-black/40">
        <div className="p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300">{mode === 'edit' ? 'Edit study group' : 'Create study group'}</p>
              <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{mode === 'edit' ? 'Refine the group setup' : 'Launch a new study space'}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-center space-x-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Group Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter group name..."
                className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                maxLength={100}
              />
              <p className="mt-1 text-xs text-gray-500">{formData.name.length}/100 characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Subject *
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-10 pr-4 text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this study group is about..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#0d1117] px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">{formData.description.length}/500 characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Maximum Members
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: Math.max(2, Math.min(50, parseInt(e.target.value) || 10)) }))}
                  min="2"
                  max="50"
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-10 pr-4 text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Between 2 and 50 members</p>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-white">
                Privacy Setting
              </label>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <label className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="radio"
                    name="privacy"
                    checked={!formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                    className="h-4 w-4 bg-[#0d1117] text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Public</p>
                      <p className="text-xs text-gray-400">Anyone can find and join this group</p>
                    </div>
                  </div>
                </label>
                
                <label className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="radio"
                    name="privacy"
                    checked={formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                    className="h-4 w-4 bg-[#0d1117] text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-orange-400" />
                    <div>
                      <p className="text-white font-medium">Private</p>
                      <p className="text-xs text-gray-400">Members request to join and creator approval is required</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Meeting link</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">Meeting location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.meetingLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingLocation: e.target.value }))}
                    placeholder="Library, room 204"
                    className="w-full rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">Next session</label>
              <div className="relative">
                <CalendarClock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.nextSessionAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextSessionAt: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-10 pr-4 text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">Cover image URL</label>
              <div className="relative">
                <ImagePlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1117] py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Tags (Optional)
              </label>
              <div className="mb-3 flex items-center space-x-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Add a tag..."
                    className="w-full rounded-2xl border border-white/10 bg-[#0d1117] py-2.5 pl-10 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    maxLength={20}
                  />
                </div>
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 5}
                  className="rounded-2xl bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500"
                >
                  Add
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 rounded-full bg-blue-500/15 px-3 py-1 text-sm text-blue-300"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-400 hover:text-blue-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">Up to 5 tags, 20 characters each</p>
            </div>

            <div className="flex items-center justify-end space-x-3 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-400 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || !formData.subject || !formData.description.trim()}
                className="flex items-center space-x-2 rounded-2xl bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{mode === 'edit' ? 'Saving...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>{mode === 'edit' ? 'Save Group' : 'Create Group'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
