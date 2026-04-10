import React, { useState } from "react";
import {
  BookOpen,
  Users,
  MessageSquare,
  User,
  Home,
  Calendar,
  Briefcase,
  Bell,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Memoize tabs to prevent re-renders
  const tabs = React.useMemo(
    () => [
      { id: "home", label: "Home", icon: Home },
      { id: "chat", label: "Chat", icon: MessageCircle },
      { id: "notes", label: "Notes", icon: BookOpen },
      { id: "events", label: "Events", icon: Calendar },
      { id: "study-groups", label: "Groups", icon: Users },
      { id: "mentorship", label: "Mentorship", icon: Users },
      { id: "jobs", label: "Jobs", icon: Briefcase },
      { id: "skills", label: "Skill Hub", icon: MessageSquare },
      { id: "profile", label: "Profile", icon: User },
    ],
    []
  );

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  return (
    <>
      <header className="bg-[#0d1117]/90 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3 relative z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Desktop Logo */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Studex</h1>
          </div>

          {/* Mobile - Empty left space */}
          <div className="lg:hidden w-8"></div>

          {/* Mobile - Centered Logo */}
          <div className="lg:hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Studex</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#161b22]/60 backdrop-blur-2xl rounded-xl p-2 border border-gray-700/50 shadow-2xl ring-1 ring-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 backdrop-blur-sm border border-transparent nav-button hover-stable ${
                    activeTab === tab.id
                      ? "bg-blue-500/20 text-white shadow-lg shadow-blue-500/20 backdrop-blur-xl border-blue-400/30 ring-1 ring-blue-300/20"
                      : "text-gray-400 hover:text-white hover:bg-[#161b22]/80 hover:backdrop-blur-xl hover:border-gray-600/30 hover:shadow-md hover:transform hover:scale-105"
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                  <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
                  
                  {/* Hover effect overlay */}
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 ${
                    activeTab !== tab.id ? 'hover:opacity-100' : ''
                  }`}></div>
                </button>
              );
            })}
          </nav>

          {/* Medium Desktop Navigation (md to lg) */}
          <nav className="hidden md:flex lg:hidden items-center space-x-1 bg-[#161b22]/60 backdrop-blur-2xl rounded-xl p-2 border border-gray-700/50 shadow-2xl ring-1 ring-white/5">
            {tabs.slice(0, 6).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 backdrop-blur-sm border border-transparent nav-button hover-stable ${
                    activeTab === tab.id
                      ? "bg-blue-500/20 text-white shadow-lg shadow-blue-500/20 backdrop-blur-xl border-blue-400/30 ring-1 ring-blue-300/20"
                      : "text-gray-400 hover:text-white hover:bg-[#161b22]/80 hover:backdrop-blur-xl hover:border-gray-600/30 hover:shadow-md hover:transform hover:scale-105"
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                  <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
                  
                  {/* Hover effect overlay */}
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 ${
                    activeTab !== tab.id ? 'hover:opacity-100' : ''
                  }`}></div>
                </button>
              );
            })}
            
            {/* More button for additional tabs */}
            <div className="relative group">
              <button className="relative px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 backdrop-blur-sm border border-transparent nav-button hover-stable text-gray-400 hover:text-white hover:bg-[#161b22]/80 hover:backdrop-blur-xl hover:border-gray-600/30 hover:shadow-md hover:transform hover:scale-105">
                <span className="text-sm font-medium">More</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown for additional tabs */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#161b22]/95 backdrop-blur-xl rounded-lg border border-gray-700/50 shadow-2xl ring-1 ring-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-2 space-y-1">
                  {tabs.slice(6).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 text-left ${
                          activeTab === tab.id
                            ? "bg-blue-500/15 text-white"
                            : "text-gray-400 hover:text-white hover:bg-[#161b22]/70"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-400 hover:text-white transition-all duration-300 hover:bg-[#161b22]/60 hover:backdrop-blur-xl p-2 rounded-lg border border-transparent hover:border-gray-600/30 hover:shadow-md hover:transform hover:scale-110 nav-button hover-stable"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#0d1117]/80 backdrop-blur-md z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-80 bg-[#0d1117]/95 backdrop-blur-3xl border-l border-gray-700/50 transform transition-all duration-500 ease-out z-50 shadow-2xl ring-1 ring-white/5 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(13, 17, 23, 0.98) 0%, rgba(22, 27, 34, 0.95) 100%)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between bg-[#161b22]/60 backdrop-blur-xl">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">Navigation</h2>
          </div>
          <button
            className="text-gray-400 hover:text-white transition-all duration-300 hover:bg-[#161b22]/80 hover:backdrop-blur-xl p-2 rounded-lg border border-transparent hover:border-gray-600/30 hover:transform hover:scale-110 nav-button hover-stable"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left backdrop-blur-xl border border-transparent nav-button hover-stable ${
                    activeTab === tab.id
                      ? "bg-blue-500/15 text-white border-blue-400/40 shadow-lg shadow-blue-500/10 ring-1 ring-blue-300/20"
                      : "text-gray-400 hover:text-white hover:bg-[#161b22]/70 hover:backdrop-blur-xl hover:border-gray-600/30 hover:shadow-md hover:transform hover:scale-[1.02]"
                  }`}
                  style={{
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  <Icon className="w-5 h-5 transition-all duration-300 hover:scale-110 hover:text-blue-400" />
                  <span className="font-medium transition-all duration-300">{tab.label}</span>
                  
                  {/* Hover effect indicator */}
                  <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-500 rounded-r-full transition-all duration-300 ${
                    activeTab === tab.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75 hover:opacity-100 hover:scale-100'
                  }`}></div>
                  
                  {/* Background hover effect */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 ${
                    activeTab !== tab.id ? 'hover:opacity-100' : ''
                  }`}></div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50 bg-[#161b22]/60 backdrop-blur-xl">
          <div className="text-center text-gray-300">
            <p className="font-semibold text-lg bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Studex
            </p>
            <p className="text-xs mt-1 text-gray-400">Connect • Learn • Grow</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
