import { useEffect, useState } from "react";
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
import { Loader2, CheckCircle, Check } from "lucide-react";
import { cn } from "@hci/shared/lib/utils";
import { useUtmCapture } from "@/hooks/useUtmCapture";
import {
  programsInquirySchema,
  type ProgramsInquiryFormData,
  PROGRAM_INTEREST_OPTIONS,
  PATIENT_STATUS_OPTIONS,
  PATIENT_STATUS_LABELS,
  HCI_PATIENT_OPTIONS,
  HCI_PATIENT_LABELS,
  NON_HCI_INTEREST_OPTIONS,
  NON_HCI_INTEREST_LABELS,
  INTENT_OPTIONS,
  INTENT_LABELS,
} from "@/lib/schemas/programsInquirySchema";

const PROGRAM_OPTIONS: Array<{
  value: (typeof PROGRAM_INTEREST_OPTIONS)[number];
  label: string;
  sub: string;
}> = [
  { value: "weight-loss", label: "Medical Weight Loss", sub: "GLP-1, nutrition & physician care" },
  { value: "trt", label: "Men's Health & TRT", sub: "Testosterone & hormone optimization" },
  { value: "both", label: "Both Programs", sub: "I'm interested in both" },
  { value: "unsure", label: "Not Sure Yet", sub: "Help me decide" },
];

interface ProgramsInquiryFormProps {
  id?: string;
  defaultIsHciPatient?: "yes" | "no";
}

