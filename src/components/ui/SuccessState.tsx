import { CheckCircle, type Icon } from "@phosphor-icons/react";

interface SuccessStateProps {
  icon?: Icon;
  title: string;
  body: string;
  supporting?: string;
  cta: { href: string; label: string };
}

/**
 * Gedeelde "succes"-opmaak: ronde badge + heading + subtext + cta.
 * Extractie van het patroon dat al los in BookingFlow.tsx en
 * RegistratieForm.tsx stond (cirkel + CheckCircle/EnvelopeSimple-icon),
 * nu als volwaardige pagina i.p.v. alleen binnen een modal/stap.
 */
export function SuccessState({ icon: IconComponent = CheckCircle, title, body, supporting, cta }: SuccessStateProps) {
  return (
    <div className="text-center max-w-[440px] mx-auto py-16 px-6">
      <div className="w-16 h-16 rounded-full bg-sage-50 text-sage flex items-center justify-center mx-auto mb-6">
        <IconComponent size={32} weight="fill" />
      </div>
      <h1 className="font-display text-display-md text-warmzwart mb-3">{title}</h1>
      <p className="text-body text-warmgrijs-dark mb-2">{body}</p>
      {supporting && <p className="text-body-sm text-warmgrijs">{supporting}</p>}
      <a href={cta.href} className="btn-primary justify-center mt-8 inline-flex">
        {cta.label}
      </a>
    </div>
  );
}
