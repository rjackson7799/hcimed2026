import { z } from "zod";

// Constants for dropdown options
export const POSITION_TYPES = ["medical-assistant", "provider"] as const;
export const PROVIDER_SUBTYPES = ["NP", "PA", "MD", "DO"] as const;
export const EMPLOYMENT_TYPES = ["full-time", "part-time", "open-to-either"] as const;
export const AVAILABLE_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

export const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};
export const EXPERIENCE_LEVELS = [
  "less-than-1",
  "1-2",
  "3-5",
  "6-10",
  "10-plus",
] as const;
export const REFERRAL_SOURCES = [
  "indeed",
  "linkedin",
  "company-website",
  "employee-referral",
  "job-fair",
  "other",
] as const;

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

// Display labels for dropdowns
export const POSITION_LABELS: Record<string, string> = {
  "medical-assistant": "Medical Assistant",
  "provider": "Healthcare Provider",
};

export const PROVIDER_SUBTYPE_LABELS: Record<string, string> = {
  NP: "Nurse Practitioner (NP)",
  PA: "Physician Assistant (PA)",
  MD: "Medical Doctor (MD)",
  DO: "Doctor of Osteopathy (DO)",
};

export const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  "open-to-either": "Open to Either",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  "less-than-1": "Less than 1 year",
  "1-2": "1-2 years",
  "3-5": "3-5 years",
  "6-10": "6-10 years",
  "10-plus": "10+ years",
};

// Work Experience Entry
export const workExperienceEntrySchema = z.object({
  employer: z.string().min(1, "Employer name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  duration: z.string().min(1, "Duration is required"),
  responsibilities: z.string().optional(),
});

// Education Entry
export const educationEntrySchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  graduationYear: z.string().min(4, "Graduation year is required"),
  degree: z.string().min(1, "Degree/Certificate is required"),
});

export type WorkExperienceEntry = z.infer<typeof workExperienceEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;

export const REFERRAL_LABELS: Record<string, string> = {
  indeed: "Indeed",
  linkedin: "LinkedIn",
  "company-website": "Company Website",
  "employee-referral": "Employee Referral",
  "job-fair": "Job Fair",
  other: "Other",
};

// File validation constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const ACCEPTED_FILE_EXTENSIONS = ".pdf,.doc,.docx";

// Step 1: Personal Information
export const personalInfoSchema = z.object({
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
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code"),
});

// Step 2: Position Details
export const positionDetailsSchema = z
  .object({
    positionType: z.enum(POSITION_TYPES, {
      required_error: "Please select a position type",
    }),
    providerSubtype: z.enum(PROVIDER_SUBTYPES).optional().nullable(),
    employmentType: z.enum(EMPLOYMENT_TYPES, {
      required_error: "Please select employment type",
    }),
    availableDays: z.array(z.enum(AVAILABLE_DAYS)).optional().nullable(),
    desiredSalary: z.string().optional(),
    earliestStartDate: z.string().min(1, "Please select an earliest start date"),
  })
  .refine(
    (data) => {
      if (data.positionType === "provider" && !data.providerSubtype) {
        return false;
      }
      return true;
    },
    {
      message: "Please select your provider type",
      path: ["providerSubtype"],
    }
  )
  .refine(
    (data) => {
      if (data.employmentType === "part-time" && (!data.availableDays || data.availableDays.length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Please select at least one day you're available",
      path: ["availableDays"],
    }
  );

// Step 3: Qualifications & Experience
export const qualificationsSchema = z.object({
  yearsOfExperience: z.enum(EXPERIENCE_LEVELS, {
    required_error: "Please select your experience level",
  }),
  certificationsLicenses: z
    .string()
    .min(1, "Please list your certifications and licenses"),
  workExperience: z.array(workExperienceEntrySchema).min(1, "At least one work experience is required"),
  education: z.array(educationEntrySchema).min(1, "At least one education entry is required"),
});

// Step 4: Documents - handled separately due to File type
export const documentsSchema = z.object({
  resume: z.custom<File>(
    (val) => val instanceof File,
    "Please upload your resume"
  ),
  coverLetter: z.custom<File>((val) => val instanceof File).optional().nullable(),
});

// Step 5: Final
export const finalSchema = z.object({
  referralSource: z.enum(REFERRAL_SOURCES, {
    required_error: "Please tell us how you heard about us",
  }),
  additionalComments: z.string().max(2000).optional(),
  authorizationCheckbox: z.boolean().refine((val) => val === true, {
    message: "You must certify the accuracy of your information to continue",
  }),
});

// Combined schema for form default values (without file validation)
export const applicationFormSchema = z.object({
  // Personal Info
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  streetAddress: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  // Position Details
  positionType: z.enum(POSITION_TYPES).optional(),
  providerSubtype: z.enum(PROVIDER_SUBTYPES).optional().nullable(),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  availableDays: z.array(z.enum(AVAILABLE_DAYS)).optional().nullable(),
  desiredSalary: z.string().optional(),
  earliestStartDate: z.string(),
  // Qualifications
  yearsOfExperience: z.enum(EXPERIENCE_LEVELS).optional(),
  certificationsLicenses: z.string(),
  workExperience: z.array(workExperienceEntrySchema),
  education: z.array(educationEntrySchema),
  // Documents
  resume: z.custom<File>((val) => val instanceof File, "Please upload your resume"),
  coverLetter: z.custom<File>().optional().nullable(),
  // Final
  referralSource: z.enum(REFERRAL_SOURCES).optional(),
  additionalComments: z.string().optional(),
  authorizationCheckbox: z.boolean(),
});

// Type exports
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type PositionDetailsData = z.infer<typeof positionDetailsSchema>;
export type QualificationsData = z.infer<typeof qualificationsSchema>;
export type DocumentsData = z.infer<typeof documentsSchema>;
export type FinalData = z.infer<typeof finalSchema>;
export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

// Step field names for validation triggers
export const STEP_FIELDS: (keyof ApplicationFormData)[][] = [
  ["firstName", "lastName", "email", "phone", "streetAddress", "city", "state", "zipCode"],
  ["positionType", "providerSubtype", "employmentType", "availableDays", "desiredSalary", "earliestStartDate"],
  ["yearsOfExperience", "certificationsLicenses", "workExperience", "education"],
  ["resume", "coverLetter"],
  ["referralSource", "additionalComments", "authorizationCheckbox"],
];

export const STEP_LABELS = [
  "Personal Info",
  "Position",
  "Qualifications",
  "Documents",
  "Review",
];
