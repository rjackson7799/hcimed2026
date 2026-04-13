import { GraduationCap, Award, Globe, Clock } from 'lucide-react';

export interface CredentialsData {
  education: string[];
  certifications: string[];
  languages: string[];
  yearsExperience: number;
}

interface ProviderCredentialsProps {
  credentials: CredentialsData;
}

const sections = [
  { key: 'certifications' as const, icon: Award, label: 'Certifications' },
  { key: 'education' as const, icon: GraduationCap, label: 'Education' },
] as const;

export function ProviderCredentials({ credentials }: ProviderCredentialsProps) {
  return (
    <div className="mt-8 pt-8 border-t border-border">
      <h3 className="font-display text-xl font-semibold text-foreground mb-6 text-center">
        Credentials & Background
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map(({ key, icon: Icon, label }) => (
          <div key={key}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-5 w-5 text-secondary" />
              <span className="font-medium text-foreground">{label}</span>
            </div>
            <ul className="space-y-1 text-muted-foreground text-sm">
              {credentials[key].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-secondary" />
            <span className="font-medium text-foreground">Languages</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {credentials.languages.join(', ')}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-secondary" />
            <span className="font-medium text-foreground">Experience</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {credentials.yearsExperience}+ years of clinical practice
          </p>
        </div>
      </div>
    </div>
  );
}
