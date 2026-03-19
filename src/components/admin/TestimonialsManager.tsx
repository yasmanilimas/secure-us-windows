import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Upload, RefreshCw, Star, Quote, User } from 'lucide-react';

interface Testimonial {
  id: string;
  client_name: string;
  client_name_es: string;
  client_photo_url: string | null;
  testimonial: string;
  testimonial_es: string;
  rating: number;
  location: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

type TestimonialFormData = Omit<Testimonial, 'id' | 'created_at'>;

const defaultFormData: TestimonialFormData = {
  client_name: '',
  client_name_es: '',
  client_photo_url: null,
  testimonial: '',
  testimonial_es: '',
  rating: 5,
  location: '',
  display_order: 0,
  is_active: true,
};

const TestimonialsManager = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(defaultFormData);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTestimonials((data || []) as Testimonial[]);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Error',
        description: language === 'en' ? 'Could not load testimonials' : 'No se pudieron cargar los testimonios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `testimonial-${Date.now()}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, client_photo_url: publicUrl }));
      toast({
        title: language === 'en' ? 'Photo uploaded' : 'Foto subida',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: language === 'en' ? 'Upload failed' : 'Error al subir',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveTestimonial = async () => {
    if (!formData.client_name || !formData.testimonial || !formData.testimonial_es) {
      toast({
        title: language === 'en' ? 'Missing fields' : 'Campos faltantes',
        description: language === 'en' ? 'Please fill all required fields' : 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        client_name_es: formData.client_name_es || formData.client_name,
      };

      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(dataToSave)
          .eq('id', editingTestimonial.id);

        if (error) throw error;
        toast({ title: language === 'en' ? 'Testimonial updated' : 'Testimonio actualizado' });
      } else {
        const maxOrder = Math.max(...testimonials.map(t => t.display_order), 0);
        const { error } = await supabase
          .from('testimonials')
          .insert({ ...dataToSave, display_order: maxOrder + 1 });

        if (error) throw error;
        toast({ title: language === 'en' ? 'Testimonial added' : 'Testimonio agregado' });
      }

      setIsDialogOpen(false);
      setEditingTestimonial(null);
      setFormData(defaultFormData);
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Error',
        description: language === 'en' ? 'Could not save testimonial' : 'No se pudo guardar el testimonio',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this testimonial?' : '¿Eliminar este testimonio?')) return;

    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      toast({ title: language === 'en' ? 'Testimonial deleted' : 'Testimonio eliminado' });
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({ title: language === 'en' ? 'Error' : 'Error', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !testimonial.is_active })
        .eq('id', testimonial.id);

      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling testimonial:', error);
    }
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name,
      client_name_es: testimonial.client_name_es,
      client_photo_url: testimonial.client_photo_url,
      testimonial: testimonial.testimonial,
      testimonial_es: testimonial.testimonial_es,
      rating: testimonial.rating,
      location: testimonial.location || '',
      display_order: testimonial.display_order,
      is_active: testimonial.is_active,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingTestimonial(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-anton text-foreground">
            {language === 'en' ? 'Testimonials' : 'Testimonios'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Manage customer testimonials' : 'Administra los testimonios de clientes'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTestimonials} variant="outline" size="lg" className="gap-2">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={openNewDialog} size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'en' ? 'Add Testimonial' : 'Agregar Testimonio'}
          </Button>
        </div>
      </div>

      {/* List */}
      {testimonials.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Quote className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {language === 'en' ? 'No testimonials yet' : 'No hay testimonios aún'}
            </h3>
            <Button onClick={openNewDialog} className="gap-2 mt-4">
              <Plus className="w-4 h-4" />
              {language === 'en' ? 'Add Testimonial' : 'Agregar Testimonio'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={`bg-card ${!testimonial.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  {/* Photo */}
                  <div className="shrink-0">
                    {testimonial.client_photo_url ? (
                      <img
                        src={testimonial.client_photo_url}
                        alt={testimonial.client_name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {language === 'en' ? testimonial.client_name : testimonial.client_name_es}
                      </h3>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    {testimonial.location && (
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      "{language === 'en' ? testimonial.testimonial : testimonial.testimonial_es}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Switch
                      checked={testimonial.is_active}
                      onCheckedChange={() => handleToggleActive(testimonial)}
                    />
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(testimonial)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteTestimonial(testimonial.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-anton text-xl">
              {editingTestimonial 
                ? (language === 'en' ? 'Edit Testimonial' : 'Editar Testimonio')
                : (language === 'en' ? 'Add Testimonial' : 'Agregar Testimonio')
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Photo */}
            <div className="flex items-center gap-4">
              {formData.client_photo_url ? (
                <img src={formData.client_photo_url} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {language === 'en' ? 'Upload Photo' : 'Subir Foto'}
              </Button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUploadPhoto(e.target.files[0])}
              />
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Name (English)' : 'Nombre (Inglés)'}</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Name (Spanish)' : 'Nombre (Español)'}</Label>
                <Input
                  value={formData.client_name_es}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name_es: e.target.value }))}
                  placeholder="Juan García"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Location' : 'Ubicación'}</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Miami, FL"
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Rating' : 'Calificación'}</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Testimonial (English)' : 'Testimonio (Inglés)'}</Label>
              <Textarea
                value={formData.testimonial}
                onChange={(e) => setFormData(prev => ({ ...prev, testimonial: e.target.value }))}
                placeholder="Great service and quality windows..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Testimonial (Spanish)' : 'Testimonio (Español)'}</Label>
              <Textarea
                value={formData.testimonial_es}
                onChange={(e) => setFormData(prev => ({ ...prev, testimonial_es: e.target.value }))}
                placeholder="Excelente servicio y ventanas de calidad..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'Cancelar'}
            </Button>
            <Button onClick={handleSaveTestimonial}>
              {language === 'en' ? 'Save' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsManager;
