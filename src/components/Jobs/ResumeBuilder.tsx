import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Save, Plus, CreditCard as Edit, Trash2, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  template_data: any;
  preview_url: string;
  is_premium: boolean;
}

interface Resume {
  id: string;
  title: string;
  resume_data: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  template_id?: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa: string;
    achievements: string[];
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link: string;
    github: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link: string;
  }>;
}

const ResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'templates' | 'builder' | 'my-resumes'>('templates');
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  });

  useEffect(() => {
    fetchTemplates();
    fetchUserResumes();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('resume_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchUserResumes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const createNewResume = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    setCurrentResume(null);
    setActiveTab('builder');
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        fullName: user?.name || '',
        email: user?.email || '',
      },
    });
  };

  const editResume = (resume: Resume) => {
    setCurrentResume(resume);
    setResumeData(resume.resume_data);
    setActiveTab('builder');
  };

  const saveResume = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const resumeTitle = resumeData.personalInfo.fullName 
        ? `${resumeData.personalInfo.fullName}'s Resume`
        : 'My Resume';

      if (currentResume) {
        // Update existing resume
        const { error } = await supabase
          .from('resumes')
          .update({
            title: resumeTitle,
            resume_data: resumeData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentResume.id);

        if (error) throw error;
      } else {
        // Create new resume
        const { error } = await supabase
          .from('resumes')
          .insert({
            user_id: user.id,
            template_id: selectedTemplate?.id,
            title: resumeTitle,
            resume_data: resumeData,
          });

        if (error) throw error;
      }

      await fetchUserResumes();
      alert('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;
      await fetchUserResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExperience],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id),
    });
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      achievements: [],
    };
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEducation],
    });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id),
    });
  };

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      link: '',
      github: '',
    };
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, newProject],
    });
  };

  const updateProject = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    });
  };

  const removeProject = (id: string) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter(proj => proj.id !== id),
    });
  };

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Choose a Template</h2>
        <p className="text-gray-400">Select a professional template to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-[#161b22] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200">
            <div className="aspect-[3/4] bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
              <FileText className="w-16 h-16 text-gray-500" />
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{template.description}</p>
            
            {template.is_premium && (
              <span className="inline-block bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full mb-4">
                Premium
              </span>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => createNewResume(template)}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
              >
                Use Template
              </button>
              <button className="px-3 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-lg transition-all duration-200">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMyResumesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">My Resumes</h2>
          <p className="text-gray-400">Manage your saved resumes</p>
        </div>
        <button
          onClick={() => setActiveTab('templates')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Resume</span>
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No resumes yet</h3>
          <p className="text-gray-400 mb-4">Create your first resume to get started</p>
          <button
            onClick={() => setActiveTab('templates')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
          >
            Create Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-[#161b22] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200">
              <div className="aspect-[3/4] bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                <FileText className="w-16 h-16 text-gray-500" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{resume.title}</h3>
              <p className="text-gray-400 text-sm mb-4">
                Updated {new Date(resume.updated_at).toLocaleDateString()}
              </p>

              <div className="flex space-x-2">
                <button
                  onClick={() => editResume(resume)}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
                >
                  Edit
                </button>
                <button className="px-3 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-lg transition-all duration-200">
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteResume(resume.id)}
                  className="px-3 py-2 border border-red-700 hover:border-red-600 text-red-400 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBuilderTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Editor Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Resume Builder</h2>
          <div className="flex space-x-2">
            <button
              onClick={saveResume}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 rounded-lg transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2">
          {['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                activeSection === section
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, fullName: e.target.value }
                  })}
                  className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                  })}
                  className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                  })}
                  className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={resumeData.personalInfo.location}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                  })}
                  className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                  })}
                  className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="GitHub URL"
                  value={resumeData.personalInfo.github}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, github: e.target.value }
                  })}
                  className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeSection === 'summary' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Professional Summary</h3>
              <textarea
                placeholder="Write a brief summary of your professional background and career objectives..."
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                rows={6}
                className="w-full p-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
          )}

          {activeSection === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Work Experience</h3>
                <button
                  onClick={addExperience}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              {resumeData.experience.map((exp, index) => (
                <div key={exp.id} className="p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-white">Experience #{index + 1}</h4>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="w-full p-3 bg-[#161b22] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Position"
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      className="w-full p-3 bg-[#161b22] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      className="w-full p-3 bg-[#161b22] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label className="text-gray-300">Current Position</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="month"
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      className="w-full p-3 bg-[#161b22] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                    {!exp.current && (
                      <input
                        type="month"
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        className="w-full p-3 bg-[#161b22] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      />
                    )}
                  </div>

                  <textarea
                    placeholder="Describe your responsibilities and achievements..."
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-[#161b22] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add similar sections for education, skills, projects, certifications */}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
        <div className="aspect-[3/4] bg-white rounded-lg p-4 text-black text-sm overflow-hidden">
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <h1 className="text-xl font-bold">{resumeData.personalInfo.fullName || 'Your Name'}</h1>
              <p className="text-gray-600">{resumeData.personalInfo.email}</p>
              <p className="text-gray-600">{resumeData.personalInfo.phone} | {resumeData.personalInfo.location}</p>
            </div>

            {resumeData.summary && (
              <div>
                <h2 className="font-bold text-lg border-b mb-2">Summary</h2>
                <p className="text-sm">{resumeData.summary}</p>
              </div>
            )}

            {resumeData.experience.length > 0 && (
              <div>
                <h2 className="font-bold text-lg border-b mb-2">Experience</h2>
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{exp.position}</h3>
                        <p className="text-gray-600">{exp.company} | {exp.location}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </p>
                    </div>
                    <p className="text-sm mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Resume Builder</h1>
        <p className="text-gray-400">Create professional resumes that get you hired</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 mb-8 bg-[#161b22] p-1 rounded-lg border border-gray-800 w-fit mx-auto">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-3 rounded-md transition-all duration-200 ${
            activeTab === 'templates'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('my-resumes')}
          className={`px-6 py-3 rounded-md transition-all duration-200 ${
            activeTab === 'my-resumes'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          My Resumes
        </button>
        {(selectedTemplate || currentResume) && (
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-6 py-3 rounded-md transition-all duration-200 ${
              activeTab === 'builder'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Builder
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' && renderTemplatesTab()}
      {activeTab === 'my-resumes' && renderMyResumesTab()}
      {activeTab === 'builder' && renderBuilderTab()}
    </div>
  );
};

export default ResumeBuilder;