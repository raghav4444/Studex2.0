import React from "react";
import { Target, Heart, Lightbulb, Globe } from "lucide-react";

const AboutSection: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To create a trusted platform where students can connect, learn, and grow together in a verified academic community.",
    },
    {
      icon: Heart,
      title: "Student-First",
      description:
        "Every feature is designed with students in mind, focusing on real academic needs and challenges.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We continuously evolve our platform based on student feedback and emerging educational technologies.",
    },
    {
      icon: Globe,
      title: "Global Community",
      description:
        "Connecting students from universities worldwide while maintaining local college communities.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-[#161b22]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">About Studex</h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Founded by students, for students. Studex was born from the need
              for a trusted platform where college students could connect, share
              knowledge, and support each other's academic journey.
            </p>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              We believe that the best learning happens when students help
              students. Our platform ensures authenticity through email
              verification while providing tools for meaningful academic
              collaboration.
            </p>

            <div className="flex items-center space-x-8">
              <div>
                <h3 className="text-2xl font-bold text-white">2023</h3>
                <p className="text-sm text-gray-400">Founded</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">500+</h3>
                <p className="text-sm text-gray-400">Universities</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">10K+</h3>
                <p className="text-sm text-gray-400">Students</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-[#0d1117] rounded-xl p-6 border border-gray-800"
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
