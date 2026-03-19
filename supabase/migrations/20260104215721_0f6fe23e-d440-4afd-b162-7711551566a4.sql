-- Create table for hero background images
CREATE TABLE public.hero_backgrounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_backgrounds ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active hero backgrounds"
ON public.hero_backgrounds
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage hero backgrounds"
ON public.hero_backgrounds
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));