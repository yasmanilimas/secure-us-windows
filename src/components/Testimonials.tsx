import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, User } from 'lucide-react';

interface Testimonial {
  id: string;
  client_name: string;
  client_name_es: string;
  client_photo_url: string | null;
  testimonial: string;
  testimonial_es: string;
  rating: number;
  location: string | null;
}

const Testimonials = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTestimonials((data || []) as Testimonial[]);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-anton text-foreground mb-4">
            {language === 'en' ? 'What Our Customers Say' : 'Lo Que Dicen Nuestros Clientes'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Real testimonials from satisfied customers across the United States'
              : 'Testimonios reales de clientes satisfechos en todo Estados Unidos'
            }
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => {
            const safeRating = Math.max(0, Math.min(5, Math.floor(Number(testimonial.rating) || 0)));

            return (
              <Card key={testimonial.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  
                  <p className="text-foreground mb-6 leading-relaxed">
                    "{language === 'en' ? testimonial.testimonial : testimonial.testimonial_es}"
                  </p>

                  <div className="flex items-center gap-4">
                    {testimonial.client_photo_url ? (
                      <img
                        src={testimonial.client_photo_url}
                        alt={testimonial.client_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {language === 'en' ? testimonial.client_name : testimonial.client_name_es}
                      </h4>
                      {testimonial.location && (
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      )}
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: safeRating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
