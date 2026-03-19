import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';

interface GalleryImage {
  id: string;
  image_url: string;
  category: 'windows' | 'doors' | 'full';
}

const MasonryGallery = ({ 
  images, 
  onImageClick 
}: { 
  images: GalleryImage[]; 
  onImageClick: (index: number) => void;
}) => {
  const [columns, setColumns] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(2);
      else if (width < 1024) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Distribute images across columns
  const columnArrays: GalleryImage[][] = Array.from({ length: columns }, () => []);
  images.forEach((image, index) => {
    columnArrays[index % columns].push(image);
  });

  return (
    <div ref={containerRef} className="flex gap-3 md:gap-4">
      {columnArrays.map((column, colIndex) => (
        <div key={colIndex} className="flex-1 flex flex-col gap-3 md:gap-4">
          {column.map((image) => {
            const originalIndex = images.findIndex(img => img.id === image.id);
            return (
              <div
                key={image.id}
                className="relative overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => onImageClick(originalIndex)}
              >
                <img
                  src={image.image_url}
                  alt=""
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const ImageModal = ({ 
  images, 
  currentIndex, 
  onClose, 
  onPrev, 
  onNext 
}: { 
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) => {
  const { language } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-8 h-8" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full hover:bg-black/50"
        aria-label="Previous"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white transition-colors bg-black/30 rounded-full hover:bg-black/50"
        aria-label="Next"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div 
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.image_url}
          alt=""
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

const ProjectsContent = () => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'windows' | 'doors' | 'full'>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_projects')
        .select('id, after_image_url, category')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const galleryImages: GalleryImage[] = (data || []).map(project => ({
        id: project.id,
        image_url: project.after_image_url,
        category: project.category as 'windows' | 'doors' | 'full',
      }));

      setImages(galleryImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.category === filter);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? filteredImages.length - 1 : selectedIndex - 1);
  }, [selectedIndex, filteredImages.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === filteredImages.length - 1 ? 0 : selectedIndex + 1);
  }, [selectedIndex, filteredImages.length]);

  const filterOptions = [
    { key: 'all', label: language === 'en' ? 'All' : 'Todos' },
    { key: 'windows', label: language === 'en' ? 'Windows' : 'Ventanas' },
    { key: 'doors', label: language === 'en' ? 'Doors' : 'Puertas' },
    { key: 'full', label: language === 'en' ? 'Full Projects' : 'Proyectos' },
  ];

  return (
    <>
      <SEOHead
        title={language === 'en' 
          ? 'Project Gallery | Powerful Impact Windows' 
          : 'Galería de Proyectos | Powerful Impact Windows'
        }
        description={language === 'en'
          ? 'View our completed hurricane protection projects. Photos of impact window and door installations.'
          : 'Vea nuestros proyectos completados de protección contra huracanes. Fotos de instalaciones.'
        }
      />
      
      <div className="min-h-screen bg-background">
        <header className="bg-primary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              {language === 'en' ? 'Back to Home' : 'Volver al Inicio'}
            </Link>
            <h1 className="text-4xl md:text-6xl font-anton text-primary-foreground mb-4">
              {language === 'en' ? 'GALLERY' : 'GALERÍA'}
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl">
              {language === 'en' 
                ? 'Explore our completed installations.'
                : 'Explora nuestras instalaciones completadas.'
              }
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {filterOptions.map((option) => (
              <Button
                key={option.key}
                variant={filter === option.key ? 'default' : 'outline'}
                onClick={() => setFilter(option.key as typeof filter)}
                size="sm"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                {language === 'en' ? 'No images found' : 'No se encontraron imágenes'}
              </p>
            </div>
          ) : (
            <MasonryGallery 
              images={filteredImages} 
              onImageClick={setSelectedIndex}
            />
          )}

          <div className="mt-16 text-center bg-muted rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-anton text-foreground mb-4">
              {language === 'en' 
                ? 'READY TO START YOUR PROJECT?' 
                : '¿LISTO PARA COMENZAR TU PROYECTO?'
              }
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              {language === 'en'
                ? 'Get a free estimate for your home or business.'
                : 'Obtén un estimado gratis para tu hogar o negocio.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/estimate">
                <Button size="lg" className="gap-2 px-8">
                  {language === 'en' ? 'Get Free Estimate' : 'Obtener Estimado Gratis'}
                </Button>
              </Link>
              <a href="tel:+17867797140">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  {language === 'en' ? 'Call Now' : 'Llamar Ahora'}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {selectedIndex !== null && (
        <ImageModal
          images={filteredImages}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </>
  );
};

const Projects = () => {
  return (
    <LanguageProvider>
      <ProjectsContent />
    </LanguageProvider>
  );
};

export default Projects;