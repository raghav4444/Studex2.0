import React, { useState } from 'react';
import { Users, Search, Filter } from 'lucide-react';
import MentorCard from './MentorCard';
import { Mentor } from '../../types';

const MentorshipPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const [mentors] = useState<Mentor[]>([
    {
      id: '1',
      userId: '1',
      name: 'Sarah Chen',
      college: 'MIT',
      branch: 'Computer Science',
      year: 4,
      skills: ['React', 'Node.js', 'Machine Learning', 'Data Structures'],
      bio: 'Senior CS student with internship experience at Google. Love helping juniors with coding and career guidance.',
      isAvailable: true,
      rating: 4.9,
      isVerified: true,
    },
    {
      id: '2',
      userId: '2',
      name: 'Alex Rodriguez',
      college: 'Caltech',
      branch: 'Physics',
      year: 4,
      skills: ['Quantum Mechanics', 'Research', 'LaTeX', 'MATLAB'],
      bio: 'Physics PhD candidate specializing in quantum computing. Happy to help with physics concepts and research methodology.',
      isAvailable: true,
      rating: 4.7,
      isVerified: true,
    },
    {
      id: '3',
      userId: '3',
      name: 'Emily Wang',
      college: 'Stanford',
      branch: 'Mechanical Engineering',
      year: 3,
      skills: ['CAD Design', 'Thermodynamics', 'Project Management', 'Internships'],
      bio: 'Mechanical engineering student with hands-on project experience. Can help with design thinking and industry preparation.',
      isAvailable: false,
      rating: 4.8,
      isVerified: true,
    },
  ]);

  const branches = ['all', 'Computer Science', 'Mechanical Engineering', 'Physics', 'Mathematics'];
  const years = ['all', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBranch = selectedBranch === 'all' || mentor.branch === selectedBranch;
    const matchesYear = selectedYear === 'all' || `${mentor.year}th Year` === selectedYear;
    
    return matchesSearch && matchesBranch && matchesYear;
  });

  const handleRequestMentorship = (mentorId: string) => {
    // Handle mentorship request
    console.log('Requesting mentorship from:', mentorId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Find a Mentor</h1>
        <p className="text-gray-400">Connect with seniors and experienced students in your field</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or skills..."
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none"
            >
              {branches.map(branch => (
                <option key={branch} value={branch}>
                  {branch === 'all' ? 'All Branches' : branch}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'All Years' : year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            onRequestMentorship={handleRequestMentorship}
          />
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No mentors found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default MentorshipPage;