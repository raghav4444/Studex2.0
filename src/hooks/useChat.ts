import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Conversation, Message, User } from '../types';
import { useAuth } from '../components/AuthProvider';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveIdentity = useCallback(async () => {
    if (!user) return null;

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    return {
      authUserId: authData.user.id,
      profileId: user.id,
    };
  }, [user]);

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const identity = await resolveIdentity();
      if (!identity) return;

      // Simplified query to avoid complex relationships
      const { data: participantData, error } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', identity.authUserId);

      if (error) {
        console.error('Error fetching conversations:', error);
        if (error.code === '42P01') {
          setError('Chat tables not found. Please run the database migration first.');
        } else {
          setError(error.message || 'Failed to fetch conversations');
        }
        setConversations([]);
        return;
      }

      // Build conversations with participants
      const formattedConversations: Conversation[] = [];
      
      if (participantData && participantData.length > 0) {
        // Group by conversation_id to avoid duplicates
        const conversationMap = new Map();
        
        for (const participant of participantData) {
          const conversationId = participant.conversation_id;
          
          if (!conversationMap.has(conversationId)) {
            // Get all participants for this conversation
            const { data: allParticipants } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', conversationId);

            const participants = [];
            if (allParticipants && allParticipants.length > 0) {
              for (const p of allParticipants) {
                const { data: profileDataArray } = await supabase
                  .from('profiles')
                  .select('id, user_id, name, username, email, college, branch, year, avatar_url, is_online, last_seen')
                  .eq('user_id', p.user_id)
                  .limit(1);
                
                const profileData = profileDataArray?.[0];
                
                if (profileData) {
                  participants.push({
                    id: profileData.id,
                    name: profileData.name,
                    username: profileData.username || profileData.email?.split('@')[0] || profileData.name.toLowerCase().replace(/\s+/g, ''),
                    email: profileData.email,
                    college: profileData.college,
                    branch: profileData.branch,
                    year: profileData.year,
                    bio: '',
                    isVerified: false,
                    isAnonymous: false,
                    avatar: profileData.avatar_url,
                    skills: [],
                    achievements: [],
                    joinedAt: new Date(),
                    lastActive: profileData.last_seen ? new Date(profileData.last_seen) : new Date(),
                  });
                }
              }
            }

            // Get the last message for this conversation
            const { data: lastMessageData } = await supabase
              .from('messages')
              .select('id, sender_id, content, message_type, file_name, created_at')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: false })
              .limit(1);

            let lastMessage = null;
            if (lastMessageData && lastMessageData.length > 0) {
              const msg = lastMessageData[0];
              
              // Find the sender profile
              const { data: senderProfileData } = await supabase
                .from('profiles')
                .select('id, user_id, name, username, email, college, branch, year, avatar_url')
                .eq('user_id', msg.sender_id)
                .limit(1);
              
              if (senderProfileData && senderProfileData.length > 0) {
                const senderProfile = senderProfileData[0];
                const sender = {
                  id: senderProfile.id,
                  name: senderProfile.name,
                  username: senderProfile.username || senderProfile.email?.split('@')[0] || senderProfile.name.toLowerCase().replace(/\s+/g, ''),
                  email: senderProfile.email,
                  college: senderProfile.college,
                  branch: senderProfile.branch,
                  year: senderProfile.year,
                  bio: '',
                  isVerified: false,
                  isAnonymous: false,
                  avatar: senderProfile.avatar_url,
                  skills: [],
                  achievements: [],
                  joinedAt: new Date(),
                  lastActive: new Date(),
                };
                
                lastMessage = {
                  id: msg.id,
                  conversationId: conversationId,
                  senderId: sender.id,
                  sender: sender,
                  content: msg.content,
                  messageType: msg.message_type as 'text' | 'image' | 'file',
                  fileUrl: null,
                  fileName: msg.file_name,
                  fileType: null,
                  isRead: false,
                  createdAt: new Date(msg.created_at),
                  updatedAt: new Date(msg.created_at),
                };
              }
            }

            // Filter out the current user from participants to show only other users
            const otherParticipants = participants.filter(p => p.id !== identity.profileId);

            conversationMap.set(conversationId, {
              id: conversationId,
              participants: otherParticipants, // Only show other users, not yourself
              lastMessage,
              unreadCount: 0, // TODO: Calculate actual unread count
              createdAt: new Date(),
              updatedAt: lastMessage ? lastMessage.createdAt : new Date(),
            });
          }
        }
        
        // Convert map to array
        formattedConversations.push(...conversationMap.values());
      }

      setConversations(formattedConversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [resolveIdentity, user]);

  // Fetch participants for a specific conversation
  const fetchConversationParticipants = useCallback(async (conversationId: string) => {
    if (!user) return [];

    try {
      // Get all participants for this conversation
      const { data: participantsData } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId);

      if (!participantsData || participantsData.length === 0) {
        return [];
      }

      // Fetch profile data for each participant
      const participants = [];
      for (const p of participantsData) {
        const { data: profileDataArray } = await supabase
          .from('profiles')
          .select('id, user_id, name, username, email, college, branch, year, avatar_url, is_online, last_seen')
          .eq('user_id', p.user_id)
          .limit(1);
        
        const profileData = profileDataArray?.[0];
        
        if (profileData) {
          participants.push({
            id: profileData.id,
            name: profileData.name,
            username: profileData.username || profileData.email?.split('@')[0] || profileData.name.toLowerCase().replace(/\s+/g, ''),
            email: profileData.email,
            college: profileData.college,
            branch: profileData.branch,
            year: profileData.year,
            bio: '',
            isVerified: false,
            isAnonymous: false,
            avatar: profileData.avatar_url,
            skills: [],
            achievements: [],
            joinedAt: new Date(),
            lastActive: profileData.last_seen ? new Date(profileData.last_seen) : new Date(),
          });
        }
      }

      return participants;
    } catch (err) {
      console.error('Error fetching conversation participants:', err);
      return [];
    }
  }, [user]);

  // Create or get existing conversation with a user
  const startConversation = useCallback(async (otherUserId: string) => {
    const identity = await resolveIdentity();
    console.log('🔍 startConversation called with:', { otherUserId, currentUser: identity?.authUserId });
    
    if (!identity) {
      console.log('❌ No current user found');
      return null;
    }

    try {
      // Check if conversation already exists (simplified query)
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', identity.authUserId);

      if (checkError) {
        console.log('❌ Error checking existing conversations:', checkError);
        if (checkError.code === '42P01') {
          setError('Chat tables not found. Please run the database migration first.');
        } else {
          throw checkError;
        }
        return null;
      }
      
      console.log('🔍 Existing conversations:', existingConversation);

      // Find existing conversation with the other user by checking all conversations
      let existingConv = null;
      if (existingConversation && existingConversation.length > 0) {
        for (const conv of existingConversation) {
          // Check if this conversation also has the other user as a participant
          const { data: otherParticipantData } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id)
            .eq('user_id', otherUserId)
            .limit(1);
          
          const otherParticipant = otherParticipantData?.[0];
          
          if (otherParticipant) {
            existingConv = conv;
            break;
          }
        }
      }

      if (existingConv) {
        console.log('✅ Found existing conversation:', existingConv.conversation_id);
        return existingConv.conversation_id;
      }

      console.log('🆕 Creating new conversation...');
      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (createError) {
        console.log('❌ Error creating conversation:', createError);
        throw createError;
      }
      
      console.log('✅ Created new conversation:', newConversation);

      // Add both users as participants
      console.log('👥 Adding participants...');
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConversation.id, user_id: identity.authUserId },
          { conversation_id: newConversation.id, user_id: otherUserId },
        ]);

      if (participantsError) {
        console.log('❌ Error adding participants:', participantsError);
        throw participantsError;
      }

      console.log('✅ Participants added successfully');
      return newConversation.id;
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
      return null;
    }
  }, [resolveIdentity]);

  // Send a message
  const sendMessage = useCallback(async (conversationId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text', fileUrl?: string, fileName?: string, fileType?: string) => {
    if (!user) return;

    try {
      const identity = await resolveIdentity();
      if (!identity) return;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: identity.authUserId,
          content,
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new message to local state
      const newMessage: Message = {
        id: data.id,
        conversationId: data.conversation_id,
        senderId: user.id,
        sender: user,
        content: data.content,
        messageType: data.message_type as 'text' | 'image' | 'file',
        fileUrl: data.file_url,
        fileName: data.file_name,
        fileType: data.file_type,
        isRead: data.is_read,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [resolveIdentity, user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Simplified query to avoid complex relationships
      const { data: messageData, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          file_url,
          file_name,
          file_type,
          is_read,
          created_at,
          updated_at
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Build messages with sender profile data fetched separately
      const formattedMessages: Message[] = [];
      
      if (messageData && messageData.length > 0) {
        for (const msg of messageData) {
          // Fetch sender profile data
          const { data: senderProfileData } = await supabase
            .from('profiles')
            .select('id, user_id, name, username, email, college, branch, year, avatar_url')
            .eq('user_id', msg.sender_id)
            .limit(1);
          
          const senderProfile = senderProfileData?.[0];

          if (senderProfile) {
            formattedMessages.push({
              id: msg.id,
              conversationId: msg.conversation_id,
              senderId: senderProfile.id,
              sender: {
                id: senderProfile.id,
                name: senderProfile.name,
                username: senderProfile.username || senderProfile.email?.split('@')[0] || senderProfile.name.toLowerCase().replace(/\s+/g, ''),
                email: senderProfile.email,
                college: senderProfile.college,
                branch: senderProfile.branch,
                year: senderProfile.year,
                bio: '',
                isVerified: false,
                isAnonymous: false,
                avatar: senderProfile.avatar_url,
                skills: [],
                achievements: [],
                joinedAt: new Date(),
                lastActive: new Date(),
              },
              content: msg.content,
              messageType: msg.message_type as 'text' | 'image' | 'file',
              fileUrl: msg.file_url,
              fileName: msg.file_name,
              fileType: msg.file_type,
              isRead: msg.is_read,
              createdAt: new Date(msg.created_at),
              updatedAt: new Date(msg.updated_at),
            });
          }
        }
      }

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const identity = await resolveIdentity();
      if (!identity) return;

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', identity.authUserId);

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.conversationId === conversationId && msg.senderId !== user.id
            ? { ...msg, isRead: true }
            : msg
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [resolveIdentity, user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMessage = payload.new as any;
        
        // Only add message if it's for a conversation the user is part of
        const isParticipant = conversations.some(conv => conv.id === newMessage.conversation_id);
        if (isParticipant) {
          // Fetch the sender profile
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', newMessage.sender_id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                const message: Message = {
                  id: newMessage.id,
                  conversationId: newMessage.conversation_id,
                  senderId: profile.id,
                  sender: {
                    id: profile.id,
                    name: profile.name,
                    username: profile.username,
                    email: profile.email,
                    college: profile.college,
                    branch: profile.branch,
                    year: profile.year,
                    bio: profile.bio || '',
                    isVerified: profile.is_verified,
                    isAnonymous: profile.is_anonymous,
                    avatar: profile.avatar_url,
                    skills: profile.skills || [],
                    achievements: profile.achievements || [],
                    joinedAt: new Date(profile.created_at),
                    lastActive: new Date(profile.updated_at),
                  },
                  content: newMessage.content,
                  messageType: newMessage.message_type,
                  fileUrl: newMessage.file_url,
                  fileName: newMessage.file_name,
                  fileType: newMessage.file_type,
                  isRead: newMessage.is_read,
                  createdAt: new Date(newMessage.created_at),
                  updatedAt: new Date(newMessage.updated_at),
                };

                setMessages(prev => [...prev, message]);
              }
            });
        }
      })
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [conversations]);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    fetchConversations,
    fetchConversationParticipants,
    startConversation,
    sendMessage,
    fetchMessages,
    markMessagesAsRead,
    setActiveConversation,
  };
};
