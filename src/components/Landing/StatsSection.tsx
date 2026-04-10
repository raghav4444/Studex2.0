import React from 'react';
import { Users, BookOpen, GraduationCap, MessageSquare } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: '10,000+',
      label: 'Verified Students',
      description: 'Active learners across colleges'
    },
    {
      icon: GraduationCap,
      value: '500+',
      label: 'Partner Colleges',
      description: 'Universities worldwide'
    },
    {
      icon: BookOpen,
      value: '50,000+',
      label: 'Notes Shared',
      description: 'Study materials uploaded'
    },
    {
      icon: MessageSquare,
      value: '100,000+',
      label: 'Connections Made',
      description: 'Student interactions facilitated'
    }
  ];

  return (
    <section className="py-20 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-lg font-medium text-gray-300 mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;