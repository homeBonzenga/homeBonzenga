import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPolicy: React.FC = () => {
  const policies = [
    {
      id: 1,
      icon: User,
      title: "User Information",
      description:
        "We collect personal information such as name, email, and phone number only to provide and improve our services."
    },
    {
      id: 2,
      icon: Lock,
      title: "Data Security",
      description:
        "All user data is stored securely using industry-standard encryption. We never share your personal information with third parties without consent."
    },
    {
      id: 3,
      icon: Globe,
      title: "Cookies & Tracking",
      description:
        "We use cookies and similar technologies to enhance your experience on our website and app, track usage, and analyze performance."
    },
    {
      id: 4,
      icon: Shield,
      title: "Your Rights",
      description:
        "You have the right to access, update, or delete your personal data. You can also opt out of marketing communications at any time."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-[#4e342e] to-[#3b2c26] text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Learn how we collect, use, and protect your information when using our services.
          </p>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Our Commitment to Privacy
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto leading-relaxed">
              We value your privacy and are committed to protecting your personal information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {policies.map((policy) => (
              <Card
                key={policy.id}
                className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-[#fdf6f0] rounded-2xl"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <policy.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                    {policy.title}
                  </h3>
                  <p className="text-[#6d4c41] leading-relaxed">{policy.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#4e342e] text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-bold mb-4">
            Questions About Privacy?
          </h2>
          <p className="text-white/90 mb-6">
            Contact our support team if you need clarification regarding your personal data or privacy concerns.
          </p>
          <Button className="bg-white text-[#4e342e] hover:bg-white/90 px-6 py-3 rounded-xl font-semibold transition-all duration-300">
            Contact Support
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;

