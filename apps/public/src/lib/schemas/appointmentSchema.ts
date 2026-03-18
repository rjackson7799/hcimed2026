import { z } from "zod";

// Constants for dropdown options
export const PATIENT_TYPES = ["new", "existing"] as const;
export const TIME_PREFERENCES = ["morning", "afternoon", "no-preference"] as const;
export const VISIT_REASONS = [
  "annual-physical",
  "follow-up",
  "new-concern",
  "chronic-management",
  "prescription-refill",
  "lab-review",
  "other",
] as const;

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

// Display labels
export const PATIENT_TYPE_LABELS: Record<string, string> = {
  new: "New Patient",
  existing: "Existing Patient",
};

export const TIME_PREFERENCE_LABELS: Record<string, string> = {
  morning: "Morning (9AM - 12PM)",
  afternoon: "Afternoon (1PM - 5PM)",
  "no-preference": "No Preference",
};

export const VISIT_REASON_LABELS: Record<string, string> = {
  "annual-physical": "Annual Physical / Wellness Exam",
  "follow-up": "Follow-up Visit",
  "new-concern": "New Health Concern",
  "chronic-management": "Chronic Condition Management",
  "prescription-refill": "Prescription Refill",
  "lab-review": "Lab Results Review",
  other: "Other (please specify in notes)",
};

// Helper to check if date is a weekday
function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
}

// Helper to check if date is in the future
function isFutureDate(dateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateString);
  return selectedDate >= today;
}

// Base schema for common fields
const baseAppointmentSchema = z.object({
  patientType: z.enum(PATIENT_TYPES, {
    required_error: "Please select if you are a new or existing patient",
  }),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (val) => {
        const date = new Date(val);
        const now = new Date();
        return date < now;
      },
      { message: "Date of birth must be in the past" }
    ),
  preferredDate: z
    .string()
    .min(1, "Preferred appointment date is required")
    .refine(isFutureDate, {
      message: "Please select a future date",
    })
    .refine(
      (val) => isWeekday(new Date(val)),
      { message: "Please select a weekday (Monday - Friday)" }
    ),
  preferredTime: z.enum(TIME_PREFERENCES, {
    required_error: "Please select a preferred time",
  }),
  reasonForVisit: z.enum(VISIT_REASONS, {
    required_error: "Please select a reason for your visit",
  }),
  additionalNotes: z.string().max(1000).optional(),
  // New patient fields (optional at base level, validated conditionally)
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyId: z.string().optional(),
});

// Full schema with conditional validation
export const appointmentSchema = baseAppointmentSchema.superRefine((data, ctx) => {
  if (data.patientType === "new") {
    // Validate address fields for new patients
    if (!data.streetAddress || data.streetAddress.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Street address is required for new patients",
        path: ["streetAddress"],
      });
    }
    if (!data.city || data.city.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "City is required for new patients",
        path: ["city"],
      });
    }
    if (!data.state || data.state.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "State is required for new patients",
        path: ["state"],
      });
    }
    if (!data.zipCode || data.zipCode.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ZIP code is required for new patients",
        path: ["zipCode"],
      });
    } else if (!/^\d{5}(-\d{4})?$/.test(data.zipCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid ZIP code",
        path: ["zipCode"],
      });
    }
  }
});

// Type export
export type AppointmentFormData = z.infer<typeof baseAppointmentSchema>;
