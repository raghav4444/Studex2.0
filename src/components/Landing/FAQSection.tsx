import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Who can join CampusLink?',
      answer: 'CampusLink is exclusively for verified college and university students. You need a valid .edu or .ac.in email address to sign up and access the platform.'
    },
    {
      question: 'How does email verification work?',
      answer: 'After signing up with your college email, we send a verification link. Once verified, you get a verified badge and full access to all features. This ensures our community remains authentic and trustworthy.'
    },
    {
      question: 'Can I post anonymously?',
      answer: 'Yes! We understand that students sometimes need to ask sensitive questions. You can toggle anonymous mode for any post while still maintaining the trust of a verified student community.'
    },
    {
      question: 'Is CampusLink free to use?',
      answer: 'Yes, CampusLink is completely free for all students. Our mission is to make quality educational resources and networking accessible to every student.'
    },
    {
      question: 'How do I find mentors in my field?',
      answer: 'Use our mentorship section to browse seniors and graduate students in your field. You can filter by college, branch, and skills, then send mentorship requests directly through the platform.'
    },
    {
      question: 'What types of files can I upload?',
      answer: 'You can upload study notes, assignments, and resources in PDF, DOC, DOCX, and image formats. All uploads are scanned for safety and appropriateness.'
    },
    {
      question: 'How does the mock interview feature work?',
      answer: 'Our Skill Hub provides AI-powered mock interviews and peer-to-peer practice sessions. You can practice technical, behavioral, and industry-specific interviews with real-time feedback.'
    },
    {
      question: 'Can I create study groups?',
      answer: 'Absolutely! You can create public or private study groups for specific subjects, projects, or exam preparation. Invite classmates or let others discover and join your group.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-[#0d1117]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about CampusLink
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#161b22] rounded-xl border border-gray-800 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-[#1c2128] transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;