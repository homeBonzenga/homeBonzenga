import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react';

const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      category: "General",
      question: "What is Home Bonzenga?",
      answer: "Home Bonzenga is a platform that connects customers with professional beauty service providers. We offer both at-home services and salon visits, making beauty services more accessible and convenient."
    },
    {
      id: 2,
      category: "General",
      question: "How do I get started?",
      answer: "Simply create an account, browse our services, select your preferred beautician, and book your appointment. It's that easy!"
    },
    {
      id: 3,
      category: "Booking",
      question: "How far in advance can I book?",
      answer: "You can book services up to 30 days in advance. For same-day bookings, availability depends on our beauticians' schedules."
    },
    {
      id: 4,
      category: "Booking",
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time without any charges."
    },
    {
      id: 5,
      category: "Payment",
      question: "What payment methods do you accept?",
      answer: "We accept credit cards, debit cards, mobile money (Airtel Money, Orange Money), and bank transfers."
    },
    {
      id: 6,
      category: "Payment",
      question: "When do I pay for my service?",
      answer: "Payment is processed when you book your appointment. This ensures your slot is secured and the beautician is confirmed."
    },
    {
      id: 7,
      category: "Safety",
      question: "How do you ensure the safety of beauticians?",
      answer: "All our beauticians undergo thorough background checks, skill verification, and reference checks. They are also insured and bonded."
    },
    {
      id: 8,
      category: "Safety",
      question: "What if I'm not satisfied with the service?",
      answer: "We have a satisfaction guarantee. If you're not happy with the service, contact us within 24 hours and we'll work to resolve the issue."
    },
    {
      id: 9,
      category: "Services",
      question: "What services do you offer?",
      answer: "We offer hair styling, makeup, nail care, facials, spa treatments, and more. Services are available both at-home and at partner salons."
    },
    {
      id: 10,
      category: "Services",
      question: "Do you provide beauty products?",
      answer: "Yes, our beauticians bring professional-grade products. You can also purchase products through our platform for home use."
    },
    {
      id: 11,
      category: "Account",
      question: "How do I update my profile information?",
      answer: "Go to your dashboard, click on 'Profile', and update your information. Don't forget to save your changes!"
    },
    {
      id: 12,
      category: "Account",
      question: "Can I delete my account?",
      answer: "Yes, you can delete your account by contacting our support team. We'll process your request within 48 hours."
    }
  ];

  const categories = ["All", "General", "Booking", "Payment", "Safety", "Services", "Account"];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Find answers to the most common questions about our services
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6d4c41] w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:bg-white/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-[#fdf6f0] rounded-2xl">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/50 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-[#4e342e] bg-white/50 px-3 py-1 rounded-full mr-3">
                          {faq.category}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-[#4e342e] pr-4">
                        {faq.question}
                      </span>
                    </div>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-[#4e342e] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#4e342e] flex-shrink-0" />
                    )}
                  </button>
                  
                  {expandedFaq === faq.id && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-white/30 pt-4">
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
      </section>

      {/* Still Need Help */}
      <section className="py-20 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto mb-12">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                    Live Chat
                  </h3>
                  <p className="text-[#6d4c41] leading-relaxed mb-6">
                    Get instant help from our support team
                  </p>
                  <button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 w-full">
                    Start Chat
                  </button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                    Phone Support
                  </h3>
                  <p className="text-[#6d4c41] leading-relaxed mb-6">
                    Speak directly with our support team
                  </p>
                  <button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 w-full">
                    Call Now
                  </button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                    Email Support
                  </h3>
                  <p className="text-[#6d4c41] leading-relaxed mb-6">
                    Send us a detailed message
                  </p>
                  <button className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 w-full">
                    Send Email
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
