import React, { useState } from 'react';
import { Video, Mic, Play, Clock, Users, Award } from 'lucide-react';

const SkillHubPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'interview' | 'speaking'>('interview');

  const mockInterviews = [
    {
      id: '1',
      title: 'Technical Interview - Data Structures',
      duration: '30 minutes',
      difficulty: 'Intermediate',
      participants: 12,
      description: 'Practice common data structure questions with real-time feedback',
    },
    {
      id: '2',
      title: 'Behavioral Interview Prep',
      duration: '20 minutes',
      difficulty: 'Beginner',
      participants: 8,
      description: 'Master the STAR method and common behavioral questions',
    },
    {
      id: '3',
      title: 'System Design Interview',
      duration: '45 minutes',
      difficulty: 'Advanced',
      participants: 15,
      description: 'Learn to design scalable systems and communicate your thought process',
    },
  ];

  const speakingPrompts = [
    {
      id: '1',
      title: 'Daily Topic: Climate Change Solutions',
      timeLimit: '2 minutes',
      submissions: 23,
      deadline: '6 hours left',
    },
    {
      id: '2',
      title: 'Presentation Skills: Explain Your Project',
      timeLimit: '3 minutes',
      submissions: 31,
      deadline: '2 days left',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Skill Hub</h1>
        <p className="text-gray-400">Improve your communication and interview skills</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 mb-8 bg-[#161b22] p-1 rounded-lg border border-gray-800 w-fit mx-auto">
        <button
          onClick={() => setSelectedTab('interview')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all duration-200 ${
            selectedTab === 'interview'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span className="font-medium">Mock Interviews</span>
        </button>
        
        <button
          onClick={() => setSelectedTab('speaking')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all duration-200 ${
            selectedTab === 'speaking'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span className="font-medium">Speaking Practice</span>
        </button>
      </div>

      {selectedTab === 'interview' && (
        <div className="space-y-6">
          <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Available Mock Interviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockInterviews.map((interview) => (
                <div key={interview.id} className="bg-[#0d1117] rounded-lg p-5 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Video className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      interview.difficulty === 'Beginner' 
                        ? 'bg-green-500/20 text-green-300'
                        : interview.difficulty === 'Intermediate'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {interview.difficulty}
                    </span>
                  </div>

                  <h4 className="font-semibold text-white mb-2">{interview.title}</h4>
                  <p className="text-sm text-gray-400 mb-4">{interview.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-gray-300">{interview.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Participants</span>
                      <span className="text-gray-300">{interview.participants}</span>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200">
                    <Play className="w-4 h-4" />
                    <span>Start Interview</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'speaking' && (
        <div className="space-y-6">
          <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Speaking Challenges</h3>
            <div className="space-y-4">
              {speakingPrompts.map((prompt) => (
                <div key={prompt.id} className="bg-[#0d1117] rounded-lg p-5 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Mic className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{prompt.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{prompt.timeLimit}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{prompt.submissions} submissions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                      {prompt.deadline}
                    </span>
                  </div>

                  <button className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200">
                    <Mic className="w-4 h-4" />
                    <span>Start Recording</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-1">12</h4>
                <p className="text-sm text-gray-400">Challenges Completed</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="font-semibold text-white mb-1">4.2</h4>
                <p className="text-sm text-gray-400">Average Rating</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="font-semibold text-white mb-1">7 day</h4>
                <p className="text-sm text-gray-400">Current Streak</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillHubPage;