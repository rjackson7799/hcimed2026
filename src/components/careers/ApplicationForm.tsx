import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ArrowRight, Send, ShieldCheck, Lock } from "lucide-react";
import { FormStepIndicator } from "./FormStepIndicator";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { PositionDetailsStep } from "./steps/PositionDetailsStep";
import { QualificationsStep } from "./steps/QualificationsStep";
import { DocumentsStep } from "./steps/DocumentsStep";
import { FinalStep } from "./steps/FinalStep";
import {
  ApplicationFormData,
  applicationFormSchema,
  STEP_FIELDS,
  STEP_LABELS,
} from "@/lib/schemas/applicationSchema";

const TOTAL_STEPS = STEP_LABELS.length;

// Helper function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

export function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      positionType: undefined,
      providerSubtype: null,
      employmentType: undefined,
      availableDays: [],
      desiredSalary: "",
      earliestStartDate: "",
      yearsOfExperience: undefined,
      certificationsLicenses: "",
      workExperience: [
        {
          employer: "",
          jobTitle: "",
          city: "",
          state: "",
          duration: "",
          responsibilities: "",
        },
      ],
      education: [
        {
          schoolName: "",
          city: "",
          state: "",
          country: "United States",
          graduationYear: "",
          degree: "",
        },
      ],
      resume: null,
      coverLetter: null,
      referralSource: undefined,
      additionalComments: "",
      authorizationCheckbox: false,
    },
  });

  const { trigger, handleSubmit } = methods;

  const validateCurrentStep = async (): Promise<boolean> => {
    const currentFields = STEP_FIELDS[currentStep];
    const isValid = await trigger(currentFields);
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
      // Scroll to top of form
      document
        .getElementById("application-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    document
      .getElementById("application-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (data: ApplicationFormData) => {
    // Validate final step first
    const isFinalStepValid = await validateCurrentStep();
    if (!isFinalStepValid) {
      return;
    }

    // Honeypot spam check - if this hidden field is filled, it's a bot
    const form = document.getElementById("application-form") as HTMLFormElement;
    const honeypotInput = form?.querySelector('input[name="company"]') as HTMLInputElement;
    if (honeypotInput?.value) {
      // Silently reject spam but show success to not alert bots
      toast({
        title: "Application submitted successfully!",
        description: "Thank you for your interest. We'll review your application and be in touch soon.",
      });
      methods.reset();
      setCurrentStep(0);
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert files to base64
      const resumeBase64 = data.resume ? await fileToBase64(data.resume) : null;
      const coverLetterBase64 = data.coverLetter
        ? await fileToBase64(data.coverLetter)
        : null;

      const payload = {
        ...data,
        resume: data.resume
          ? {
              filename: data.resume.name,
              content: resumeBase64,
              type: data.resume.type,
            }
          : null,
        coverLetter: coverLetterBase64
          ? {
              filename: data.coverLetter!.name,
              content: coverLetterBase64,
              type: data.coverLetter!.type,
            }
          : null,
      };

      const response = await fetch("/api/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      toast({
        title: "Application submitted successfully!",
        description:
          "Thank you for your interest. We'll review your application and be in touch soon.",
      });

      // Reset form and go back to first step
      methods.reset();
      setCurrentStep(0);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description:
          "There was a problem submitting your application. Please try again or contact us directly at (626) 792-4185.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep />;
      case 1:
        return <PositionDetailsStep />;
      case 2:
        return <QualificationsStep />;
      case 3:
        return <DocumentsStep />;
      case 4:
        return <FinalStep />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        id="application-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Honeypot field - hidden from humans, bots will fill it */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="company">
            Company
            <input
              type="text"
              id="company"
              name="company"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>

        {/* Privacy Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex gap-3">
            <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-foreground">
              <p className="font-medium mb-1">Your Information is Secure</p>
              <p className="text-muted-foreground">Your application is confidential and for internal review only. Your information will not be shared with third parties.</p>
            </div>
          </div>
        </div>

        <FormStepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Current step content */}
        <div className="min-h-[400px]">{renderStep()}</div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <Button type="button" onClick={handleNext}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>

        {/* Step counter for mobile */}
        <p className="text-center text-sm text-muted-foreground md:hidden">
          Step {currentStep + 1} of {TOTAL_STEPS}
        </p>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4 border-t">
          <ShieldCheck className="h-4 w-4 text-green-600" aria-hidden="true" />
          <span>Your information is transmitted securely</span>
        </div>
      </form>
    </FormProvider>
  );
}
