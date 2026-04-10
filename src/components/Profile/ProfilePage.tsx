import React, { useState } from 'react';
import { 
  Edit3,
  Shield, 
  Eye, 
  EyeOff, 
  BookOpen, 
  MessageSquare, 
  Award, 
  Calendar, 
  Users, 
  Activity,
  MapPin,
  GraduationCap,
  Building,
  Github,
  Linkedin,
  Globe,
  Mail,
  LogOut,
  Camera,
  Upload,
  ChevronRight,
  BarChart3,
  Settings,
  User
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import UsernameUpdate from './UsernameUpdate';

interface ProfileData {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  college: string;
  department: string;
  year: string;
  location?: string;
  skills: string[];
  profilePhoto?: string;
  coverPhoto?: string;
  isVerified: boolean;
  isAnonymous: boolean;
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  privacySettings: {
    showRealName: boolean;
    showCollegeInfo: boolean;
    allowDirectMessages: boolean;
  };
  stats: {
    posts: number;
    followers: number;
    following: number;
    studyHours: number;
  };
}

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'groups' | 'events' | 'activity'>('posts');
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showUsernameUpdate, setShowUsernameUpdate] = useState(false);
  
  // Profile data using actual user data
  const [profileData, setProfileData] = useState<ProfileData>({
    id: user?.id || '1',
    name: user?.name || 'User',
    username: user?.username || 'user123',
    email: user?.email || 'user@example.com',
    bio: user?.bio || 'Student at Studex',
    college: user?.college || 'Axis Colleges',
    department: user?.branch || 'Computer Science',
    year: user?.year?.toString() || '2023',
    location: 'India',
    skills: user?.skills || ['Programming', 'Problem Solving'],
    profilePhoto: user?.avatar,
    coverPhoto: undefined,
    isVerified: user?.isVerified || false,
    isAnonymous: user?.isAnonymous || false,
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: ''
    },
    privacySettings: {
      showRealName: true,
      showCollegeInfo: true,
      allowDirectMessages: true
    },
    stats: {
      posts: 0,
      followers: 0,
      following: 0,
      studyHours: 0
    }
  });

  // Calculate profile completion
  const calculateProfileCompletion = (): number => {
    const fields = [
      profileData.name,
      profileData.bio,
      profileData.college,
      profileData.department,
      profileData.year,
      profileData.skills.length > 0,
      profileData.profilePhoto,
      Object.keys(profileData.socialLinks).some(key => profileData.socialLinks[key as keyof typeof profileData.socialLinks])
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleAnonymousToggle = async () => {
    const newAnonymousState = !profileData.isAnonymous;
    setProfileData(prev => ({
      ...prev,
      isAnonymous: newAnonymousState
    }));
    // In real app, update backend here
  };

  const handlePrivacySettingChange = (setting: keyof ProfileData['privacySettings'], value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [setting]: value
      }
    }));
  };

  if (!user) return null;

  const completionPercentage = calculateProfileCompletion();
  const displayName = profileData.isAnonymous ? 'Anonymous User' : profileData.name;
  const displayPhoto = profileData.isAnonymous ? undefined : profileData.profilePhoto;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Section with Anonymous Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile</h1>
          {profileData.isVerified && !profileData.isAnonymous && (
            <div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded-full">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium">Verified</span>
            </div>
          )}
        </div>
        
        {/* Anonymous Mode Toggle - Moved to header */}
        <button
          onClick={handleAnonymousToggle}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
            profileData.isAnonymous 
              ? 'bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30' 
              : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {profileData.isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {profileData.isAnonymous ? 'Anonymous On' : 'Anonymous Off'}
          </span>
        </button>
      </div>

      {/* Main Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header Card */}
          <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl border-4 border-gray-700">
                  {displayPhoto ? (
                    <img 
                      src={displayPhoto} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                {profileData.isVerified && !profileData.isAnonymous && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#161b22]">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {displayName}
                    </h2>
                    {!profileData.isAnonymous && (
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-400">@{profileData.username}</p>
                        <button
                          onClick={() => setShowUsernameUpdate(true)}
                          className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                          title="Edit username"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    
                    <button
                      onClick={() => setShowPrivacySettings(!showPrivacySettings)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Bio */}
                {!profileData.isAnonymous && profileData.bio && (
                  <p className="text-gray-300 mb-4 leading-relaxed">{profileData.bio}</p>
                )}

                {/* Profile Details */}
                {!profileData.isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <GraduationCap className="w-4 h-4" />
                      <span>{profileData.department}, {profileData.year}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Building className="w-4 h-4" />
                      <span>{profileData.college}</span>
                    </div>
                    {profileData.location && (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{profileData.email}</span>
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {!profileData.isAnonymous && Object.values(profileData.socialLinks).some(Boolean) && (
                  <div className="flex items-center space-x-3 mt-4">
                    {profileData.socialLinks.linkedin && (
                      <a
                        href={profileData.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {profileData.socialLinks.github && (
                      <a
                        href={profileData.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {profileData.socialLinks.portfolio && (
                      <a
                        href={profileData.socialLinks.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Skills Tags */}
            {!profileData.isAnonymous && profileData.skills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Skills & Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Privacy Settings Modal */}
          {showPrivacySettings && (
            <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Privacy Settings</h3>
                <button
                  onClick={() => setShowPrivacySettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Show real name on posts</p>
                    <p className="text-sm text-gray-400">Display your actual name instead of username</p>
                  </div>
                  <button
                    onClick={() => handlePrivacySettingChange('showRealName', !profileData.privacySettings.showRealName)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profileData.privacySettings.showRealName ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profileData.privacySettings.showRealName ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Show college info publicly</p>
                    <p className="text-sm text-gray-400">Make your college and department visible</p>
                  </div>
                  <button
                    onClick={() => handlePrivacySettingChange('showCollegeInfo', !profileData.privacySettings.showCollegeInfo)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profileData.privacySettings.showCollegeInfo ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profileData.privacySettings.showCollegeInfo ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Allow direct messages</p>
                    <p className="text-sm text-gray-400">Let other users send you private messages</p>
                  </div>
                  <button
                    onClick={() => handlePrivacySettingChange('allowDirectMessages', !profileData.privacySettings.allowDirectMessages)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profileData.privacySettings.allowDirectMessages ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profileData.privacySettings.allowDirectMessages ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <div className="bg-[#161b22] rounded-xl border border-gray-800">
            {/* Tab Navigation */}
            <div className="border-b border-gray-700">
              <nav className="flex space-x-1 p-1">
                {[
                  { id: 'posts', label: 'My Posts', icon: MessageSquare },
                  { id: 'groups', label: 'Groups', icon: Users },
                  { id: 'events', label: 'Events', icon: Calendar },
                  { id: 'activity', label: 'Activity', icon: Activity }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'posts' && (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
                  <p className="text-gray-400">Share your first post to get started!</p>
                </div>
              )}
              
              {activeTab === 'groups' && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No groups joined</h3>
                  <p className="text-gray-400">Join study groups to collaborate with peers!</p>
                </div>
              )}
              
              {activeTab === 'events' && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No events</h3>
                  <p className="text-gray-400">Create or join events to expand your network!</p>
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No recent activity</h3>
                  <p className="text-gray-400">Start engaging with the community!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
              <span className="text-sm font-medium text-blue-400">{completionPercentage}%</span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-400">
              Complete your profile to improve visibility and connect with more students!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#161b22] rounded-xl border border-gray-800 p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{profileData.stats.posts}</div>
              <div className="text-sm text-gray-400">Posts</div>
            </div>
            <div className="bg-[#161b22] rounded-xl border border-gray-800 p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{profileData.stats.followers}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div className="bg-[#161b22] rounded-xl border border-gray-800 p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{profileData.stats.following}</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
            <div className="bg-[#161b22] rounded-xl border border-gray-800 p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{profileData.stats.studyHours}h</div>
              <div className="text-sm text-gray-400">Study Time</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>View My Notes</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <Award className="w-5 h-5 text-yellow-400" />
                <span>Achievements</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span>Analytics</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
              
              <button 
                onClick={signOut}
                className="w-full flex items-center space-x-3 p-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditMode && (
        <EditProfileModal 
          profileData={profileData}
          setProfileData={setProfileData}
          onClose={() => setIsEditMode(false)}
        />
      )}

      {/* Username Update Modal */}
      {showUsernameUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <UsernameUpdate
              currentUsername={profileData.username}
              onUpdate={(newUsername) => {
                setProfileData({ ...profileData, username: newUsername });
                setShowUsernameUpdate(false);
              }}
              onCancel={() => setShowUsernameUpdate(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Profile Modal Component
interface EditProfileModalProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ profileData, setProfileData, onClose }) => {
  const [editForm, setEditForm] = useState({
    name: profileData.name,
    username: profileData.username,
    bio: profileData.bio,
    college: profileData.college,
    department: profileData.department,
    year: profileData.year,
    location: profileData.location || '',
    skills: profileData.skills.join(', '),
    linkedin: profileData.socialLinks.linkedin || '',
    github: profileData.socialLinks.github || '',
    portfolio: profileData.socialLinks.portfolio || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProfile: ProfileData = {
        ...profileData,
        name: editForm.name,
        username: editForm.username,
        bio: editForm.bio,
        college: editForm.college,
        department: editForm.department,
        year: editForm.year,
        location: editForm.location,
        skills: editForm.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        profilePhoto: previewPhoto || profileData.profilePhoto,
        socialLinks: {
          linkedin: editForm.linkedin,
          github: editForm.github,
          portfolio: editForm.portfolio
        }
      };
      
      setProfileData(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Photo Upload */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden">
              {previewPhoto || profileData.profilePhoto ? (
                <img 
                  src={previewPhoto || profileData.profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                profileData.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                <Camera className="w-4 h-4" />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">College</label>
              <input
                type="text"
                value={editForm.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              <input
                type="text"
                value={editForm.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
              <select
                value={editForm.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              value={editForm.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="JavaScript, Python, React, Machine Learning..."
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Social Links</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
              <input
                type="url"
                value={editForm.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
              <input
                type="url"
                value={editForm.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="https://github.com/yourname"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio</label>
              <input
                type="url"
                value={editForm.portfolio}
                onChange={(e) => handleInputChange('portfolio', e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors font-medium"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;