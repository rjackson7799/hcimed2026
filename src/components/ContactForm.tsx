import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Honeypot spam check - if this hidden field is filled, it's a bot
    const honeypot = formData.get('website');
    if (honeypot) {
      // Silently reject spam but show success to not alert bots
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
      setIsSubmitting(false);
      return;
    }

    const data = {
      name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      email: formData.get('email'),
      phone: formData.get('phone') || '',
      message: `Subject: ${formData.get('subject')}\n\n${formData.get('message')}`,
    };

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again or call us at (626) 792-4185.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot field - hidden from humans, bots will fill it */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">
          Website
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Input
            id="firstName"
            name="firstName"
            required
            placeholder="John"
            autoComplete="given-name"
            className="text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Input
            id="lastName"
            name="lastName"
            required
            placeholder="Doe"
            autoComplete="family-name"
            className="text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            required
            placeholder="john@example.com"
            autoComplete="email"
            className="text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="(626) 555-1234"
            autoComplete="tel"
            className="text-base"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">
          Subject <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </Label>
        <Input
          id="subject"
          name="subject"
          required
          placeholder="Appointment Request"
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Tell us how we can help you..."
          rows={5}
          className="text-base"
        />
      </div>

      {/* Privacy Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Privacy Notice</p>
            <p>Please do not include personal health information (PHI), medical records, or sensitive health details in this form. For medical inquiries, please call our office directly at <a href="tel:626-792-4185" className="font-medium underline hover:no-underline">626-792-4185</a>.</p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground min-h-[48px]"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-green-600" aria-hidden="true" />
        <span>Your information is transmitted securely</span>
      </div>
    </form>
  );
}
