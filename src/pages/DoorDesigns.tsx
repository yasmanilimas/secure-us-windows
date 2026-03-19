import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import DoorDesignSVG from '@/components/DoorDesignSVG';

// Frame color options
const frameColors = [
  { key: 'bronze', color: '#6B5344', name: 'Bronze' },
  { key: 'white', color: '#F5F5F5', name: 'White' },
  { key: 'black', color: '#1a1a1a', name: 'Black' },
  { key: 'silver', color: '#A8A8A8', name: 'Silver' },
  { key: 'dark_walnut', color: '#5C4033', name: 'Dark Walnut' },
];

// True Division designs
const trueDivisionDesigns = [
  { id: 'MG-1/2', name: 'MG-1/2', description: 'Half glass, half panel' },
  { id: 'MG-1/2-SB', name: 'MG-1/2-SB', description: 'Half glass, solid bottom' },
  { id: 'MG-1/2-SB-C', name: 'MG-1/2-SB-C', description: 'Half glass, solid bottom, colonial' },
  { id: 'MG-1/3', name: 'MG-1/3', description: 'One-third glass top' },
  { id: 'MG-1/3-SB', name: 'MG-1/3-SB', description: 'One-third glass, solid bottom' },
  { id: 'MG-1/4', name: 'MG-1/4', description: 'One-quarter glass top' },
  { id: 'MG-1/3-U', name: 'MG-1/3-U', description: 'One-third uneven division' },
  { id: 'MG-1/3-U-SB', name: 'MG-1/3-U-SB', description: 'One-third uneven, solid bottom' },
  { id: 'MG-1/3-U-SB-C', name: 'MG-1/3-U-SB-C', description: 'One-third uneven, solid bottom, colonial' },
  { id: 'MG-2/3-U', name: 'MG-2/3-U', description: 'Two-thirds uneven division' },
  { id: 'MG-2/3-U-SB', name: 'MG-2/3-U-SB', description: 'Two-thirds uneven, solid bottom' },
  { id: 'MG-2/3-U-SB-C', name: 'MG-2/3-U-SB-C', description: 'Two-thirds uneven, solid bottom, colonial' },
];

// Decorative designs
const decorativeDesigns = [
  { id: 'MGD-01', name: 'MGD-01', description: 'Circle accent' },
  { id: 'MGD-02', name: 'MGD-02', description: 'Circle with cross' },
  { id: 'MGD-03', name: 'MGD-03', description: 'Flowing curves' },
  { id: 'MGD-04', name: 'MGD-04', description: 'Elegant curves' },
  { id: 'MGD-05', name: 'MGD-05', description: 'Diamond curves' },
  { id: 'MGD-06', name: 'MGD-06', description: 'Leaf pattern' },
  { id: 'MGD-07', name: 'MGD-07', description: 'Horizontal bars' },
  { id: 'MGD-08', name: 'MGD-08', description: 'Circle with bars' },
  { id: 'MGD-09', name: 'MGD-09', description: 'Wave curves' },
  { id: 'MGD-10', name: 'MGD-10', description: 'Interlocking ovals' },
  { id: 'MGD-11', name: 'MGD-11', description: 'Double ovals' },
  { id: 'MGD-12', name: 'MGD-12', description: 'Vertical bars' },
  { id: 'MGD-13', name: 'MGD-13', description: 'Five bars' },
  { id: 'MGD-14', name: 'MGD-14', description: 'Classic bars' },
  { id: 'MGD-15', name: 'MGD-15', description: 'Diamond pattern' },
  { id: 'MGD-16', name: 'MGD-16', description: 'Wave bars' },
  { id: 'MGD-17', name: 'MGD-17', description: 'Four bars' },
  { id: 'MGD-18', name: 'MGD-18', description: 'Triple vertical' },
  { id: 'MGD-19', name: 'MGD-19', description: 'Crescent' },
  { id: 'MGD-20', name: 'MGD-20', description: 'Half moon' },
  { id: 'MGD-21', name: 'MGD-21', description: 'Double crescent' },
  { id: 'MGD-22', name: 'MGD-22', description: 'Sleek vertical' },
  { id: 'MGD-23', name: 'MGD-23', description: 'Modern vertical' },
  { id: 'MGD-24', name: 'MGD-24', description: 'Contemporary vertical' },
];

