import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Paperclip, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  MoreVertical, 
  Users, 
  Settings, 
  Volume2, 
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';
import { StudyGroup } from '../../types';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  reactions?: { emoji: string; users: string[] }[];
}

interface GroupChatProps {
  group: StudyGroup;
  isOpen: boolean;
  onClose: () => void;
}

const GroupChat: React.FC<GroupChatProps> = ({ group, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to the group chat! 🎉',
      sender: { id: 'system', name: 'System' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'system',
      isRead: true,
    },
    {
      id: '2',
      content: 'Hey everyone! Ready for our study session tomorrow?',
      sender: { id: '1', name: 'Sarah Chen' },
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: 'text',
      isRead: true,
      reactions: [{ emoji: '👍', users: ['2', '3'] }],
    },
    {
      id: '3',
      content: 'Absolutely! I\'ve prepared some practice problems.',
      sender: { id: '2', name: 'Mike Johnson' },
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: 'text',
      isRead: true,
    },
    {
      id: '4',
      content: 'Same here! Looking forward to it.',
      sender: { id: '3', name: 'Alex Rodriguez' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'text',
      isRead: false,
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>(['1', '2', '3']);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender: { id: 'current-user', name: 'You' },
      timestamp: new Date(),
      type: 'text',
      isRead: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      // Simulate typing indicator
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender.id === 'current-user') {
      return message.isRead ? <CheckCheck className="w-4 h-4 text-blue-400" /> : <Check className="w-4 h-4 text-gray-400" />;
    }
    return null;
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-[#161b22] rounded-lg border border-gray-800 flex flex-col ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-[80vh]'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{group.name}</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-400">{onlineUsers.length} online</span>
                </div>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-400">{group.members.length} members</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Call Controls */}
            <button
              onClick={() => setIsAudioCall(!isAudioCall)}
              className={`p-2 rounded-lg transition-colors ${
                isAudioCall ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {isAudioCall ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsVideoCall(!isVideoCall)}
              className={`p-2 rounded-lg transition-colors ${
                isVideoCall ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {isVideoCall ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const showDate = index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <span className="text-xs text-gray-500 bg-[#0d1117] px-3 py-1 rounded-full">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}

                <div className={`flex items-start space-x-3 ${message.sender.id === 'current-user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {message.sender.name.charAt(0)}
                  </div>
                  
                  <div className={`flex-1 max-w-xs ${message.sender.id === 'current-user' ? 'text-right' : ''}`}>
                    {message.type === 'system' ? (
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <Info className="w-4 h-4" />
                        <span>{message.content}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-white">{message.sender.name}</span>
                          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                        </div>
                        
                        <div className={`p-3 rounded-lg ${
                          message.sender.id === 'current-user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-[#0d1117] text-white border border-gray-700'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>

                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {message.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded-full transition-colors"
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-gray-300">{reaction.users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-1">
                            {getMessageStatus(message)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
              
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-[#0d1117] border border-gray-700 rounded-lg shadow-xl">
                  <div className="grid grid-cols-5 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-lg transition-colors ${
                isRecording ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {showFileUpload && (
            <div className="mt-3 p-3 bg-[#0d1117] border border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">Upload File</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Share Screen</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
                multiple
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
