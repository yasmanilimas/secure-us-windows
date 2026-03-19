import { Phone, Mail, MapPin, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import logoPrimary from '@/assets/logo-primary.png';

const Footer = () => {
  const { t } = useLanguage();
  const phoneNumber = '+1 786 779 7140';

  const navItems = [
    { key: 'nav.home', href: '#home' },
    { key: 'nav.services', href: '#services' },
    { key: 'nav.benefits', href: '#benefits' },
    { key: 'nav.coverage', href: '#coverage' },
    { key: 'nav.contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img 
              src={logoPrimary} 
              alt="Powerful Impact Windows" 
              className="h-12 w-auto mb-6 brightness-0 invert"
            />
            <p className="text-background/80 mb-6 max-w-md">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3 text-background/90">
              <div className="p-2 bg-background/10 rounded-full">
                <MapPin className="w-5 h-5" />
              </div>
              <span>United States</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-anton text-lg mb-6">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {t(item.key)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-anton text-lg mb-6">{t('footer.contact')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-background/60 text-sm mb-1">{t('footer.owner')}</p>
                <p className="text-lg font-medium">Abelardo Soler</p>
              </div>
              <a 
                href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-background/90 hover:text-background transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>{phoneNumber}</span>
              </a>
              <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
                <Button className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  <Phone className="w-4 h-4" />
                  {t('footer.callUs')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm">
            © {new Date().getFullYear()} Powerful Impact Windows. {t('footer.rights')}
          </p>
          <Link 
            to="/auth" 
            className="flex items-center gap-2 text-background/40 hover:text-background/60 text-sm transition-colors"
          >
            <Lock className="w-4 h-4" />
            {t('footer.adminLogin')}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;