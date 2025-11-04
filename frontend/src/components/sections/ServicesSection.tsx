import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  Smartphone, 
  ShoppingCart, 
  Zap, 
  Paintbrush, 
  Database,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Monitor,
      title: 'Web Development',
      description: 'Custom websites built with modern frameworks and best practices.',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Performance', 'Cross-browser Compatible'],
      color: 'primary'
    },
    {
      icon: Smartphone,
      title: 'Mobile Apps',
      description: 'Native and cross-platform mobile applications that engage users.',
      features: ['iOS & Android', 'React Native', 'Push Notifications', 'Offline Support'],
      color: 'accent'
    },
    {
      icon: ShoppingCart,
      title: 'E-Commerce',
      description: 'Complete online stores with secure payment processing.',
      features: ['Payment Integration', 'Inventory Management', 'Order Tracking', 'Analytics'],
      color: 'primary'
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Speed up your existing website for better user experience.',
      features: ['Core Web Vitals', 'Bundle Optimization', 'Image Compression', 'Caching Strategies'],
      color: 'accent'
    },
    {
      icon: Paintbrush,
      title: 'UI/UX Design',
      description: 'Beautiful, intuitive designs that users love to interact with.',
      features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
      color: 'primary'
    },
    {
      icon: Database,
      title: 'Backend Development',
      description: 'Robust server-side solutions and API development.',
      features: ['RESTful APIs', 'Database Design', 'Authentication', 'Cloud Deployment'],
      color: 'accent'
    }
  ];

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
            Our Services
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Complete Digital</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Solutions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From concept to deployment, we provide end-to-end development services 
            that help businesses thrive in the digital landscape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card 
              key={service.title} 
              className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 border-border/50 hover:border-primary/20"
            >
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 transition-all duration-300 ${
                    service.color === 'primary' 
                      ? 'bg-primary/10 group-hover:bg-primary/20' 
                      : 'bg-accent/10 group-hover:bg-accent/20'
                  }`}>
                    <service.icon className={`w-7 h-7 ${
                      service.color === 'primary' ? 'text-primary' : 'text-accent'
                    }`} />
                  </div>
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="space-y-3">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="inline-block p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-0">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Let's discuss how we can help bring your vision to life with our expertise and dedication.
              </p>
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
