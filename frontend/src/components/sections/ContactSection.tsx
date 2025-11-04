import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Globe
} from 'lucide-react';

const ContactSection = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success(t('contact.form.success'));
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t('contact.info.email.title'),
      content: t('contact.info.email.content'),
      description: t('contact.info.email.description')
    },
    {
      icon: Phone,
      title: t('contact.info.phone.title'),
      content: t('contact.info.phone.content'),
      description: t('contact.info.phone.description')
    },
    {
      icon: MapPin,
      title: t('contact.info.address.title'),
      content: t('contact.info.address.content'),
      description: t('contact.info.address.description')
    },
    {
      icon: Clock,
      title: t('contact.info.hours.title'),
      content: t('contact.info.hours.content'),
      description: t('contact.info.hours.description')
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
            {t('contact.title')}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">{t('contact.title')}</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <MessageSquare className="w-6 h-6 mr-3 text-primary" />
                {t('contact.form.send')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-foreground block mb-2">
                      {t('contact.form.name')}
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.name')}
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-foreground block mb-2">
                      {t('contact.form.email')}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.email')}
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="text-sm font-medium text-foreground block mb-2">
                    {t('contact.form.subject')}
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.subject')}
                    required
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="text-sm font-medium text-foreground block mb-2">
                    {t('contact.form.message')}
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.message')}
                    required
                    rows={6}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      {t('contact.form.sending')}
                    </>
                  ) : (
                    <>
                      {t('contact.form.send')}
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We're here to help and answer any question you might have. 
                We look forward to hearing from you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info) => (
                <Card key={info.title} className="border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{info.title}</h4>
                        <p className="text-foreground font-medium mb-1">{info.content}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-2" />
                  Why Choose Us?
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">100+</div>
                    <div className="text-sm text-muted-foreground">Projects</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent mb-1">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">99%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
