export type ActiviteitNiveau = "nieuw" | "groeit" | "actief";

export const ACTIVITEIT_LABEL: Record<ActiviteitNiveau, string> = {
  nieuw: "Nieuw",
  groeit: "Groeit",
  actief: "Veel activiteit",
};

/**
 * Transparante vuistregel, geen black-box score (zie architectuuraudit,
 * §I): puur gebaseerd op de twee getallen die er ook gewoon naast staan
 * — aantal unieke woningen en groei in de laatste 30 dagen. Bewust geen
 * afgeleide/gewogen score.
 */
export function bepaalActiviteitsniveau(residenceCount: number, newResidences30d: number): ActiviteitNiveau {
  if (residenceCount >= 8 || newResidences30d >= 5) return "actief";
  if (residenceCount >= 3 || newResidences30d >= 2) return "groeit";
  return "nieuw";
}

export const ACTIVITEIT_KLASSE: Record<ActiviteitNiveau, string> = {
  nieuw: "bg-sand text-warmgrijs-dark",
  groeit: "bg-oker-light text-oker",
  actief: "bg-groen-light text-groen",
};
