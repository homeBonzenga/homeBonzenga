import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const HeroSection = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-700" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Built with Modern Technology</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Crafting Digital
            </span>
            <br />
            <span className="text-foreground">Experiences</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            We create beautiful, functional, and responsive websites that work seamlessly across all devices and platforms. Every component is crafted with precision.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            onClick={() => scrollToSection('#services')}
            className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300"
          >
            Explore Services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => scrollToSection('#about')}
            className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 transform hover:scale-105 transition-all duration-300"
          >
            Learn More
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground text-center">Optimized for speed and performance across all devices</p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
            <p className="text-muted-foreground text-center">Built with security best practices and modern standards</p>
          </div>
          
          <div className="flex flex-col items-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fully Responsive</h3>
            <p className="text-muted-foreground text-center">Perfect experience on desktop, tablet, and mobile</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
