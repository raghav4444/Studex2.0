import React from "react";
import { BookOpen, Shield, Users, ArrowRight, Play } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Studex</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-white transition-colors"
            >
              How it Works
            </a>
            <a
              href="#about"
              className="text-gray-300 hover:text-white transition-colors"
            >
              About
            </a>
            <a
              href="#faq"
              className="text-gray-300 hover:text-white transition-colors"
            >
              FAQ
            </a>
          </div>

          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center space-x-1 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300 font-medium">
                    Verified Students Only
                  </span>
                </div>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                The Student-Only
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {" "}
                  Network
                </span>
              </h1>

              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Verified. Trusted. Built for students to connect, learn & grow
                together. Share notes, find mentors, and build your network with
                confidence.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <button
                  onClick={onGetStarted}
                  className="flex items-center space-x-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 group"
                >
                  <span className="font-medium">Join with College Email</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="flex items-center space-x-2 px-6 py-4 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>10,000+ Students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>500+ Colleges</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>50,000+ Notes Shared</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-[#161b22] rounded-2xl p-8 border border-gray-800">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-white">
                    Studex Dashboard
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Sarah Chen</p>
                      <p className="text-sm text-gray-400">
                        MIT • Computer Science
                      </p>
                    </div>
                    <div className="ml-auto text-green-400 text-sm">
                      Verified
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Alex Rodriguez</p>
                      <p className="text-sm text-gray-400">Caltech • Physics</p>
                    </div>
                    <div className="ml-auto text-blue-400 text-sm">Mentor</div>
                  </div>

                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-blue-300 text-sm">
                      "Just shared my Data Structures notes - hope this helps
                      with your upcoming exam!"
                    </p>
                  </div>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>
    </section>
  );
};

export default HeroSection;
