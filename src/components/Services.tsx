import { SquareStack, DoorOpen, Shield, Wrench } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: SquareStack,
      titleKey: 'services.windows.title',
      descKey: 'services.windows.desc',
    },
    {
      icon: DoorOpen,
      titleKey: 'services.doors.title',
      descKey: 'services.doors.desc',
    },
    {
      icon: Shield,
      titleKey: 'services.hurricane.title',
      descKey: 'services.hurricane.desc',
    },
    {
      icon: Wrench,
      titleKey: 'services.installation.title',
      descKey: 'services.installation.desc',
    },
  ];

  return (
    <section id="services" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-anton text-foreground mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-background p-8 rounded-lg border border-border hover:border-primary hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <service.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-xl font-anton text-foreground mb-3">
                {t(service.titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(service.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;