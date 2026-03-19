import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Percent, DollarSign, Ruler } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PricingSettingsData {
  id: string;
  margin_percentage: number;
  base_price_per_sqft: number;
  screen_cost_per_sqft: number;
  minimum_price: number;
}

const PricingSettings = () => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  
  const [marginPercentage, setMarginPercentage] = useState(50);
  const [basePricePerSqFt, setBasePricePerSqFt] = useState(30);
  const [screenCostPerSqFt, setScreenCostPerSqFt] = useState(0.50);
  const [minimumPrice, setMinimumPrice] = useState(200);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['pricing-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as PricingSettingsData | null;
    },
  });

  useEffect(() => {
    if (settings) {
      setMarginPercentage(settings.margin_percentage);
      setBasePricePerSqFt(settings.base_price_per_sqft);
      setScreenCostPerSqFt(settings.screen_cost_per_sqft);
      setMinimumPrice(settings.minimum_price);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<PricingSettingsData>) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('pricing_settings')
          .update(data)
          .eq('id', settings.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-settings'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-settings-admin'] });
      toast.success(language === 'en' ? 'Settings saved successfully' : 'Configuración guardada exitosamente');
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast.error(language === 'en' ? 'Error saving settings' : 'Error al guardar la configuración');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      margin_percentage: marginPercentage,
      base_price_per_sqft: basePricePerSqFt,
      screen_cost_per_sqft: screenCostPerSqFt,
      minimum_price: minimumPrice,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {language === 'en' ? 'Pricing Configuration' : 'Configuración de Precios'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Configure your profit margin. This setting is private and only visible to admins.'
            : 'Configura tu margen de ganancia. Esta configuración es privada y solo visible para administradores.'}
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            {language === 'en' ? 'Profit Margin (Markup)' : 'Margen de Ganancia (Markup)'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'This percentage is added to the base cost. Not visible to customers.'
              : 'Este porcentaje se agrega al costo base. No visible para clientes.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="margin">{language === 'en' ? 'Margin Percentage' : 'Porcentaje de Margen'}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="margin"
                  type="number"
                  min={0}
                  max={200}
                  step={1}
                  value={marginPercentage}
                  onChange={(e) => setMarginPercentage(parseFloat(e.target.value) || 0)}
                  className="text-lg font-semibold"
                />
                <span className="text-lg font-semibold">%</span>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                {language === 'en' ? 'Example:' : 'Ejemplo:'}
              </p>
              <p className="text-lg font-bold text-primary">
                $100 → ${(100 * (1 + marginPercentage / 100)).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en' 
                  ? 'Cost price → Customer price'
                  : 'Precio costo → Precio cliente'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          size="lg"
          className="gap-2"
        >
          <Save className="w-5 h-5" />
          {updateMutation.isPending 
            ? (language === 'en' ? 'Saving...' : 'Guardando...')
            : (language === 'en' ? 'Save Changes' : 'Guardar Cambios')}
        </Button>
      </div>
    </div>
  );
};

export default PricingSettings;
