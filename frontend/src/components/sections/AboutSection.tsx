import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Code, Palette, Smartphone, Globe, Database, Zap } from 'lucide-react';

const AboutSection = () => {
  const { t } = useTranslation();
  const skills = [
    { name: 'React', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Tailwind CSS', level: 98 },
    { name: 'Node.js', level: 85 },
    { name: 'UI/UX Design', level: 92 },
    { name: 'Performance', level: 88 }
  ];

  const technologies = [
    { icon: Code, name: 'Modern Frameworks', desc: 'React, TypeScript, Next.js' },
    { icon: Palette, name: 'Design Systems', desc: 'Tailwind, Styled Components' },
    { icon: Smartphone, name: 'Mobile First', desc: 'Responsive, Progressive Web Apps' },
    { icon: Globe, name: 'Web Standards', desc: 'Accessibility, SEO, Performance' },
    { icon: Database, name: 'Backend Integration', desc: 'APIs, Databases, Authentication' },
    { icon: Zap, name: 'Optimization', desc: 'Speed, Bundle Size, Core Web Vitals' }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
            {t('about.title')}
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('about.subtitle')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('about.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h3 className="text-2xl font-bold mb-6">Our Expertise</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              With years of experience in web development, we specialize in creating scalable, 
              maintainable, and performant applications. Our approach combines modern development 
              practices with user-centered design principles.
            </p>
            
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Why Choose Us?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Quality First</h4>
                  <p className="text-sm text-muted-foreground">Every line of code is written with maintainability and performance in mind.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Modern Stack</h4>
                  <p className="text-sm text-muted-foreground">We use the latest technologies and best practices in web development.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">User Experience</h4>
                  <p className="text-sm text-muted-foreground">Design that puts users first, ensuring intuitive and accessible interfaces.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Continuous Support</h4>
                  <p className="text-sm text-muted-foreground">Ongoing maintenance and updates to keep your site running perfectly.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technologies Grid */}
        <div>
          <h3 className="text-3xl font-bold text-center mb-12">Technologies We Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech) => (
              <Card key={tech.name} className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                      <tech.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold">{tech.name}</h4>
                  </div>
                  <p className="text-muted-foreground">{tech.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
