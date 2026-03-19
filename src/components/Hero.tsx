import { useState, useEffect } from 'react';
import { Phone, Calculator, DoorOpen, Images, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { WindowButton } from '@/components/WindowButton';
import { supabase } from '@/integrations/supabase/client';
import abelardoPhoto from '@/assets/abelardo-soler.png';

const DEFAULT_BG = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop';

const Hero = () => {
  const { t } = useLanguage();
  const phoneNumber = '+1 786 779 7140';
  const [backgrounds, setBackgrounds] = useState<string[]>([DEFAULT_BG]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBackgrounds = async () => {
      const { data } = await supabase
        .from('hero_backgrounds')
        .select('image_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        setBackgrounds(data.map(b => b.image_url));
      }
    };

    fetchBackgrounds();
  }, []);

  useEffect(() => {
    if (backgrounds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % backgrounds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgrounds.length]);

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center pt-16 md:pt-20"
      aria-label="Hero section"
    >
      {/* Background Carousel */}
      {backgrounds.map((bg, index) => (
        <div 
          key={bg}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${bg}')` }}
          role="img"
          aria-label="Modern home with impact windows"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
          {/* Bottom fade gradient */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-anton text-primary-foreground leading-tight mb-6 animate-fade-in">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t('hero.subtitle')}
          </p>
          <nav className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }} aria-label="Primary actions">
            <WindowButton 
              href={`tel:${phoneNumber.replace(/\s/g, '')}`}
              variant="primary"
              icon={<Phone className="w-5 h-5" />}
              autoShine
              className="pulse-glow"
            >
              {t('hero.cta.call')}
            </WindowButton>
            
            <WindowButton 
              to="/projects"
              icon={<Images className="w-5 h-5" />}
            >
              {t('hero.cta.projects')}
            </WindowButton>
            
            <WindowButton
              to="/estimate"
              icon={<Calculator className="w-5 h-5" />}
            >
              {t('hero.cta.estimate')}
            </WindowButton>
            
            <WindowButton 
              to="/door-designs"
              icon={<DoorOpen className="w-5 h-5" />}
            >
              {t('hero.cta.doorDesigns')}
            </WindowButton>
          </nav>

          {/* Owner Quote */}
          <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="relative max-w-2xl backdrop-blur-sm bg-white/5 border border-white/20 rounded-lg p-6">
              <Quote className="absolute -top-3 -left-3 w-8 h-8 text-accent fill-accent/20" />
              <blockquote className="text-primary-foreground/90 italic text-base md:text-lg leading-relaxed mb-4">
                "{t('hero.ownerQuote')}"
              </blockquote>
              <footer className="flex items-center gap-3">
                <img 
                  src={abelardoPhoto} 
                  alt="Abelardo Soler" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-accent"
                />
                <div>
                  <cite className="not-italic font-semibold text-primary-foreground">
                    {t('hero.ownerName')}
                  </cite>
                  <p className="text-primary-foreground/70 text-sm">
                    {t('hero.ownerTitle')}
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>


      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <div className="w-8 h-12 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;