import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PricingSettings {
  id: string;
  margin_percentage: number;
  base_price_per_sqft: number;
  screen_cost_per_sqft: number;
  minimum_price: number;
}

const DEFAULT_SETTINGS: PricingSettings = {
  id: '',
  margin_percentage: 50,
  base_price_per_sqft: 30,
  screen_cost_per_sqft: 0.50,
  minimum_price: 200,
};

export const usePricingSettings = () => {
  return useQuery({
    queryKey: ['pricing-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching pricing settings:', error);
        return DEFAULT_SETTINGS;
      }
      
      return data || DEFAULT_SETTINGS;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Apply margin to a price (internal cost -> customer price)
export const applyMargin = (cost: number, marginPercentage: number): number => {
  return Math.round(cost * (1 + marginPercentage / 100) * 100) / 100;
};