const DoorDesignsContent = () => {
  const { t } = useLanguage();
  const phoneNumber = '+1 786 779 7140';
  const [selectedColor, setSelectedColor] = useState('bronze');
  const [showDouble, setShowDouble] = useState(true);

  const currentFrameColor = frameColors.find(c => c.key === selectedColor)?.color || '#6B5344';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-anton">Diseños de Puertas / Door Designs</h1>
              <p className="text-sm text-primary-foreground/80 hidden sm:block">MG-3000 Series Impact Resistant Doors</p>
            </div>
          </div>
          <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
            <Button variant="secondary" className="gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{t('hero.cta.call')}</span>
            </Button>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-anton text-foreground mb-4">
            MG-3000 / MG-3500 / MG-4000 Series
          </h2>
          <p className="text-lg text-muted-foreground">
            Impact Resistant Doors - Florida Product Approval: FL #26942.1 LMI
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Hurricane Protection</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">No Shutter Necessary</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Energy Efficient</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">UV + Noise Reduction</span>
          </div>
        </div>

        {/* Color and Configuration Controls */}
        <div className="bg-card border border-border rounded-xl p-6 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Frame Color Selector */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Frame Color / Color del Marco
              </h3>
              <div className="flex gap-3">
                {frameColors.map((color) => (
                  <button
                    key={color.key}
                    onClick={() => setSelectedColor(color.key)}
                    className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                      selectedColor === color.key 
                        ? 'border-primary ring-2 ring-primary ring-offset-2' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                  >
                    {selectedColor === color.key && (
                      <Check className={`w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                        color.key === 'white' ? 'text-gray-800' : 'text-white'
                      }`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Double/Single Toggle */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Configuration / Configuración
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDouble(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !showDouble 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Single / Sencilla
                </button>
                <button
                  onClick={() => setShowDouble(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showDouble 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Double / Doble
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* True Division Designs */}
        <section className="mb-16">
          <div className="mb-8">
            <h3 className="text-2xl md:text-3xl font-anton text-foreground mb-2">True Division</h3>
            <p className="text-muted-foreground">
              SB: Solid Bottom | U: Uneven | C: Colonial
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trueDivisionDesigns.map((design) => (
              <div 
                key={design.id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow group"
              >
                <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-lg p-4 mb-4 flex items-center justify-center min-h-[200px]">
                  <DoorDesignSVG 
                    design={design.id} 
                    frameColor={currentFrameColor}
                    isDouble={showDouble}
                  />
                </div>
                <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {design.name}
                </h4>
                <p className="text-sm text-muted-foreground">{design.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Decorative Designs */}
        <section className="mb-16">
          <div className="mb-8">
            <h3 className="text-2xl md:text-3xl font-anton text-foreground mb-2">Door Decorations</h3>
            <p className="text-muted-foreground">
              *Custom decorations are available / *Decoraciones personalizadas disponibles
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decorativeDesigns.map((design) => (
              <div 
                key={design.id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow group"
              >
                <div className="bg-gradient-to-br from-sky-100 to-sky-200 rounded-lg p-4 mb-4 flex items-center justify-center min-h-[200px]">
                  <DoorDesignSVG 
                    design={design.id} 
                    frameColor={currentFrameColor}
                    isDouble={showDouble}
                  />
                </div>
                <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {design.name}
                </h4>
                <p className="text-sm text-muted-foreground">{design.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-primary/5 border border-primary/20 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            ¿Interesado en algún diseño? / Interested in a design?
          </h3>
          <p className="text-muted-foreground mb-6">
            Custom decorations are available. Contact us for a free quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
              <Button size="lg" className="gap-2">
                <Phone className="w-5 h-5" />
                {t('hero.cta.call')}
              </Button>
            </a>
            <Link to="/estimate">
              <Button size="lg" variant="outline">
                Get Estimate
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            CAD drawings available at WWW.MRGLASSWINDOWS.COM
          </p>
          <p className="text-sm mt-2">
            8051 NW 79th Pl, Medley, FL 33166 • 305.764.3963 • sales@mrglasswindows.com
          </p>
        </div>
      </footer>
    </div>
  );
};

const DoorDesigns = () => {
  return (
    <LanguageProvider>
      <DoorDesignsContent />
    </LanguageProvider>
  );
};

export default DoorDesigns;
