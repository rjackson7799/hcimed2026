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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import {
  AppointmentFormData,
  appointmentSchema,
  PATIENT_TYPES,
  PATIENT_TYPE_LABELS,
  TIME_PREFERENCES,
  TIME_PREFERENCE_LABELS,
  VISIT_REASONS,
  VISIT_REASON_LABELS,
  US_STATES,
} from "@/lib/schemas/appointmentSchema";

export function AppointmentRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    mode: "onBlur",
    defaultValues: {
      patientType: undefined,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      preferredDate: "",
      preferredTime: undefined,
      reasonForVisit: undefined,
      additionalNotes: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      insuranceProvider: "",
      insurancePolicyId: "",
    },
  });

  const patientType = form.watch("patientType");
  const isNewPatient = patientType === "new";

  // Get tomorrow's date as minimum for appointment
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/request-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      toast.success("Appointment request submitted!", {
        description: "We'll contact you within 1 business day to confirm your appointment.",
      });

      form.reset();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed", {
        description: "There was a problem submitting your request. Please try again or call us at (626) 792-4185.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Badge */}
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-medium text-green-800">Secure Form</span>
          <span className="text-green-700 ml-1">
            — Your information is encrypted and protected
          </span>
        </div>
      </div>

      {/* HIPAA Notice */}
      <div className="p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Your privacy is important to us. This form is secure and your
            personal health information is protected in accordance with HIPAA
            regulations. We will only use this information to contact you about
            your appointment.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Patient Type Selection */}
          <FormField
            control={form.control}
            name="patientType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-semibold">
                  Are you a new or existing patient?{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    {PATIENT_TYPES.map((type) => (
                      <FormItem
                        key={type}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={type} />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {PATIENT_TYPE_LABELS[type]}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      First Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="given-name"
                        placeholder="John"
                      />
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
                    <FormLabel>
                      Last Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="family-name"
                        placeholder="Doe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="john.doe@example.com"
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
                    <FormLabel>
                      Phone <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="(555) 123-4567"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="md:w-1/2">
                  <FormLabel>
                    Date of Birth <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" autoComplete="bday" />
                  </FormControl>
                  <FormDescription>
                    {isNewPatient
                      ? "Required for new patient registration"
                      : "Used to verify your patient record"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* New Patient Fields */}
          {isNewPatient && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground border-b pb-2">
                Address Information
              </h3>

              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Street Address <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="street-address"
                        placeholder="123 Main Street"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        City <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="address-level2"
                          placeholder="Pasadena"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        State <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
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
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        ZIP Code <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="postal-code"
                          inputMode="numeric"
                          placeholder="91101"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="font-semibold text-foreground border-b pb-2 pt-4">
                Insurance Information (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insuranceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Blue Cross Blue Shield"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insurancePolicyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy / Member ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., ABC123456789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Appointment Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">
              Appointment Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Preferred Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="date" min={minDate} />
                    </FormControl>
                    <FormDescription>
                      We're open Monday - Friday
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Preferred Time <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_PREFERENCES.map((time) => (
                          <SelectItem key={time} value={time}>
                            {TIME_PREFERENCE_LABELS[time]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reasonForVisit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason for Visit <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason for visit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VISIT_REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {VISIT_REASON_LABELS[reason]}
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
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any additional information about your visit, symptoms, or special requests..."
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional. Share any relevant details about your appointment
                    request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Consent Footer */}
          <p className="text-sm text-muted-foreground">
            By submitting this form, you consent to be contacted by HCI Medical
            Group regarding your appointment request.
          </p>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Request Appointment"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
