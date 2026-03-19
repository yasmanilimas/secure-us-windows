import { MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const Coverage = () => {
  const { t } = useLanguage();
  const phoneNumber = '+1 786 779 7140';

  return (
    <section id="coverage" className="py-20 md:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-anton mb-4">
            {t('coverage.title')}
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-6 flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5" />
            {t('coverage.subtitle')}
          </p>
          <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
            {t('coverage.desc')}
          </p>
          <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <Phone className="w-5 h-5" />
              {t('coverage.cta')}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Coverage;
