import React, { useState } from 'react';
import { Bell, Heart, MessageSquare, Users, Award, Calendar, Check, Trash2 } from 'lucide-react';
import { Notification } from '../../types';

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      userId: '1',
      type: 'like',
      title: 'Post Liked',
      message: 'Sarah Chen liked your post about Data Structures',
      isRead: false,
      actionUrl: '/home',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: '2',
      userId: '1',
      type: 'comment',
      title: 'New Comment',
      message: 'Alex Rodriguez commented on your quantum mechanics notes',
      isRead: false,
      actionUrl: '/notes',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '3',
      userId: '1',
      type: 'mentorship',
      title: 'Mentorship Request',
      message: 'Emily Wang sent you a mentorship request',
      isRead: true,
      actionUrl: '/mentorship',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: '4',
      userId: '1',
      type: 'event',
      title: 'Event Reminder',
      message: 'AI/ML Study Group starts in 2 hours',
      isRead: false,
      actionUrl: '/events',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: '5',
      userId: '1',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You earned the "Knowledge Sharer" badge for uploading 5 notes',
      isRead: true,
      actionUrl: '/profile',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return Heart;
      case 'comment': return MessageSquare;
      case 'mentorship': return Users;
      case 'event': return Calendar;
      case 'achievement': return Award;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like': return 'text-red-400 bg-red-500/20';
      case 'comment': return 'text-blue-400 bg-blue-500/20';
      case 'mentorship': return 'text-purple-400 bg-purple-500/20';
      case 'event': return 'text-green-400 bg-green-500/20';
      case 'achievement': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || 
    (filter === 'unread' && !notif.isRead) ||
    notif.type === filter
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 px-2 py-1 bg-blue-500 text-white text-sm rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-400">Stay updated with your CampusLink activity</p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
          >
            <Check className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 mb-8 bg-[#161b22] p-1 rounded-lg border border-gray-800 overflow-x-auto">
        {['all', 'unread', 'like', 'comment', 'mentorship', 'event', 'achievement'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${
              filter === filterType
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type);
          const colorClasses = getNotificationColor(notification.type);
          
          return (
            <div
              key={notification.id}
              className={`bg-[#161b22] rounded-lg p-6 border transition-all duration-200 hover:border-gray-700 ${
                notification.isRead ? 'border-gray-800' : 'border-blue-500/30 bg-blue-500/5'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{notification.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mb-3">{notification.message}</p>
                  
                  <div className="flex items-center space-x-3">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                    
                    <button className="text-gray-400 hover:text-white text-sm transition-colors">
                      View
                    </button>
                    
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
          <p className="text-gray-400">
            {filter === 'all' ? 'You\'re all caught up!' : `No ${filter} notifications found`}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;