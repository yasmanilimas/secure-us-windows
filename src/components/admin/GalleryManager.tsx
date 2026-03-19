import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/lib/image-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Upload, GripVertical, Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GalleryImage {
  id: string;
  after_image_url: string;
  category: 'windows' | 'doors' | 'full';
  display_order: number;
  is_active: boolean;
}

// Sortable Image Card Component
const SortableImageCard = ({ 
  image, 
  language, 
  categoryLabels, 
  handleToggleActive, 
  handleDelete,
  handleCategoryChange,
}: {
  image: GalleryImage;
  language: string;
  categoryLabels: Record<string, string>;
  handleToggleActive: (image: GalleryImage) => void;
  handleDelete: (id: string) => void;
  handleCategoryChange: (id: string, category: 'windows' | 'doors' | 'full') => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-card ${!image.is_active ? 'opacity-60' : ''}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded shrink-0"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Image Preview */}
          <div className="w-16 h-16 rounded overflow-hidden shrink-0">
            <img 
              src={image.after_image_url} 
              alt="" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Category */}
          <Select
            value={image.category}
            onValueChange={(value) => handleCategoryChange(image.id, value as 'windows' | 'doors' | 'full')}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="windows">{categoryLabels.windows}</SelectItem>
              <SelectItem value="doors">{categoryLabels.doors}</SelectItem>
              <SelectItem value="full">{categoryLabels.full}</SelectItem>
            </SelectContent>
          </Select>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Label htmlFor={`active-${image.id}`} className="text-sm text-muted-foreground">
                {language === 'en' ? 'Active' : 'Activo'}
              </Label>
              <Switch
                id={`active-${image.id}`}
                checked={image.is_active}
                onCheckedChange={() => handleToggleActive(image)}
              />
            </div>
            <Button variant="destructive" size="icon" onClick={() => handleDelete(image.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const GalleryManager = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'windows' | 'doors' | 'full'>('full');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryLabels = {
    windows: language === 'en' ? 'Windows' : 'Ventanas',
    doors: language === 'en' ? 'Doors' : 'Puertas',
    full: language === 'en' ? 'Full Project' : 'Proyecto',
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_projects')
        .select('id, after_image_url, category, display_order, is_active')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages((data || []) as GalleryImage[]);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Error',
        description: language === 'en' ? 'Could not load images' : 'No se pudieron cargar las imágenes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        handleUploadMultiple(imageFiles);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadMultiple(Array.from(files));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadMultiple = async (files: File[]) => {
    const total = files.length;
    setUploadProgress({ current: 0, total });
    setUploading(true);

    const maxOrder = Math.max(...images.map(img => img.display_order), 0);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total });

      try {
        const file = files[i];
        const compressedBlob = await compressImage(file, 1200, 1200, 0.8);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = `projects/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, compressedBlob, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        // Create a new gallery entry for each image
        const { error: insertError } = await supabase
          .from('gallery_projects')
          .insert({
            title: 'Project',
            title_es: 'Proyecto',
            category: selectedCategory,
            before_image_url: '',
            after_image_url: publicUrl,
            display_order: maxOrder + i + 1,
            is_active: true,
          });

        if (insertError) throw insertError;
        successCount++;
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    setUploading(false);
    setUploadProgress(null);

    if (successCount > 0) {
      toast({
        title: language === 'en' ? 'Upload complete' : 'Subida completada',
        description: language === 'en' 
          ? `${successCount} of ${total} images uploaded`
          : `${successCount} de ${total} imágenes subidas`,
      });
      fetchImages();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      
      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);

      try {
        const updates = newImages.map((image, index) => ({
          id: image.id,
          display_order: index + 1,
        }));

        for (const update of updates) {
          await supabase
            .from('gallery_projects')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast({
          title: language === 'en' ? 'Order updated' : 'Orden actualizado',
        });
      } catch (error) {
        console.error('Error updating order:', error);
        fetchImages();
      }
    }
  };

  const handleToggleActive = async (image: GalleryImage) => {
    try {
      const { error } = await supabase
        .from('gallery_projects')
        .update({ is_active: !image.is_active })
        .eq('id', image.id);

      if (error) throw error;

      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, is_active: !img.is_active } : img
      ));
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const handleCategoryChange = async (id: string, category: 'windows' | 'doors' | 'full') => {
    try {
      const { error } = await supabase
        .from('gallery_projects')
        .update({ category })
        .eq('id', id);

      if (error) throw error;

      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, category } : img
      ));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this image?' : '¿Eliminar esta imagen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('gallery_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setImages(prev => prev.filter(img => img.id !== id));
      toast({
        title: language === 'en' ? 'Image deleted' : 'Imagen eliminada',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'}
          ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-primary/50'}
        `}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {uploading && uploadProgress ? (
          <div className="space-y-3">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
            <p className="text-lg font-medium">
              {language === 'en' 
                ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
                : `Subiendo ${uploadProgress.current} de ${uploadProgress.total}...`
              }
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium mb-1">
              {language === 'en' 
                ? 'Drop images here or click to upload'
                : 'Arrastra imágenes aquí o haz clic para subir'
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Upload multiple images at once - each will be a separate gallery item'
                : 'Sube varias imágenes a la vez - cada una será un elemento separado'
              }
            </p>
          </>
        )}
      </div>

      {/* Category selector for new uploads */}
      <div className="flex items-center gap-3">
        <Label>{language === 'en' ? 'Category for new uploads:' : 'Categoría para nuevas fotos:'}</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as 'windows' | 'doors' | 'full')}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="windows">{categoryLabels.windows}</SelectItem>
            <SelectItem value="doors">{categoryLabels.doors}</SelectItem>
            <SelectItem value="full">{categoryLabels.full}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Images List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">
          {language === 'en' ? `Gallery (${images.length} images)` : `Galería (${images.length} imágenes)`}
        </h3>

        {images.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="py-12 text-center text-muted-foreground">
              {language === 'en' 
                ? 'No images yet. Upload some photos to get started.'
                : 'Sin imágenes aún. Sube algunas fotos para comenzar.'
              }
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {images.map((image) => (
                  <SortableImageCard
                    key={image.id}
                    image={image}
                    language={language}
                    categoryLabels={categoryLabels}
                    handleToggleActive={handleToggleActive}
                    handleDelete={handleDelete}
                    handleCategoryChange={handleCategoryChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default GalleryManager;