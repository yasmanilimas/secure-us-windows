import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const emailSchema = z.string().trim().email().max(255);

interface LeadCaptureProps {
  source?: string;
  variant?: 'hero' | 'section';
}

const LeadCapture = ({ source = 'Website', variant = 'section' }: LeadCaptureProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setError(t('lead.error.invalidEmail'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: dbError } = await supabase
        .from('leads')
        .insert({
          email: validation.data,
          source,
          status: 'new',
        });

      if (dbError) {
        // Check if it's a duplicate email error
        if (dbError.code === '23505') {
          setError(t('lead.error.duplicate'));
        } else {
          throw dbError;
        }
        return;
      }

      setIsSuccess(true);
      setEmail('');
      
      toast({
        title: t('lead.success.title'),
        description: t('lead.success.desc'),
      });

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting lead:', err);
      setError(t('lead.error.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder={t('lead.emailPlaceholder')}
              className="pl-12 h-14 text-base bg-background/90 border-0"
              disabled={isSubmitting || isSuccess}
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || isSuccess}
            size="lg"
            className="h-14 px-8 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-foreground" />
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-5 h-5" />
                {t('lead.sent')}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {t('lead.submit')}
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-300 mt-2">{error}</p>
        )}
        {isSuccess && (
          <p className="text-sm text-green-300 mt-2">{t('lead.success.message')}</p>
        )}
      </form>
    );
  }

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-anton text-primary-foreground mb-4">
            {t('lead.title')}
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            {t('lead.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder={t('lead.emailPlaceholder')}
                  className="pl-12 h-14 text-base bg-background border-0"
                  disabled={isSubmitting || isSuccess}
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || isSuccess}
                size="lg"
                className="h-14 px-8 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-foreground" />
                ) : isSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('lead.sent')}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t('lead.submit')}
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-300 mt-3">{error}</p>
            )}
            {isSuccess && (
              <p className="text-sm text-green-300 mt-3">{t('lead.success.message')}</p>
            )}
            <p className="text-xs text-primary-foreground/60 mt-4">
              {t('lead.privacy')}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LeadCapture;
