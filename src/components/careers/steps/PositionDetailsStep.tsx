import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ApplicationFormData,
  POSITION_TYPES,
  POSITION_LABELS,
  PROVIDER_SUBTYPES,
  PROVIDER_SUBTYPE_LABELS,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_LABELS,
  AVAILABLE_DAYS,
  DAY_LABELS,
} from "@/lib/schemas/applicationSchema";

export function PositionDetailsStep() {
  const { control, watch } = useFormContext<ApplicationFormData>();
  const positionType = watch("positionType");
  const employmentType = watch("employmentType");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Position Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us about the position you're applying for.
        </p>
      </div>

      <FormField
        control={control}
        name="positionType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Position Type <span className="text-destructive">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select position type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {POSITION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {POSITION_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {positionType === "provider" && (
        <FormField
          control={control}
          name="providerSubtype"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Provider Type <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your credential type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROVIDER_SUBTYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {PROVIDER_SUBTYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="employmentType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>
              Employment Type <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6"
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <FormItem
                    key={type}
                    className="flex items-center space-x-3 space-y-0"
                  >
                    <FormControl>
                      <RadioGroupItem value={type} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {EMPLOYMENT_LABELS[type]}
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(employmentType === "part-time" || employmentType === "open-to-either") && (
        <FormField
          control={control}
          name="availableDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Available Days{" "}
                {employmentType === "part-time" && (
                  <span className="text-destructive">*</span>
                )}
              </FormLabel>
              <FormDescription className="mt-1 mb-3">
                {employmentType === "part-time"
                  ? "Select all days you're available to work."
                  : "Optional: Select your preferred days if you have a preference."}
              </FormDescription>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVAILABLE_DAYS.map((day) => {
                  const isChecked = field.value?.includes(day) || false;
                  return (
                    <FormItem
                      key={day}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, day]);
                            } else {
                              field.onChange(
                                currentValue.filter((d) => d !== day)
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {DAY_LABELS[day]}
                      </FormLabel>
                    </FormItem>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="desiredSalary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Desired Salary Range</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g., $60,000 - $75,000 or $35/hour"
              />
            </FormControl>
            <FormDescription>
              Optional. Include annual salary or hourly rate preference.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="earliestStartDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Earliest Start Date <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} type="date" min={new Date().toISOString().split("T")[0]} />
            </FormControl>
            <FormDescription>
              When is the earliest you could begin working?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
