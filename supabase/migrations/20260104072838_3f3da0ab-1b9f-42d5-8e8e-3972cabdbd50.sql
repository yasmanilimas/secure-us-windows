-- Create pricing_settings table for admin-configurable pricing
CREATE TABLE public.pricing_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    margin_percentage numeric NOT NULL DEFAULT 50,
    base_price_per_sqft numeric NOT NULL DEFAULT 30,
    screen_cost_per_sqft numeric NOT NULL DEFAULT 0.50,
    minimum_price numeric NOT NULL DEFAULT 200,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view pricing settings
CREATE POLICY "Admins can view pricing settings"
ON public.pricing_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only admins can update pricing settings
CREATE POLICY "Admins can update pricing settings"
ON public.pricing_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert pricing settings
CREATE POLICY "Admins can insert pricing settings"
ON public.pricing_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Anyone can read for calculator (public read policy)
CREATE POLICY "Public can read pricing for calculator"
ON public.pricing_settings
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_pricing_settings_updated_at
BEFORE UPDATE ON public.pricing_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing settings
INSERT INTO public.pricing_settings (margin_percentage, base_price_per_sqft, screen_cost_per_sqft, minimum_price)
VALUES (50, 30, 0.50, 200);