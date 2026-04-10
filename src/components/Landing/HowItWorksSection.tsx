import React from "react";
import { UserPlus, Shield, Users, BookOpen } from "lucide-react";

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up with College Email",
      description:
        "Create your account using your verified .edu or .ac.in email address.",
      step: "01",
    },
    {
      icon: Shield,
      title: "Get Verified",
      description:
        "We verify your student status to ensure a trusted community.",
      step: "02",
    },
    {
      icon: Users,
      title: "Connect & Network",
      description:
        "Find peers, mentors, and study groups in your college and beyond.",
      step: "03",
    },
    {
      icon: BookOpen,
      title: "Share & Learn",
      description:
        "Upload notes, join discussions, and grow together as a community.",
      step: "04",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#161b22]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            How Studex Works
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Getting started is simple. Join thousands of students already using
            Studex to enhance their academic journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                <div className="relative z-10 bg-[#0d1117] rounded-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>

                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
