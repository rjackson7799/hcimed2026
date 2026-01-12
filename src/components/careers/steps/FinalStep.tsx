import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ApplicationFormData,
  REFERRAL_SOURCES,
  REFERRAL_LABELS,
} from "@/lib/schemas/applicationSchema";

export function FinalStep() {
  const { control } = useFormContext<ApplicationFormData>();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Final Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Just a few more questions before you submit.
        </p>
      </div>

      <FormField
        control={control}
        name="referralSource"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              How did you hear about us? <span className="text-destructive">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {REFERRAL_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {REFERRAL_LABELS[source]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalComments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Comments</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Is there anything else you'd like us to know about you or your application?"
                rows={4}
              />
            </FormControl>
            <FormDescription>
              Optional. Share any additional information that may support your
              application.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="authorizationCheckbox"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/50">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="cursor-pointer">
                Authorization & Certification{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormDescription className="text-sm">
                I certify that all information provided in this application is
                accurate and complete to the best of my knowledge. I understand
                that any false statements or omissions may disqualify me from
                employment or result in termination. I authorize HCI Medical
                Group to verify any information provided and to contact my
                previous employers and references.
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4">
        <h4 className="font-medium text-foreground mb-2">
          What happens next?
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>1. Our team will review your application within 5-7 business days.</li>
          <li>2. If your qualifications match our needs, we'll contact you to schedule an interview.</li>
          <li>3. You'll receive an email confirmation after submitting this application.</li>
        </ul>
      </div>
    </div>
  );
}
