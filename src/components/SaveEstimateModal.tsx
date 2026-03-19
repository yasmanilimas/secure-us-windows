import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageCircle, Phone, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().trim().email().max(255);
const phoneSchema = z.string().trim().min(10).max(20).optional();

interface SaveEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateData: {
    products: any[];
    subtotal: number;
    taxes: number;
    total: number;
    windZone: string;
  };
}

const WHATSAPP_NUMBER = '17867797140';

const SaveEstimateModal = ({ isOpen, onClose, estimateData }: SaveEstimateModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; phone?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = t('estimate.error.invalidEmail');
    }
    
    if (phone && phone.length > 0) {
      const phoneResult = phoneSchema.safeParse(phone);
      if (!phoneResult.success) {
        newErrors.phone = t('estimate.error.invalidPhone');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      // First, create or find the lead
      let leadId: string | null = null;
      
      // Check if lead already exists
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();
      
      if (existingLead) {
        leadId = existingLead.id;
        // Update lead with new info if provided
        if (phone || fullName) {
          await supabase
            .from('leads')
            .update({
              ...(phone && { phone }),
              ...(fullName && { full_name: fullName }),
            })
            .eq('id', leadId);
        }
      } else {
        // Create new lead
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            email: email.trim(),
            phone: phone || null,
            full_name: fullName || null,
            source: 'Estimate Calculator',
            status: 'new',
          })
          .select('id')
          .single();
        
        if (leadError) throw leadError;
        leadId = newLead.id;
      }
      
      // Save the estimate
      const { error: estimateError } = await supabase
        .from('estimates')
        .insert({
          lead_id: leadId,
          products: estimateData.products,
          subtotal: estimateData.subtotal,
          taxes: estimateData.taxes,
          total: estimateData.total,
          wind_zone: estimateData.windZone,
        });
      
      if (estimateError) throw estimateError;
      
      setIsSaved(true);
      toast({
        title: t('estimate.success.title'),
        description: t('estimate.success.desc'),
      });
      
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast({
        title: t('estimate.error.title'),
        description: t('estimate.error.desc'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsApp = () => {
    const productSummary = estimateData.products
      .map((p: any) => `• ${p.quantity}x ${p.productKey} (${p.width}"x${p.height}")`)
      .join('\n');
    
    const message = encodeURIComponent(
      `Hi! I'm interested in a quote.\n\n` +
      `Products:\n${productSummary}\n\n` +
      `Estimated Total: $${estimateData.total.toLocaleString()}\n\n` +
      `Name: ${fullName || 'Not provided'}\n` +
      `Email: ${email || 'Not provided'}\n` +
      `Phone: ${phone || 'Not provided'}`
    );
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:+${WHATSAPP_NUMBER}`, '_self');
  };

  const handleClose = () => {
    setEmail('');
    setPhone('');
    setFullName('');
    setErrors({});
    setIsSaved(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-anton">
            {isSaved ? t('estimate.savedTitle') : t('estimate.saveTitle')}
          </DialogTitle>
        </DialogHeader>

        {isSaved ? (
          <div className="py-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              {t('estimate.savedMessage')}
            </p>
            <p className="text-muted-foreground mb-6">
              {t('estimate.savedSubtitle')}
            </p>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleWhatsApp}
                size="lg"
                className="w-full gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white h-14"
              >
                <MessageCircle className="w-5 h-5" />
                {t('estimate.sendWhatsApp')}
              </Button>
              <Button
                onClick={handleCall}
                size="lg"
                variant="outline"
                className="w-full gap-2 h-14"
              >
                <Phone className="w-5 h-5" />
                {t('estimate.callNow')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">
                {t('estimate.saveDesc')}
              </p>
              
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('estimate.fullName')}</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('estimate.fullNamePlaceholder')}
                  className="h-12"
                />
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('estimate.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
                  }}
                  placeholder={t('estimate.emailPlaceholder')}
                  className={`h-12 ${errors.email ? 'border-destructive' : ''}`}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t('estimate.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors({ ...errors, phone: undefined });
                  }}
                  placeholder={t('estimate.phonePlaceholder')}
                  className={`h-12 ${errors.phone ? 'border-destructive' : ''}`}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Estimate Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">{t('estimate.yourEstimate')}</p>
                <p className="text-2xl font-bold text-primary">
                  ${estimateData.total.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {estimateData.products.length} {t('estimate.products')}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={handleClose}
                size="lg"
                className="h-12"
              >
                {t('estimate.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !email}
                size="lg"
                className="gap-2 h-12"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {t('estimate.save')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SaveEstimateModal;
