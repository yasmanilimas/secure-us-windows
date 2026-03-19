import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { LogOut, Users, FileText, LayoutDashboard, Home, Images, Quote, Settings, ImageIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import logoPrimary from '@/assets/logo-primary.png';
import LeadsList from '@/components/admin/LeadsList';
import Dashboard from '@/components/admin/Dashboard';
import EstimatesList from '@/components/admin/EstimatesList';
import GalleryManager from '@/components/admin/GalleryManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import PricingSettings from '@/components/admin/PricingSettings';
import HeroBackgroundsManager from '@/components/admin/HeroBackgroundsManager';

type AdminView = 'dashboard' | 'leads' | 'estimates' | 'gallery' | 'testimonials' | 'pricing' | 'hero';

const Admin = () => {
  const { user, signOut } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { id: 'dashboard' as AdminView, icon: LayoutDashboard, label: 'admin.dashboard', disabled: false },
    { id: 'leads' as AdminView, icon: Users, label: 'admin.leads', disabled: false },
    { id: 'estimates' as AdminView, icon: FileText, label: 'admin.estimates', disabled: false },
    { id: 'gallery' as AdminView, icon: Images, label: language === 'en' ? 'Gallery' : 'Galería', isCustomLabel: true, disabled: false },
    { id: 'hero' as AdminView, icon: ImageIcon, label: language === 'en' ? 'Hero' : 'Inicio', isCustomLabel: true, disabled: false },
    { id: 'testimonials' as AdminView, icon: Quote, label: language === 'en' ? 'Testimonials' : 'Testimonios', isCustomLabel: true, disabled: false },
    { id: 'pricing' as AdminView, icon: Settings, label: language === 'en' ? 'Pricing' : 'Precios', isCustomLabel: true, disabled: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="shrink-0">
              <img 
                src={logoPrimary} 
                alt="Powerful Impact Windows" 
                className="h-10 w-auto"
              />
            </Link>
            <div className="hidden sm:block">
              <h1 className="font-anton text-xl text-foreground">{t('admin.title')}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="lg" className="gap-2 h-12">
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">{t('admin.home')}</span>
              </Button>
            </Link>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              size="lg"
              className="gap-2 h-12"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">{t('admin.logout')}</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setCurrentView(item.id)}
                disabled={item.disabled}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  currentView === item.id
                    ? 'border-primary text-primary'
                    : item.disabled
                    ? 'border-transparent text-muted-foreground/50 cursor-not-allowed'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {(item as any).isCustomLabel ? item.label : t(item.label)}
                {item.disabled && (
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {t('admin.soon')}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {currentView === 'leads' && <LeadsList />}
        
        {currentView === 'dashboard' && <Dashboard />}

        {currentView === 'estimates' && <EstimatesList />}

        {currentView === 'gallery' && <GalleryManager />}

        {currentView === 'hero' && <HeroBackgroundsManager />}

        {currentView === 'testimonials' && <TestimonialsManager />}

        {currentView === 'pricing' && <PricingSettings />}
      </main>
    </div>
  );
};

export default Admin;
