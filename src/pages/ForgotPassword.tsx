import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, ShieldCheck, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { SEO } from '@/components/SEO';

const emailSchema = z.object({
  email: z.string().trim().email('Please enter a valid email').max(255),
});

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (resetError) {
      setError('Could not send the reset email. Please try again.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-10">
      <SEO title="Reset Password · Shop India" description="Request a secure password reset link for your Shop India account." path="/forgot-password" noIndex />
      <div className="fixed inset-0 bg-gradient-glow opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="glass rounded-2xl p-8 shadow-elevated">
          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span>Secure reset · 256-bit SSL encrypted</span>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-glow">
                <MailCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-3">Reset link sent</h1>
              <p className="text-sm text-muted-foreground mb-6">
                If an account exists for <span className="text-foreground font-medium break-all">{email}</span>,
                you'll receive a password reset link shortly. It expires in one hour.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Forgot password?</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your account email and we'll send you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                    <Input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                      aria-invalid={!!error}
                    />
                  </div>
                  {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                </Button>
              </form>

              <Link
                to="/auth"
                className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
