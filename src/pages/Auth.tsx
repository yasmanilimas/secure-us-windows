import { useState, useEffect, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import logoPrimary from '@/assets/logo-primary.png';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp, user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      startTransition(() => {
        navigate(isAdmin ? '/admin' : '/', { replace: true });
      });
    }
  }, [user, isAdmin, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0]?.message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0]?.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);

        if (error) {
          let message = t('auth.error.generic');

          if (error.message.includes('Invalid login credentials')) {
            message = t('auth.error.invalidCredentials');
          } else if (error.message.includes('Email not confirmed')) {
            message = t('auth.error.emailNotConfirmed');
          }

          toast({
            title: t('auth.error.title'),
            description: message,
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: t('auth.success.loginTitle'),
          description: t('auth.success.loginDesc'),
        });
      } else {
        const { error } = await signUp(email, password, fullName);

        if (error) {
          let message = t('auth.error.generic');

          if (error.message.includes('User already registered')) {
            message = t('auth.error.alreadyRegistered');
          }

          toast({
            title: t('auth.error.title'),
            description: message,
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: t('auth.success.signupTitle'),
          description: t('auth.success.signupDesc'),
        });

        // Switch to login after successful signup
        setIsLogin(true);
        setPassword('');
      }
    } catch (error) {
      toast({
        title: t('auth.error.title'),
        description: t('auth.error.generic'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Back to home */}
      <a
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('auth.backHome')}</span>
      </a>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logoPrimary}
            alt="Powerful Impact Windows"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-anton text-foreground">
            {isLogin ? t('auth.loginTitle') : t('auth.signupTitle')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <div className="space-y-6">
            {/* Full Name (signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-medium">
                  {t('auth.fullName')}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder')}
                  className="h-14 text-lg"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">
                {t('auth.email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: undefined });
                }}
                placeholder={t('auth.emailPlaceholder')}
                className={`h-14 text-lg ${errors.email ? 'border-destructive' : ''}`}
                required
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">
                {t('auth.password')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: undefined });
                  }}
                  placeholder={t('auth.passwordPlaceholder')}
                  className={`h-14 text-lg pr-12 ${errors.password ? 'border-destructive' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  {t('auth.loginButton')}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {t('auth.signupButton')}
                </>
              )}
            </Button>
          </div>

          {/* Toggle login/signup */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? t('auth.signupLink') : t('auth.loginLink')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
