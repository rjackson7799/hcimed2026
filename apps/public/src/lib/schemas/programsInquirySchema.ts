import { z } from "zod";

export const PROGRAM_INTEREST_OPTIONS = [
  "weight-loss",
  "trt",
  "both",
  "unsure",
] as const;

export const PATIENT_STATUS_OPTIONS = ["new", "existing"] as const;

export const HCI_PATIENT_OPTIONS = ["yes", "no"] as const;

export const NON_HCI_INTEREST_OPTIONS = ["primary-care", "program-only"] as const;

export const INTENT_OPTIONS = ["info", "start"] as const;

export const PROGRAM_INTEREST_LABELS: Record<string, string> = {
  "weight-loss": "Medical Weight Loss",
  trt: "Men's Health & TRT",
  both: "Both Programs",
  unsure: "Not sure yet — help me decide",
};

export const PATIENT_STATUS_LABELS: Record<string, string> = {
  new: "New patient",
  existing: "Current patient",
};

export const HCI_PATIENT_LABELS: Record<string, string> = {
  yes: "Yes — current HCI patient",
  no: "No",
};

export const NON_HCI_INTEREST_LABELS: Record<string, string> = {
  "primary-care": "I'd like to discuss HCI handling my primary care needs too",
  "program-only": "I'm only interested in this program for now",
};

export const INTENT_LABELS: Record<string, string> = {
  info: "I want more information",
  start: "I'm ready to start now",
};

export const programsInquirySchema = z
  .object({
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
    patientStatus: z.enum(PATIENT_STATUS_OPTIONS, {
      required_error: "Please select your patient status",
    }),
    isCurrentHciPatient: z.enum(HCI_PATIENT_OPTIONS, {
      required_error: "Please tell us if you're a current HCI patient",
    }),
    hciPatientName: z
      .string()
      .max(100, "Name must be 100 characters or less")
      .optional(),
    nonHciInterest: z.enum(NON_HCI_INTEREST_OPTIONS).optional(),
    programInterest: z.enum(PROGRAM_INTEREST_OPTIONS, {
      required_error: "Please choose a program",
    }),
    intent: z
      .array(z.enum(INTENT_OPTIONS))
      .min(1, "Please select at least one option"),
    message: z
      .string()
      .max(500, "Message must be 500 characters or less")
      .optional(),
    subscribeToUpdates: z.boolean().optional().default(false),
    utmSource: z.string().max(120).optional(),
    utmMedium: z.string().max(120).optional(),
    utmCampaign: z.string().max(120).optional(),
    utmContent: z.string().max(120).optional(),
    // Honeypot field — must be empty
    website: z.string().max(0).optional(),
  })
  .refine(
    (data) =>
      data.isCurrentHciPatient !== "yes" ||
      (data.hciPatientName && data.hciPatientName.trim().length > 0),
    {
      message: "Please tell us the name on the HCI patient record",
      path: ["hciPatientName"],
    },
  )
  .refine(
    (data) => data.isCurrentHciPatient !== "no" || !!data.nonHciInterest,
    {
      message: "Please choose one option so we can guide your follow-up",
      path: ["nonHciInterest"],
    },
  );

export type ProgramsInquiryFormData = z.infer<typeof programsInquirySchema>;
