import { CalendarPlus, Phone, Heart } from 'lucide-react';

const steps = [
  {
    icon: CalendarPlus,
    title: 'Request',
    subtitle: 'Fill out our simple form',
  },
  {
    icon: Phone,
    title: 'Confirm',
    subtitle: "We'll call to confirm your appointment",
  },
  {
    icon: Heart,
    title: 'Visit',
    subtitle: 'Meet your provider and start your care',
  },
];

export function NewPatientSteps() {
  return (
    <div className="py-8">
      <h3 className="font-display text-xl font-semibold text-foreground text-center mb-6">
        Your First Visit in 3 Simple Steps
      </h3>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center gap-4 md:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                <step.icon className="h-6 w-6 text-secondary" />
              </div>
              <span className="font-display font-semibold text-foreground">
                {step.title}
              </span>
              <span className="text-sm text-muted-foreground max-w-[160px]">
                {step.subtitle}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className="hidden md:block w-12 h-px bg-border"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