export function ProgramsInquiryForm({
  id = "get-started",
  defaultIsHciPatient,
}: ProgramsInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const utm = useUtmCapture();

  const form = useForm<ProgramsInquiryFormData>({
    resolver: zodResolver(programsInquirySchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      patientStatus: undefined as unknown as ProgramsInquiryFormData["patientStatus"],
      isCurrentHciPatient: defaultIsHciPatient as ProgramsInquiryFormData["isCurrentHciPatient"],
      hciPatientName: "",
      nonHciInterest: undefined,
      programInterest: undefined as unknown as ProgramsInquiryFormData["programInterest"],
      intent: [],
      message: "",
      subscribeToUpdates: true,
      website: "",
    },
  });

  // When the parent updates the default (e.g., after F&F popup CTA), sync the field
  useEffect(() => {
    if (defaultIsHciPatient && !form.getValues("isCurrentHciPatient")) {
      form.setValue("isCurrentHciPatient", defaultIsHciPatient, { shouldValidate: false });
    }
  }, [defaultIsHciPatient, form]);

  const hciPatientStatus = form.watch("isCurrentHciPatient");
  const isHciPatient = hciPatientStatus === "yes";
  const isNonHciPatient = hciPatientStatus === "no";
  const programInterest = form.watch("programInterest");
  const intent = form.watch("intent") || [];

  const onSubmit = async (data: ProgramsInquiryFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/programs-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          utmSource: utm?.utmSource,
          utmMedium: utm?.utmMedium,
          utmCampaign: utm?.utmCampaign,
          utmContent: utm?.utmContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to submit request");
      }

      // GA4 event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "lead_submitted", {
          event_category: "engagement",
          event_label: "programs-weight-loss-trt",
          program_interest: data.programInterest,
          is_hci_patient: data.isCurrentHciPatient,
        });
      }

      setIsSubmitted(true);
      toast.success("Request submitted! We'll contact you within 1 business day.");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again or call us directly.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        id={id}
        className="bg-card rounded-xl card-shadow border border-border p-8 md:p-10 text-center max-w-2xl mx-auto"
      >
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-secondary" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
          Thank You!
        </h3>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
          We've received your request and a member of our care team will reach out to
          you within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <div
      id={id}
      className="bg-card rounded-xl card-shadow border border-border p-6 md:p-10 max-w-2xl mx-auto"
    >
      <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-1">
        Request Information
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        All fields marked with <span className="text-secondary">*</span> are required.
        We'll never share your information.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Honeypot — hidden */}
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

          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                    First Name <span className="text-secondary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Jane" autoComplete="given-name" {...field} />
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
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                    Last Name <span className="text-secondary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Smith" autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                    Email <span className="text-secondary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@email.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                    Phone <span className="text-secondary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(626) 555-0123"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="patientStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                  Patient Status <span className="text-secondary">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select one…" />
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

          <hr className="border-border" />

          {/* HCI Patient (Friends & Family eligibility) */}
          <FormField
            control={form.control}
            name="isCurrentHciPatient"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                  Are you (or someone in your household) a current HCI patient?{" "}
                  <span className="text-secondary">*</span>
                </FormLabel>
                <p className="text-xs text-muted-foreground -mt-1 mb-1">
                  HCI patients qualify for the 15% Friends &amp; Family discount on the
                  new programs.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {HCI_PATIENT_OPTIONS.map((option) => {
                    const selected = field.value === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => field.onChange(option)}
                        className={cn(
                          "border-2 rounded-md px-4 py-3 text-sm font-semibold text-left transition-all",
                          selected
                            ? "border-secondary bg-secondary/5 text-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-secondary/50",
                        )}
                      >
                        {HCI_PATIENT_LABELS[option]}
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {isHciPatient && (
            <FormField
              control={form.control}
              name="hciPatientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                    Name on the HCI patient record{" "}
                    <span className="text-secondary">*</span>
                  </FormLabel>
                  <p className="text-xs text-muted-foreground -mt-1 mb-1">
                    The name we have on file for the HCI patient (you, a parent, a
                    spouse, etc.).
                  </p>
                  <FormControl>
                    <Input placeholder="Patient's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isNonHciPatient && (
            <FormField
              control={form.control}
              name="nonHciInterest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                    Beyond the program, what works for you?{" "}
                    <span className="text-secondary">*</span>
                  </FormLabel>
                  <p className="text-xs text-muted-foreground -mt-1 mb-1">
                    HCI is a full-service primary care practice. Either is welcome —
                    just pick whichever fits.
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {NON_HCI_INTEREST_OPTIONS.map((option) => {
                      const selected = field.value === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => field.onChange(option)}
                          className={cn(
                            "border-2 rounded-md px-4 py-3 text-sm font-semibold text-left transition-all leading-snug",
                            selected
                              ? "border-secondary bg-secondary/5 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-secondary/50",
                          )}
                        >
                          {NON_HCI_INTEREST_LABELS[option]}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <hr className="border-border" />

          {/* Program Interest */}
          <FormField
            control={form.control}
            name="programInterest"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                  Program Interest <span className="text-secondary">*</span>
                </FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROGRAM_OPTIONS.map((option) => {
                    const selected = programInterest === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          "border-2 rounded-md p-4 text-left transition-all",
                          selected
                            ? "border-secondary bg-secondary/5"
                            : "border-border bg-card hover:border-secondary/50",
                        )}
                      >
                        <div className="font-semibold text-sm text-foreground">
                          {option.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {option.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <hr className="border-border" />

          {/* Intent */}
          <FormField
            control={form.control}
            name="intent"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                  How can we help? <span className="text-secondary">*</span>
                </FormLabel>
                <div className="space-y-2">
                  {INTENT_OPTIONS.map((option) => {
                    const checked = intent.includes(option);
                    return (
                      <label
                        key={option}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-md border-2 cursor-pointer transition-all",
                          checked
                            ? "border-secondary bg-secondary/5"
                            : "border-border bg-card hover:border-secondary/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                            checked
                              ? "bg-secondary border-secondary"
                              : "bg-card border-border",
                          )}
                        >
                          {checked && (
                            <Check className="h-3.5 w-3.5 text-secondary-foreground" />
                          )}
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? intent.filter((v) => v !== option)
                              : [...intent, option];
                            field.onChange(next);
                          }}
                        />
                        <span className="text-sm text-foreground leading-snug">
                          {INTENT_LABELS[option]}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide">
                  Message (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Anything else you'd like us to know?"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subscribeToUpdates"
            render={({ field }) => {
              const checked = field.value !== false;
              return (
                <FormItem>
                  <label
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-md border-2 cursor-pointer transition-all",
                      checked
                        ? "border-secondary bg-secondary/5"
                        : "border-border bg-card hover:border-secondary/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        checked
                          ? "bg-secondary border-secondary"
                          : "bg-card border-border",
                      )}
                    >
                      {checked && (
                        <Check className="h-3.5 w-3.5 text-secondary-foreground" />
                      )}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <span className="text-sm text-foreground leading-snug">
                      Also subscribe me to HCI Medical Group updates &mdash; programs,
                      health tips, and special offers. You can unsubscribe anytime.
                    </span>
                  </label>
                </FormItem>
              );
            }}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground min-h-[52px] text-base font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit My Request →"
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            🔒 Your information is secure and will never be shared or sold. By
            submitting, you agree to be contacted by HCI Medical Group regarding your
            inquiry.
          </p>
        </form>
      </Form>
    </div>
  );
}
