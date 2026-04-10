import React, { useState, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Eye, 
  EyeOff, 
  Image, 
  FileText, 
  Video, 
  Hash,
  Smile,
  MapPin,
  Calendar,
  Users,
  X,
  Upload,
  File,
  ImageIcon
} from 'lucide-react';

interface PostComposerProps {
  onPostCreate: (content: string, file?: File, isAnonymous?: boolean, tags?: string[]) => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ onPostCreate }) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [postType, setPostType] = useState<'general' | 'question' | 'announcement' | 'study'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onPostCreate(content, file || undefined, isAnonymous, tags);
    setContent('');
    setFile(null);
    setIsAnonymous(false);
    setTags([]);
    setTagInput('');
    setPostType('general');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
      if (!tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const postTypeOptions = [
    { value: 'general', label: 'General', icon: '💬', color: 'text-gray-400' },
    { value: 'question', label: 'Question', icon: '❓', color: 'text-blue-400' },
    { value: 'announcement', label: 'Announcement', icon: '📢', color: 'text-green-400' },
    { value: 'study', label: 'Study Material', icon: '📚', color: 'text-purple-400' }
  ];

  return (
    <div className="bg-[#161b22] rounded-lg border border-gray-800">
      {/* Post Type Selector */}
      <div className="p-3 sm:p-4 border-b border-gray-800">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <span className="text-sm text-gray-400">Post Type:</span>
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
            {postTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPostType(option.value as any)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap touch-manipulation ${
                  postType === option.value
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span>{option.icon}</span>
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        {/* Main Content Area */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'question' 
                ? "Ask a question to your fellow students..."
                : postType === 'announcement'
                ? "Share an important announcement..."
                : postType === 'study'
                ? "Share study materials, notes, or resources..."
                : "Share something with your fellow students..."
            }
            className="w-full h-24 sm:h-32 p-3 sm:p-4 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-sm sm:text-base"
            required
          />
          
          {/* Character Counter */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {content.length}/500
          </div>
        </div>

        {/* Tags Input */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Tags (optional)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs sm:text-sm rounded-full"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-300 hover:text-blue-200 touch-manipulation"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                placeholder="Add tag..."
                className="px-2 py-1 bg-[#0d1117] border border-gray-700 rounded-full text-white text-xs sm:text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none touch-manipulation"
              />
            )}
          </div>
        </div>

        {/* File Attachment */}
        {file && (
          <div className="flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
              {getFileIcon(file)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-white font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-red-400 hover:text-red-300 transition-colors touch-manipulation shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4 overflow-x-auto">
            {/* File Upload */}
            <label className="cursor-pointer flex items-center space-x-1 sm:space-x-2 text-gray-400 hover:text-white transition-colors touch-manipulation whitespace-nowrap">
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Attach</span>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.txt"
              />
            </label>

            {/* Image Upload */}
            <label className="cursor-pointer flex items-center space-x-1 sm:space-x-2 text-gray-400 hover:text-white transition-colors touch-manipulation whitespace-nowrap">
              <Image className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Image</span>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </label>

            {/* Anonymous Toggle */}
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm transition-all touch-manipulation whitespace-nowrap ${
                isAnonymous ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isAnonymous ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">Anonymous</span>
            </button>

            {/* Advanced Options */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors touch-manipulation whitespace-nowrap"
            >
              <span className="hidden sm:inline">Advanced</span>
              <span className="sm:hidden">More</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!content.trim() || content.length > 500}
            className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-all duration-200 font-medium text-sm sm:text-base touch-manipulation"
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Post</span>
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="p-3 sm:p-4 bg-[#0d1117] rounded-lg border border-gray-700 space-y-3 sm:space-y-4">
            <h4 className="text-sm font-medium text-white">Advanced Options</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Add location..."
                  className="flex-1 px-3 py-2 bg-[#161b22] border border-gray-700 rounded-lg text-white text-xs sm:text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none touch-manipulation"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="datetime-local"
                  className="flex-1 px-3 py-2 bg-[#161b22] border border-gray-700 rounded-lg text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none touch-manipulation"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <select className="flex-1 px-3 py-2 bg-[#161b22] border border-gray-700 rounded-lg text-white text-xs sm:text-sm focus:border-blue-500 focus:outline-none touch-manipulation">
                <option value="public">Public</option>
                <option value="college">College Only</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PostComposer;