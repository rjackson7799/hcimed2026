import { z } from "zod";

export const INTEREST_OPTIONS = ["enroll", "info"] as const;
export const PATIENT_STATUS_OPTIONS = ["new", "existing"] as const;

export const INTEREST_LABELS: Record<string, string> = {
  enroll: "Enrolling in the program",
  info: "Getting more information",
};

export const PATIENT_STATUS_LABELS: Record<string, string> = {
  new: "No — I'm a new patient",
  existing: "Yes — I'm an existing patient",
};

export const weightLossSchema = z.object({
  interest: z.enum(INTEREST_OPTIONS, {
    required_error: "Please select your interest",
  }),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  isCurrentPatient: z.enum(PATIENT_STATUS_OPTIONS).optional(),
  message: z.string().max(500, "Message must be 500 characters or less").optional(),
  // Honeypot field — must be empty
  website: z.string().max(0).optional(),
});

export type WeightLossFormData = z.infer<typeof weightLossSchema>;
