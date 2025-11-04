import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Shield,
  CreditCard,
  User
} from 'lucide-react';

const HelpCenter: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqCategories = [
    {
      id: 1,
      title: "Getting Started",
      icon: BookOpen,
      faqs: [
        {
          id: 1,
          question: "How do I create an account?",
          answer: "Click the 'Sign Up' button on our homepage, fill in your details, and verify your email address. It's that simple!"
        },
        {
          id: 2,
          question: "How do I book a service?",
          answer: "Browse our services, select your preferred time and date, choose a beautician, and complete the booking process."
        },
        {
          id: 3,
          question: "What services do you offer?",
          answer: "We offer hair styling, makeup, nail care, facials, and spa services both at-home and at partner salons."
        }
      ]
    },
    {
      id: 2,
      title: "Account & Profile",
      icon: User,
      faqs: [
        {
          id: 4,
          question: "How do I update my profile?",
          answer: "Go to your dashboard, click on 'Profile', and update your information. Don't forget to save your changes!"
        },
        {
          id: 5,
          question: "Can I change my email address?",
          answer: "Yes, you can update your email address in your profile settings. You'll need to verify the new email address."
        },
        {
          id: 6,
          question: "How do I delete my account?",
          answer: "Contact our support team to request account deletion. We'll process your request within 48 hours."
        }
      ]
    },
    {
      id: 3,
      title: "Payments & Billing",
      icon: CreditCard,
      faqs: [
        {
          id: 7,
          question: "What payment methods do you accept?",
          answer: "We accept credit cards, debit cards, mobile money, and bank transfers."
        },
        {
          id: 8,
          question: "How do I get a refund?",
          answer: "Refunds are processed within 5-7 business days. Contact support if you haven't received your refund."
        },
        {
          id: 9,
          question: "Are there any hidden fees?",
          answer: "No hidden fees! The price you see is the price you pay. Service fees are clearly displayed before booking."
        }
      ]
    },
    {
      id: 4,
      title: "Safety & Security",
      icon: Shield,
      faqs: [
        {
          id: 10,
          question: "How do you verify beauticians?",
          answer: "All beauticians undergo background checks, skill verification, and reference checks before joining our platform."
        },
        {
          id: 11,
          question: "Is my personal information safe?",
          answer: "Yes, we use industry-standard encryption and never share your personal information with third parties."
        },
        {
          id: 12,
          question: "What if I have a safety concern?",
          answer: "Contact us immediately. We take all safety concerns seriously and will investigate promptly."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      available: "Available 24/7"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      action: "Call Now",
      available: "Mon-Fri, 8AM-6PM"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      action: "Send Email",
      available: "Response within 24 hours"
    }
  ];

  const toggleFaq = (faqId: number) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-[#4e342e] to-[#3b2c26] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Find answers to your questions or get in touch with our support team
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6d4c41] w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:bg-white/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto">
              Choose the best way to reach us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-[#fdf6f0] rounded-2xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                    {method.title}
                  </h3>
                  <p className="text-[#6d4c41] leading-relaxed mb-4">
                    {method.description}
                  </p>
                  <p className="text-sm text-[#6d4c41]/70 mb-6">
                    {method.available}
                  </p>
                  <Button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 w-full">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-20 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto">
              Find quick answers to common questions
            </p>
          </div>

          <div className="space-y-12">
            {faqCategories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-[#4e342e] rounded-xl flex items-center justify-center mr-4">
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#4e342e]">
                    {category.title}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {category.faqs.map((faq) => (
                    <Card key={faq.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-white rounded-2xl">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-[#fdf6f0] transition-colors duration-200"
                        >
                          <span className="text-lg font-semibold text-[#4e342e] pr-4">
                            {faq.question}
                          </span>
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="w-5 h-5 text-[#4e342e] flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#4e342e] flex-shrink-0" />
                          )}
                        </button>
                        
                        {expandedFaq === faq.id && (
                          <div className="px-6 pb-6">
                            <div className="border-t border-[#f8d7da] pt-4">
                              <p className="text-[#6d4c41] leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-[#4e342e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">
            Still Need Help?
          </h2>
          <p className="text-white/90 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#4e342e] hover:bg-white/90 px-6 py-3 rounded-xl font-semibold transition-all duration-300">
              Contact Support
            </Button>
            <Button className="border-2 border-white text-white hover:bg-white hover:text-[#4e342e] px-6 py-3 rounded-xl font-semibold transition-all duration-300">
              Browse All Articles
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
