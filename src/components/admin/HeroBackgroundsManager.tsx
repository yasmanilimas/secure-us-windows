import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeroBackground {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

function SortableItem({ item, onDelete, onToggleActive }: { 
  item: HeroBackground; 
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>
      
      <div className="w-32 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
        <img 
          src={item.image_url} 
          alt="Hero background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Activo</span>
        <Switch
          checked={item.is_active}
          onCheckedChange={(checked) => onToggleActive(item.id, checked)}
        />
      </div>
      
      <Button
        variant="destructive"
        size="icon"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function HeroBackgroundsManager() {
  const [backgrounds, setBackgrounds] = useState<HeroBackground[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const fetchBackgrounds = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_backgrounds')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBackgrounds(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const maxOrder = backgrounds.length > 0 
        ? Math.max(...backgrounds.map(b => b.display_order)) 
        : -1;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        const fileExt = file.name.split('.').pop();
        const fileName = `hero-${Date.now()}-${i}.${fileExt}`;
        const filePath = `hero-backgrounds/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase
          .from('hero_backgrounds')
          .insert({
            image_url: publicUrl,
            display_order: maxOrder + 1 + i,
            is_active: true,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: language === 'en' ? 'Success' : 'Éxito',
        description: language === 'en' 
          ? `${files.length} image(s) uploaded successfully`
          : `${files.length} imagen(es) subida(s) correctamente`,
      });

      fetchBackgrounds();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
      event.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hero_backgrounds')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBackgrounds(prev => prev.filter(b => b.id !== id));
      toast({
        title: language === 'en' ? 'Deleted' : 'Eliminado',
        description: language === 'en' ? 'Background removed' : 'Fondo eliminado',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_backgrounds')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setBackgrounds(prev => 
        prev.map(b => b.id === id ? { ...b, is_active: isActive } : b)
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = backgrounds.findIndex(b => b.id === active.id);
    const newIndex = backgrounds.findIndex(b => b.id === over.id);

    const newOrder = arrayMove(backgrounds, oldIndex, newIndex);
    setBackgrounds(newOrder);

    try {
      for (let i = 0; i < newOrder.length; i++) {
        await supabase
          .from('hero_backgrounds')
          .update({ display_order: i })
          .eq('id', newOrder[i].id);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      fetchBackgrounds();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {language === 'en' ? 'Hero Backgrounds' : 'Fondos del Inicio'}
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="hero-upload"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <label htmlFor="hero-upload">
            <Button asChild disabled={uploading}>
              <span className="cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadProgress && `${uploadProgress.current}/${uploadProgress.total}`}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Upload Images' : 'Subir Imágenes'}
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      </CardHeader>
      
      <CardContent>
        {backgrounds.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{language === 'en' ? 'No background images yet' : 'Aún no hay imágenes de fondo'}</p>
            <p className="text-sm mt-1">
              {language === 'en' 
                ? 'Upload images to show in the hero carousel'
                : 'Sube imágenes para mostrar en el carrusel de inicio'}
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={backgrounds.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {backgrounds.map(background => (
                  <SortableItem
                    key={background.id}
                    item={background}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
