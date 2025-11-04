import React from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Briefcase, 
  MapPin, 
  Clock,
  Heart,
  Award,
  TrendingUp,
  Globe
} from 'lucide-react';

const Careers: React.FC = () => {
  const { t } = useTranslation();

  const jobOpenings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Kinshasa, DR Congo",
      type: "Full-time",
      description: "We're looking for an experienced React/TypeScript developer to join our team."
    },
    {
      id: 2,
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Create beautiful and intuitive user experiences for our beauty platform."
    },
    {
      id: 3,
      title: "Customer Success Manager",
      department: "Operations",
      location: "Kinshasa, DR Congo",
      type: "Full-time",
      description: "Help our customers succeed and grow with our platform."
    },
    {
      id: 4,
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Kinshasa, DR Congo",
      type: "Part-time",
      description: "Drive growth through creative marketing campaigns and partnerships."
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance and wellness programs"
    },
    {
      icon: Award,
      title: "Professional Development",
      description: "Learning opportunities and career growth support"
    },
    {
      icon: TrendingUp,
      title: "Growth Opportunities",
      description: "Clear career paths and advancement opportunities"
    },
    {
      icon: Globe,
      title: "Flexible Work",
      description: "Remote work options and flexible schedules"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-[#4e342e] to-[#3b2c26] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Be part of the revolution in beauty services. We're building the future of beauty technology in Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Why Work With Us?
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto">
              We're passionate about creating meaningful impact in the beauty industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-[#fdf6f0] rounded-2xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                    {benefit.title}
                  </h3>
                  <p className="text-[#6d4c41] leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="py-20 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Current Openings
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto">
              Explore exciting career opportunities with us
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {jobOpenings.map((job) => (
              <Card key={job.id} className="hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#4e342e] mb-2">
                        {job.title}
                      </h3>
                      <p className="text-[#6d4c41] font-medium">{job.department}</p>
                    </div>
                    <span className="bg-[#4e342e] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {job.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-[#6d4c41] mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  
                  <p className="text-[#6d4c41] leading-relaxed mb-6">
                    {job.description}
                  </p>
                  
                  <Button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
                Our Culture
              </h2>
              <p className="text-lg text-[#6d4c41] leading-relaxed mb-8">
                At Home Bonzenga, we believe in creating an inclusive, innovative, and supportive work environment. 
                We value diversity, creativity, and the unique perspectives each team member brings.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-[#4e342e] mr-3" />
                  <span className="text-[#6d4c41]">Collaborative and inclusive team environment</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-6 h-6 text-[#4e342e] mr-3" />
                  <span className="text-[#6d4c41]">Opportunities for professional growth</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-[#4e342e] mr-3" />
                  <span className="text-[#6d4c41]">Flexible work arrangements</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-[#4e342e] to-[#3b2c26] rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-serif font-bold mb-4">
                  Ready to Join Us?
                </h3>
                <p className="text-white/90 leading-relaxed mb-6">
                  Don't see a position that fits? We're always looking for talented individuals 
                  who share our vision. Send us your resume and let's start a conversation.
                </p>
                <Button className="bg-white text-[#4e342e] hover:bg-white/90 px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                  Send Resume
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;
