import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add form submission logic here (e.g., Supabase insert or API call)
    console.log('Form submitted:', formData);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      info: 'support@beautyapp.com'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      info: '+1 234 567 890'
    },
    {
      icon: MapPin,
      title: 'Office Address',
      description: 'Visit us at our main office',
      info: '123 Beauty Street, City, Country'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      description: 'We are available during these hours',
      info: 'Mon-Fri: 9 AM - 6 PM'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf6f0]">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-[#4e342e] to-[#3b2c26] text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
            Have questions? We’re here to help. Reach out to us anytime!
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] mb-6">
            How to Reach Us
          </h2>
          <p className="text-xl text-[#6d4c41] max-w-3xl mx-auto leading-relaxed">
            Choose the best method to get in touch with our team
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-[#fdf6f0] rounded-2xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-[#4e342e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-4 text-[#4e342e]">
                    {method.title}
                  </h3>
                  <p className="text-[#6d4c41] leading-relaxed mb-2">
                    {method.description}
                  </p>
                  <p className="text-[#6d4c41]/70 font-semibold">{method.info}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-[#fdf6f0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#4e342e] text-center mb-8">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="bg-white border-0 rounded-xl py-4 px-6 shadow-sm focus:ring-2 focus:ring-[#4e342e]/50"
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-white border-0 rounded-xl py-4 px-6 shadow-sm focus:ring-2 focus:ring-[#4e342e]/50"
              required
            />
            <Textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              className="bg-white border-0 rounded-xl py-4 px-6 shadow-sm focus:ring-2 focus:ring-[#4e342e]/50 h-40 resize-none"
              required
            />
            <Button
              type="submit"
              className="bg-[#4e342e] hover:bg-[#3b2c26] text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 w-full"
            >
              Send Message
            </Button>
          </form>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#4e342e] text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-bold mb-4">
            Need Immediate Assistance?
          </h2>
          <p className="text-white/90 mb-6">
            Call our support team or use live chat for instant help.
          </p>
          <Button className="bg-white text-[#4e342e] hover:bg-white/90 px-6 py-3 rounded-xl font-semibold transition-all duration-300">
            Contact Support
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Contact;

