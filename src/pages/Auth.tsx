import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff,
  CheckCircle2, LockKeyhole, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { LovableLoginButton } from '@/components/auth/LovableLoginButton';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { SEO } from '@/components/SEO';

// Password policy: 8+ chars, upper, lower, number, special character
const strongPasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)');

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email').max(255),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  email: z.string().trim().email('Please enter a valid email').max(255),
  password: strongPasswordSchema,
  confirmPassword: z.string(),
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const passwordChecks = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

type Mode = 'login' | 'signup';

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signupSent, setSignupSent] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const strength = useMemo(() => {
    if (!password) return 0;
    return passwordChecks.filter((c) => c.test(password)).length;
  }, [password]);

  const strengthLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const schema = mode === 'login' ? loginSchema : signupSchema;
      const data = mode === 'login'
        ? { email, password }
        : { email, password, confirmPassword, fullName };

      const result = schema.safeParse(data);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      if (mode === 'login') {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Sign in failed',
            description: error.message === 'Invalid login credentials'
              ? 'Invalid email or password. Please try again.'
              : error.message,
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: "You've successfully signed in.",
          });
          navigate('/account');
        }
      } else {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Sign up failed',
            description: error.message.includes('already registered')
              ? 'This email is already registered. Please sign in instead.'
              : error.message,
          });
        } else {
          // With email confirmation enabled, signUp returns no session until
          // the user clicks the confirmation link — never treat as signed in.
          setSignupSent(true);
        }
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (signupSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <SEO title="Confirm your email · Shop India" description="Check your inbox to confirm your Shop India account." path="/auth" noIndex />
        <div className="relative w-full max-w-md glass rounded-2xl p-8 shadow-elevated text-center animate-fade-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-glow">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-3">Check your email</h1>
          <p className="text-muted-foreground text-sm mb-2">
            We sent a confirmation link to
          </p>
          <p className="text-sm font-medium text-foreground mb-6 break-all">{email}</p>
          <p className="text-xs text-muted-foreground mb-8">
            Click the link in the email to activate your account. The link expires in 24 hours.
          </p>
          <Button variant="outline" className="w-full" onClick={() => setSignupSent(false)}>
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-10">
      <SEO
        title="Sign In · Shop India"
        description="Sign in or create a secure account to manage orders, wishlist, and addresses on Shop India."
        path="/auth"
        noIndex
      />
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-glow opacity-40 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-glow">
              <span className="text-xl font-extrabold text-primary-foreground">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">SHOP India</h1>
              <p className="text-sm text-muted-foreground">Premium electronics marketplace</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-elevated">
          {/* Secure badge */}
          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-muted-foreground">
            <LockKeyhole className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span>Secure sign-in · 256-bit SSL encrypted</span>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted/50 mb-6" role="tablist" aria-label="Authentication mode">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setErrors({});
                }}
                className={`py-2 text-sm font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  mode === m
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                  <Input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    aria-invalid={!!errors.fullName}
                  />
                </div>
                {errors.fullName && <p className="text-xs text-destructive" role="alert">{errors.fullName}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive" role="alert">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                {mode === 'login' && (
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={loading}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive" role="alert">{errors.password}</p>}

              {/* Strength meter (signup only) */}
              {mode === 'signup' && password.length > 0 && (
                <div className="space-y-1.5" aria-live="polite">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength
                            ? strength >= 4 ? 'bg-primary' : strength >= 3 ? 'bg-amber-400' : 'bg-destructive'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Password strength: {strengthLabel}</p>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={loading}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {confirmPassword.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden>
                      {confirmPassword === password ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </span>
                  )}
                </div>
                {errors.confirmPassword
                  ? <p className="text-xs text-destructive" role="alert">{errors.confirmPassword}</p>
                  : confirmPassword.length > 0 && confirmPassword === password && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Passwords match
                    </p>
                  )}
              </div>
            )}

            {mode === 'signup' && (
              <ul className="space-y-1">
                {passwordChecks.map((c) => {
                  const ok = c.test(password);
                  return (
                    <li key={c.label} className={`text-[11px] flex items-center gap-1.5 transition-colors ${ok ? 'text-primary' : 'text-muted-foreground'}`}>
                      {ok ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <span className="h-3 w-3 rounded-full border border-muted-foreground/40 shrink-0" />}
                      {c.label}
                    </li>
                  );
                })}
              </ul>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Secure Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <GoogleLoginButton />
              <LovableLoginButton />
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setErrors({});
              }}
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {mode === 'login' ? 'Create one free' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Trust footer */}
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
            <span>Your data is encrypted and never shared with sellers</span>
          </div>
          <p className="text-[11px] text-muted-foreground/70">
            By continuing you agree to our{' '}
            <Link to="/shipping" className="underline hover:text-foreground">Terms &amp; Returns Policy</Link>
            {' '}and{' '}
            <Link to="/shipping" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
