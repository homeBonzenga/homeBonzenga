import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Target, Award, Globe } from 'lucide-react';

const AboutUs: React.FC = () => {
  const milestones = [
    {
      id: 1,
      icon: Users,
      title: "Our Team",
      description: "A passionate team of certified beauticians and professionals committed to delivering top-notch beauty services."
    },
    {
      id: 2,
      icon: Target,
      title: "Our Mission",
      description: "To make premium beauty services accessible and convenient for everyone, anytime, anywhere."
    },
    {
      id: 3,
      icon: Award,
      title: "Our Achievements",
      description: "Over 10,000 satisfied customers, partnerships with top-rated salons, and numerous industry awards."
    },
    {
      id: 4,
      icon: Globe,
      title: "Our Vision",
      description: "Expanding our services nationwide while maintaining quality, safety, and customer satisfaction."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-[#4e342e] to-[#3b2c26] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6">
            About Us
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
            Learn more about our story, mission, and the team behind our beauty services.
          </p>
          <Button className="bg-white text-[#4e342e] hover:bg-white/90 px-6 py-3 rounded-xl font-semibold transition-all duration-300">
            Get Started
          </Button>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
            Our Story
          </h2>
          <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto leading-relaxed mb-8">
            Founded with a passion for beauty and convenience, our company connects customers with certified beauticians and top-rated salons. We aim to make premium beauty experiences accessible, safe, and enjoyable for everyone.
          </p>
        </div>
      </section>

      {/* Milestones / Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
            Our Values & Achievements
          </h2>
          <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto leading-relaxed">
            We are proud of our milestones and the values that guide our team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {milestones.map((milestone) => (
            <Card key={milestone.id} className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-[#fdf6f0] rounded-2xl">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <milestone.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                  {milestone.title}
                </h3>
                <p className="text-[#6d4c41] leading-relaxed">
                  {milestone.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#4e342e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">
            Join Us Today
          </h2>
          <p className="text-white/90 mb-6">
            Experience the best beauty services with our certified team, whether at home or in top-rated salons.
          </p>
          <Button className="bg-white text-[#4e342e] hover:bg-white/90 px-6 py-3 rounded-xl font-semibold transition-all duration-300">
            Book a Service
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

