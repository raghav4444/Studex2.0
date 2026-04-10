import React, { useState } from 'react';
import { Conversation } from '../../types';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { useChat } from '../../hooks/useChat';
import './Chat.css';

const ChatPage: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const chatHook = useChat();

  // Fetch conversations when the page loads
  React.useEffect(() => {
    console.log('🔍 ChatPage: Component mounted, fetching conversations...');
    chatHook.fetchConversations();
  }, [chatHook.fetchConversations]);

  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  const handleBackToList = () => {
    setActiveConversation(null);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row min-h-0">
      {/* Chat List - Full width on mobile/tablet, sidebar on desktop */}
      <div className={`${activeConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 xl:w-1/4 border-r border-gray-800/50 h-full min-h-0`}>
        <ChatList 
          onConversationSelect={handleConversationSelect} 
          chatHook={chatHook}
        />
      </div>

      {/* Chat Window - Full width on mobile/tablet when active, hidden on desktop when no conversation */}
      <div className={`${activeConversation ? 'block' : 'hidden lg:block'} flex-1 h-full min-h-0`}>
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            onBack={handleBackToList}
            chatHook={chatHook}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#0d1117] to-[#161b22] p-6 min-h-0">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Select a conversation</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Choose a conversation from the list to start messaging and connect with your peers
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
