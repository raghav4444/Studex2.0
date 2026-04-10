import React from 'react';
import { Shield, BookOpen, Users, Video, MessageSquare, Award } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Verified Student Network',
      description: 'Connect only with verified college students using .edu and .ac.in email addresses.',
      color: 'blue'
    },
    {
      icon: BookOpen,
      title: 'Notes Library',
      description: 'Access and share study materials, lecture notes, and resources with your peers.',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Peer Mentorship',
      description: 'Find mentors and mentees in your field. Get guidance from seniors and help juniors.',
      color: 'purple'
    },
    {
      icon: Video,
      title: 'Mock Interviews',
      description: 'Practice interviews with AI and peer feedback to ace your job applications.',
      color: 'orange'
    },
    {
      icon: MessageSquare,
      title: 'Study Groups',
      description: 'Join or create study groups for collaborative learning and exam preparation.',
      color: 'pink'
    },
    {
      icon: Award,
      title: 'Skill Development',
      description: 'Improve communication skills with daily speaking challenges and peer reviews.',
      color: 'cyan'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400',
      green: 'bg-green-500/20 text-green-400',
      purple: 'bg-purple-500/20 text-purple-400',
      orange: 'bg-orange-500/20 text-orange-400',
      pink: 'bg-pink-500/20 text-pink-400',
      cyan: 'bg-cyan-500/20 text-cyan-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section id="features" className="py-20 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            CampusLink provides a comprehensive platform for student networking, 
            learning, and professional development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-[#161b22] rounded-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                <div className={`w-12 h-12 ${getColorClasses(feature.color)} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;