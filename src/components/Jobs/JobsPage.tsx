import React, { useState } from 'react';
import { Briefcase, MapPin, Clock, DollarSign, Users, Filter, Search, Plus, FileText, Download, Eye } from 'lucide-react';

const JobsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'resume'>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock job data
  const jobs = [
    {
      id: '1',
      title: 'Software Engineering Intern',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'internship',
      salary: '$25/hour',
      description: 'Join our engineering team to work on cutting-edge web applications.',
      requirements: ['React', 'JavaScript', 'Node.js'],
      applications: 45,
      deadline: '2024-02-15',
      postedAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Data Science Intern',
      company: 'DataFlow Inc',
      location: 'Remote',
      type: 'internship',
      salary: '$30/hour',
      description: 'Work with large datasets and machine learning models.',
      requirements: ['Python', 'SQL', 'Machine Learning'],
      applications: 32,
      deadline: '2024-02-20',
      postedAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      type: 'full-time',
      salary: '$80,000/year',
      description: 'Build beautiful and responsive user interfaces.',
      requirements: ['React', 'TypeScript', 'CSS'],
      applications: 28,
      deadline: '2024-02-25',
      postedAt: '2024-01-12'
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Jobs & Opportunities</h1>
          <p className="text-[#8b949e]">Discover internships and job opportunities from top companies</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-[#161b22] p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'jobs'
                ? 'bg-[#3b82f6] text-white'
                : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Job Board
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'resume'
                ? 'bg-[#3b82f6] text-white'
                : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Resume Builder
          </button>
        </div>

        {activeTab === 'jobs' ? (
          <div>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b949e]" />
                <input
                  type="text"
                  placeholder="Search jobs or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="internship">Internships</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
                <button className="px-4 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#3b82f6] transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-[#e6edf3]">{job.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.type === 'internship' ? 'bg-[#3b82f6]/20 text-[#3b82f6]' :
                          job.type === 'full-time' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {job.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[#8b949e] mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                      </div>

                      <p className="text-[#8b949e] mb-3">{job.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.requirements.map((req, index) => (
                          <span key={index} className="px-2 py-1 bg-[#0d1117] text-[#3b82f6] rounded text-sm">
                            {req}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[#8b949e]">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.applications} applications
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-6">
                      <button className="w-full md:w-auto px-6 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-[#8b949e] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#e6edf3] mb-2">No jobs found</h3>
                <p className="text-[#8b949e]">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8">
            <div className="text-center">
              <FileText className="w-16 h-16 text-[#3b82f6] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Resume Builder</h2>
              <p className="text-[#8b949e] mb-6">Create professional resumes with our easy-to-use builder</p>
              
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Plus className="w-6 h-6 text-[#3b82f6]" />
                  </div>
                  <h3 className="font-semibold mb-2">Create New Resume</h3>
                  <p className="text-[#8b949e] text-sm mb-4">Start from scratch with our guided builder</p>
                  <button className="w-full px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors">
                    Start Building
                  </button>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Eye className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Browse Templates</h3>
                  <p className="text-[#8b949e] text-sm mb-4">Choose from professional templates</p>
                  <button className="w-full px-4 py-2 bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-lg hover:bg-[#21262d] transition-colors">
                    View Templates
                  </button>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Download className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold mb-2">My Resumes</h3>
                  <p className="text-[#8b949e] text-sm mb-4">Access your saved resumes</p>
                  <button className="w-full px-4 py-2 bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-lg hover:bg-[#21262d] transition-colors">
                    View Saved
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;