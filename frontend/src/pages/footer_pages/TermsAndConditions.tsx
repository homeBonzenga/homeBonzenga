import React from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  FileText, 
  Users, 
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    {
      id: 1,
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: "By accessing and using Home Bonzenga services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      id: 2,
      title: "Service Description",
      icon: Users,
      content: "Home Bonzenga provides a platform connecting customers with beauty service providers. We facilitate bookings for at-home beauty services and salon visits. We are not directly providing the beauty services but connecting you with verified professionals."
    },
    {
      id: 3,
      title: "User Responsibilities",
      icon: Shield,
      content: "Users are responsible for providing accurate information, maintaining account security, and using the service in accordance with applicable laws. Any misuse of the platform may result in account suspension or termination."
    },
    {
      id: 4,
      title: "Payment Terms",
      icon: CreditCard,
      content: "Payments are processed securely through our platform. All transactions are final unless there is a service issue that qualifies for a refund under our refund policy. Service providers receive payment after successful service completion."
    },
    {
      id: 5,
      title: "Cancellation Policy",
      icon: AlertCircle,
      content: "Cancellations must be made at least 24 hours in advance to avoid cancellation fees. Same-day cancellations may incur a fee. Emergency cancellations are handled on a case-by-case basis."
    },
    {
      id: 6,
      title: "Privacy and Data",
      icon: FileText,
      content: "We collect and process personal data in accordance with our Privacy Policy. Your information is used to provide services, improve user experience, and communicate with you about your bookings and our services."
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
              Terms & Conditions
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Please read these terms and conditions carefully before using our services
            </p>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[#6d4c41] text-lg">
              <strong>Last Updated:</strong> January 31, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-20 bg-[#fdf6f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sections.map((section) => (
              <Card key={section.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#4e342e] rounded-xl flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#4e342e] mb-4">
                        {section.title}
                      </h3>
                      <p className="text-[#6d4c41] leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Terms */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#4e342e] mb-6">
                Limitation of Liability
              </h2>
              <p className="text-[#6d4c41] leading-relaxed mb-6">
                Home Bonzenga acts as an intermediary between customers and service providers. 
                We are not liable for the quality of services provided by third-party professionals. 
                Any disputes regarding service quality should be resolved directly with the service provider.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#4e342e] mb-6">
                Changes to Terms
              </h2>
              <p className="text-[#6d4c41] leading-relaxed mb-6">
                We reserve the right to modify these terms at any time. Users will be notified 
                of significant changes via email or through the platform. Continued use of the 
                service after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-[#4e342e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">
            Questions About Our Terms?
          </h2>
          <p className="text-white/90 mb-6">
            If you have any questions about these terms and conditions, please contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:legal@homebonzenga.com" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#4e342e] rounded-xl font-semibold hover:bg-white/90 transition-all duration-300"
            >
              Contact Legal Team
            </a>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-[#4e342e] transition-all duration-300"
            >
              General Contact
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;
