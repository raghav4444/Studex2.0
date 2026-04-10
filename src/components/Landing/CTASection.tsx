import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-[#161b22] rounded-2xl p-12 border border-gray-800">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join the Community?
          </h2>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Connect with thousands of verified students, access quality study materials, 
            and accelerate your academic journey with CampusLink.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onGetStarted}
              className="flex items-center space-x-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 group"
            >
              <span className="font-medium">Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-sm text-gray-500">
              No credit card required • Instant verification
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;