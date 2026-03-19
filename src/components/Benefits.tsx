import { Award, Star, MapPin, ShieldCheck, Users, Clock, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import abelardoPhoto from '@/assets/abelardo-soler.png';

const Benefits = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Award,
      titleKey: 'benefits.experience.title',
      descKey: 'benefits.experience.desc',
    },
    {
      icon: Star,
      titleKey: 'benefits.quality.title',
      descKey: 'benefits.quality.desc',
    },
    {
      icon: MapPin,
      titleKey: 'benefits.nationwide.title',
      descKey: 'benefits.nationwide.desc',
    },
    {
      icon: ShieldCheck,
      titleKey: 'benefits.warranty.title',
      descKey: 'benefits.warranty.desc',
    },
    {
      icon: Users,
      titleKey: 'benefits.certified.title',
      descKey: 'benefits.certified.desc',
    },
    {
      icon: Clock,
      titleKey: 'benefits.support.title',
      descKey: 'benefits.support.desc',
    },
  ];

  return (
    <section id="benefits" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-anton text-foreground mb-4">
            {t('benefits.title')}
          </h2>
          <div className="relative max-w-2xl mx-auto bg-secondary/50 border border-border rounded-lg p-6 mt-2">
            <Quote className="absolute -top-3 -left-3 w-7 h-7 text-accent fill-accent/20" />
            <p className="text-base md:text-lg text-muted-foreground italic leading-relaxed mb-4">
              "{t('benefits.subtitle')}"
            </p>
            <footer className="flex items-center gap-3">
              <img 
                src={abelardoPhoto} 
                alt="Abelardo Soler" 
                className="w-12 h-12 rounded-full object-cover border-2 border-accent"
              />
              <div>
                <cite className="not-italic font-semibold text-foreground text-sm">{t('hero.ownerName')}</cite>
                <p className="text-muted-foreground text-xs">{t('hero.ownerTitle')}</p>
              </div>
            </footer>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex gap-5 p-6 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="flex-shrink-0 w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center">
                <benefit.icon className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-anton text-foreground mb-2">
                  {t(benefit.titleKey)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(benefit.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;