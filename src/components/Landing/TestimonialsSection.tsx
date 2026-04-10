import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      college: 'MIT',
      branch: 'Computer Science',
      year: '4th Year',
      content: 'CampusLink helped me find an amazing mentor who guided me through my internship applications. The notes library saved me countless hours during exam prep.',
      rating: 5,
      avatar: 'SC'
    },
    {
      name: 'Alex Rodriguez',
      college: 'Stanford University',
      branch: 'Mechanical Engineering',
      year: '3rd Year',
      content: 'The study groups feature is incredible. I connected with peers working on similar projects and we collaborated on our final year thesis.',
      rating: 5,
      avatar: 'AR'
    },
    {
      name: 'Priya Sharma',
      college: 'IIT Delhi',
      branch: 'Electrical Engineering',
      year: '2nd Year',
      content: 'Mock interviews on CampusLink boosted my confidence significantly. I landed my dream internship after practicing here for just two weeks.',
      rating: 5,
      avatar: 'PS'
    },
    {
      name: 'Michael Johnson',
      college: 'UC Berkeley',
      branch: 'Data Science',
      year: 'Graduate',
      content: 'As a graduate student, I love mentoring undergrads through CampusLink. The platform makes it easy to share knowledge and build meaningful connections.',
      rating: 5,
      avatar: 'MJ'
    },
    {
      name: 'Emma Wilson',
      college: 'Oxford University',
      branch: 'Physics',
      year: '4th Year',
      content: 'The anonymous posting feature allowed me to ask questions I was too shy to ask in class. The community is incredibly supportive and helpful.',
      rating: 5,
      avatar: 'EW'
    },
    {
      name: 'David Kim',
      college: 'Carnegie Mellon',
      branch: 'Computer Science',
      year: '3rd Year',
      content: 'CampusLink\'s notes library is a goldmine. I found comprehensive study materials that helped me ace my algorithms course.',
      rating: 5,
      avatar: 'DK'
    }
  ];

  return (
    <section className="py-20 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Loved by Students Worldwide
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See what students from top universities are saying about their CampusLink experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-[#161b22] rounded-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-500/30" />
                <p className="text-gray-300 leading-relaxed pl-6">
                  "{testimonial.content}"
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.college}</p>
                  <p className="text-sm text-gray-500">{testimonial.branch} • {testimonial.year}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;