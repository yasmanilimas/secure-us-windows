import { useState } from 'react';
import { Phone, Menu, X, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import logoPrimary from '@/assets/logo-primary.png';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <img 
              src={logoPrimary} 
              alt="Powerful Impact Windows" 
              className="h-10 md:h-14 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {t(item.key)}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center rounded-full border border-border overflow-hidden">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1.5 text-sm transition-all ${language === 'en' ? 'bg-primary/15 scale-110' : 'opacity-50 hover:opacity-75'}`}
              >
                🇺🇸
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={() => setLanguage('es')}
                className={`px-2 py-1.5 text-sm transition-all ${language === 'es' ? 'bg-primary/15 scale-110' : 'opacity-50 hover:opacity-75'}`}
              >
                🇪🇸
              </button>
            </div>

            {/* Call Button */}
            <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="hidden md:block">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                <Phone className="w-4 h-4" />
                {t('header.callNow')}
              </Button>
            </a>

            {/* Login / Admin / Logout */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  {language === 'en' ? 'Logout' : 'Salir'}
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  {language === 'en' ? 'Login' : 'Entrar'}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => scrollToSection(item.href)}
                  className="text-left py-2 text-foreground/80 hover:text-primary transition-colors"
                >
                  {t(item.key)}
                </button>
              ))}
              <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="mt-2">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  <Phone className="w-4 h-4" />
                  {t('header.callNow')}
                </Button>
              </a>
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" className="w-full gap-2" onClick={() => { signOut(); setIsMenuOpen(false); }}>
                    <LogOut className="w-4 h-4" />
                    {language === 'en' ? 'Logout' : 'Salir'}
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    <LogIn className="w-4 h-4" />
                    {language === 'en' ? 'Login' : 'Entrar'}
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;