import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@hci/shared/ui/form";
import { Input } from "@hci/shared/ui/input";
import { Textarea } from "@hci/shared/ui/textarea";
import { Button } from "@hci/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@hci/shared/ui/select";
import { toast } from "sonner";
import { Loader2, Phone, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { cn } from "@hci/shared/lib/utils";
import { siteConfig } from "@/config/site";
import {
  type WeightLossFormData,
  weightLossSchema,
  INTEREST_OPTIONS,
  INTEREST_LABELS,
  PATIENT_STATUS_OPTIONS,
  PATIENT_STATUS_LABELS,
} from "@/lib/schemas/weightLossSchema";

interface WeightLossFormProps {
  id?: string;
}

export function WeightLossForm({ id = "weight-loss-form" }: WeightLossFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<WeightLossFormData>({
    resolver: zodResolver(weightLossSchema),
    mode: "onBlur",
    defaultValues: {
      interest: "enroll",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      isCurrentPatient: undefined,
      message: "",
      website: "",
    },
  });

  const onSubmit = async (data: WeightLossFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/weight-loss-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to submit request");
      }

      setIsSubmitted(true);
      toast.success("Request submitted! We'll contact you within 1 business day.");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Please try again or call us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div id={id} className="bg-card rounded-xl card-shadow border border-border p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          Request Received!
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          Thank you for your interest in our Medical Weight Loss Program. Our team will contact you within 1 business day.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSubmitted(false)}
          className="text-sm"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <div id={id} className="bg-card rounded-xl card-shadow border border-border p-6">
      <h3 className="font-display text-xl font-semibold text-foreground mb-1">
        Get Started Today
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Our team will contact you within 1 business day.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {/* Honeypot — hidden from users */}
          <div className="sr-only" aria-hidden="true">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} tabIndex={-1} autoComplete="off" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="interest"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">I'm interested in:</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INTEREST_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {INTEREST_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Phone *</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="(626) 555-0123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expandable fields */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              isExpanded ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-3 pt-1">
              <FormField
                control={form.control}
                name="isCurrentPatient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Are you a current patient?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PATIENT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {PATIENT_STATUS_LABELS[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Message (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Questions or concerns..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-secondary font-medium hover:text-secondary/80 transition-colors mx-auto"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Fewer options
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                More options
              </>
            )}
          </button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground min-h-[48px] text-base font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </form>
      </Form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground min-h-[44px] font-semibold"
      >
        <a href={`tel:${siteConfig.contact.phoneRaw}`}>
          <Phone className="h-4 w-4 mr-2" />
          Call {siteConfig.contact.phone}
        </a>
      </Button>

      <p className="text-[11px] text-muted-foreground text-center mt-3">
        No obligation. We'll help determine if the program is right for you.
      </p>
    </div>
  );
}
