-- Make before_image_url nullable to allow "finished only" projects
ALTER TABLE public.gallery_projects ALTER COLUMN before_image_url DROP NOT NULL;

-- Set a default empty string for before_image_url
ALTER TABLE public.gallery_projects ALTER COLUMN before_image_url SET DEFAULT '';