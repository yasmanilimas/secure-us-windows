-- Create table for multiple project images
CREATE TABLE public.project_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.gallery_projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'after', -- 'before' or 'after'
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view images from active projects
CREATE POLICY "Anyone can view project images" 
ON public.project_images 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.gallery_projects 
    WHERE id = project_images.project_id AND is_active = true
  )
);

-- Admins can manage all images
CREATE POLICY "Admins can manage project images" 
ON public.project_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));