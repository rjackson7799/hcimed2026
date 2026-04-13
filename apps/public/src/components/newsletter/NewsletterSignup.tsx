import { useState } from 'react';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@hci/shared/ui/button';
import { cn } from '@hci/shared/lib/utils';

interface NewsletterSignupProps {
  variant: 'inline' | 'section' | 'compact';
}

export function NewsletterSignup({ variant }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else if (res.status === 409) {
        setStatus('success'); // Already subscribed is still a success from user's perspective
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <SuccessMessage variant={variant} />
    );
  }

  if (variant === 'compact') {
    return (
      <div className="mt-4">
        <p className="text-sm font-medium text-primary-foreground/80 mb-2">Newsletter</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="flex-1 min-w-0 rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary-foreground/40"
            aria-label="Email address for newsletter"
          />
          <Button
            type="submit"
            size="sm"
            disabled={status === 'loading'}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex-shrink-0"
          >
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
          </Button>
        </form>
        {status === 'error' && (
          <p className="text-xs text-red-300 mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className="bg-muted rounded-xl p-6 text-center">
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          Enjoyed this article?
        </h3>
        <p className="text-muted-foreground mb-4">
          Subscribe for more health insights from HCI Medical Group.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 min-w-0 rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            aria-label="Email address for newsletter"
          />
          <Button
            type="submit"
            disabled={status === 'loading'}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
          </Button>
        </form>
        {status === 'error' && (
          <p className="text-sm text-destructive mt-2">{errorMessage}</p>
        )}
      </div>
    );
  }

  // inline variant
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container max-w-2xl text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-secondary" />
          </div>
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Stay Informed About Your Health
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Monthly health tips, practice updates, and Medicare guidance — delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 min-w-0 rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
            aria-label="Email address for newsletter"
          />
          <Button
            type="submit"
            size="lg"
            disabled={status === 'loading'}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8"
          >
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
          </Button>
        </form>
        {status === 'error' && (
          <p className="text-sm text-destructive mt-3">{errorMessage}</p>
        )}
      </div>
    </section>
  );
}

function SuccessMessage({ variant }: { variant: string }) {
  if (variant === 'compact') {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/80">
        <CheckCircle className="h-4 w-4 text-green-400" />
        <span>You're subscribed!</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-2 text-center',
      variant === 'inline' ? 'py-16 md:py-24' : 'bg-muted rounded-xl p-6',
    )}>
      <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
      <p className="font-display text-xl font-semibold text-foreground">
        Thanks! You're subscribed.
      </p>
      <p className="text-muted-foreground">
        You'll receive our next newsletter in your inbox.
      </p>
    </div>
  );
}
