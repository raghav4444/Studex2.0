import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Calendar, 
  Award, 
  BookOpen,
  Users,
  Briefcase,
  Settings,
  Filter,
  MarkAsRead,
  Trash2,
  MoreVertical
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'event' | 'achievement' | 'study_group' | 'job' | 'mentorship';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  actionUrl?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  metadata?: any;
}

interface NotificationDropdownProps {
  onNotificationCountChange?: (count: number) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNotificationCountChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'likes' | 'comments' | 'events'>('all');

  // Mock notifications data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'like',
        title: 'New Like',
        message: 'Sarah Chen liked your post about "Study Tips for Finals"',
        isRead: false,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        senderId: 'user1',
        senderName: 'Sarah Chen',
        senderAvatar: 'SC',
        actionUrl: '/post/123'
      },
      {
        id: '2',
        type: 'comment',
        title: 'New Comment',
        message: 'Mike Johnson commented on your post: "Great tips! Thanks for sharing."',
        isRead: false,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        senderId: 'user2',
        senderName: 'Mike Johnson',
        senderAvatar: 'MJ',
        actionUrl: '/post/123'
      },
      {
        id: '3',
        type: 'follow',
        title: 'New Follower',
        message: 'Alex Kumar started following you',
        isRead: true,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        senderId: 'user3',
        senderName: 'Alex Kumar',
        senderAvatar: 'AK',
        actionUrl: '/profile/alex-kumar'
      },
      {
        id: '4',
        type: 'event',
        title: 'Event Reminder',
        message: 'Study Group Meeting starts in 30 minutes',
        isRead: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        actionUrl: '/events/study-group-123'
      },
      {
        id: '5',
        type: 'achievement',
        title: 'Achievement Unlocked',
        message: 'You\'ve earned the "Helpful Contributor" badge!',
        isRead: true,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        actionUrl: '/profile/achievements'
      },
      {
        id: '6',
        type: 'study_group',
        title: 'Study Group Invitation',
        message: 'You\'ve been invited to join "Math Study Group"',
        isRead: false,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        actionUrl: '/study-groups/math-123'
      },
      {
        id: '7',
        type: 'job',
        title: 'New Job Alert',
        message: 'Software Developer Internship at TechCorp matches your profile',
        isRead: true,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        actionUrl: '/jobs/techcorp-internship'
      },
      {
        id: '8',
        type: 'mentorship',
        title: 'Mentorship Request',
        message: 'Emma Wilson requested mentorship in "Web Development"',
        isRead: false,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        senderId: 'user4',
        senderName: 'Emma Wilson',
        senderAvatar: 'EW',
        actionUrl: '/mentorship/requests'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  // Update notification count when notifications change
  useEffect(() => {
    const unreadCount = notifications.filter(notif => !notif.isRead).length;
    onNotificationCountChange?.(unreadCount);
  }, [notifications, onNotificationCountChange]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-400" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-yellow-400" />;
      case 'study_group':
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'job':
        return <Briefcase className="w-4 h-4 text-orange-400" />;
      case 'mentorship':
        return <Users className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <div className="bg-[#161b22] rounded-lg">
      {/* Filter Tabs */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 bg-[#0d1117] p-1 rounded-lg">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'likes', label: 'Likes' },
            { key: 'comments', label: 'Comments' },
            { key: 'events', label: 'Events' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                filter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {filteredNotifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-[#0d1117] transition-colors ${
                  !notification.isRead ? 'bg-blue-500/5 border-l-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                        <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                        
                        {notification.senderName && (
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {notification.senderAvatar}
                            </div>
                            <span className="text-xs text-gray-400">{notification.senderName}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500">{formatTimeAgo(notification.timestamp)}</span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
            <p className="text-gray-400">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
