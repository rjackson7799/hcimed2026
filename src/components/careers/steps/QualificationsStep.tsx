import { useFormContext, useFieldArray } from "react-hook-form";
import {
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ApplicationFormData,
  EXPERIENCE_LEVELS,
  EXPERIENCE_LABELS,
  US_STATES,
} from "@/lib/schemas/applicationSchema";
import { Plus, Trash2 } from "lucide-react";

export function QualificationsStep() {
  const { control } = useFormContext<ApplicationFormData>();

  const {
    fields: workFields,
    append: appendWork,
    remove: removeWork,
  } = useFieldArray({
    control,
    name: "workExperience",
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Qualifications & Experience
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your professional background, work history, and education.
        </p>
      </div>

      {/* Years of Experience */}
      <FormField
        control={control}
        name="yearsOfExperience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Years of Experience <span className="text-destructive">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {EXPERIENCE_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Certifications & Licenses */}
      <FormField
        control={control}
        name="certificationsLicenses"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Certifications & Licenses <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="e.g., CMA (AAMA), CPR/BLS certified, California Medical Assistant Certificate"
                rows={3}
              />
            </FormControl>
            <FormDescription>
              List all relevant certifications, licenses, and credentials.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Work Experience Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">
              Work Experience <span className="text-destructive">*</span>
            </h4>
            <p className="text-sm text-muted-foreground">
              Add up to 2 relevant work experiences
            </p>
          </div>
          {workFields.length < 2 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendWork({
                  employer: "",
                  jobTitle: "",
                  city: "",
                  state: "",
                  duration: "",
                  responsibilities: "",
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Experience
            </Button>
          )}
        </div>

        {workFields.map((field, index) => (
          <div
            key={field.id}
            className="border rounded-lg p-4 space-y-4 bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Work Experience {index + 1}
              </span>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeWork(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`workExperience.${index}.employer`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Employer <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Company or practice name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`workExperience.${index}.jobTitle`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Job Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Medical Assistant" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name={`workExperience.${index}.city`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      City <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`workExperience.${index}.state`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      State <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="State" />
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
                control={control}
                name={`workExperience.${index}.duration`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Duration <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 2 years 3 months" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name={`workExperience.${index}.responsibilities`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Responsibilities</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Briefly describe your main duties and achievements..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>

      {/* Education Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">
              Education <span className="text-destructive">*</span>
            </h4>
            <p className="text-sm text-muted-foreground">
              Add up to 2 educational experiences
            </p>
          </div>
          {eduFields.length < 2 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendEdu({
                  schoolName: "",
                  city: "",
                  state: "",
                  country: "United States",
                  graduationYear: "",
                  degree: "",
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </Button>
          )}
        </div>

        {eduFields.map((field, index) => (
          <div
            key={field.id}
            className="border rounded-lg p-4 space-y-4 bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Education {index + 1}
              </span>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEdu(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <FormField
              control={control}
              name={`education.${index}.schoolName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    School / Institution <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="School or institution name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name={`education.${index}.city`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      City <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`education.${index}.state`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      State <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="State/Province" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`education.${index}.country`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Country <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`education.${index}.graduationYear`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Year Graduated <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 2020" maxLength={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`education.${index}.degree`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Degree / Certificate <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Associate's in Health Science"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
