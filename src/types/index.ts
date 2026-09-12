export type UserRole = "bewoner" | "vakman" | "community_beheerder" | "admin";
export type CategorieType = "vakman" | "vergelijk";

export type ContentBlokType =
  | "hero_banner"
  | "tekst"
  | "afbeelding"
  | "reviews"
  | "groepskortingen"
  | "bewoners"
  | "aankondiging"
  | "vakman_spotlight";

export interface CommunityContentBlok {
  id: string;
  community_id: string;
  type: ContentBlokType;
  positie: number;
  data: Record<string, unknown>;
  actief: boolean;
}

export interface Profiel {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  language: "nl" | "en";
  created_at: string;
  updated_at: string;
}

export interface Categorie {
  id: string;
  slug: string;
  type: CategorieType;
  name_nl: string;
  name_en: string;
  description_nl: string | null;
  description_en: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  active: boolean;
}

export interface Wijk {
  id: string;
  name: string;
  city: string;
  postal_code: string | null;
  completion_date: string | null;
  home_count: number | null;
  slug: string;
  active: boolean;
  community_threshold: number | null;
}

export interface Community {
  id: string;
  district_id: string;
  naam: string;
  slug: string;
  type: string;
  beschrijving: string | null;
  banner_url: string | null;
  actief: boolean;
}

export type ReviewScores = {
  kwaliteit: number;
  stiptheid: number;
  communicatie: number;
  prijs: number;
};

// Kolomnamen hier volgen de review_compleet-view, niet de reviews-tabel:
// een view's kolomnamen bevriezen bij aanmaak en volgen een onderliggende
// kolomrename niet automatisch (zie migratie 0019). Wordt in Fase 4 herzien.
export interface ReviewCompleet {
  id: string;
  auteur_id: string;
  vakman_id: string;
  boeking_id: string | null;
  community_id: string | null;
  tekst: string;
  scores: Partial<ReviewScores>;
  foto_urls: string[];
  upvote_score: number;
  created_at: string;
  updated_at: string;
  auteur_naam: string;
  auteur_avatar: string | null;
  community_naam: string | null;
  reactie_tekst: string | null;
  reactie_datum: string | null;
  reactie_bedrijf: string | null;
  geverifieerd: boolean;
}

export interface VakmanProfiel {
  id: string;
  user_id: string;
  company_name: string;
  slug: string;
  kvk_number: string | null;
  kvk_verified: boolean;
  bio: string | null;
  website: string | null;
  logo_url: string | null;
  specialties: string[];
  contact_preference: "telefoon" | "whatsapp" | "app";
  service_area_postcode: string | null;
  service_area_km: number;
  insured: boolean;
  insurance_url: string | null;
  registration_source: string | null;
  verified: boolean;
  profile_strength: number;
  avg_score: number;
  review_count: number;
  is_premium: boolean;
  premium_until: string | null;
  requests_this_month: number;
  requests_limit: number;
}

export interface Bericht {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  photo_url: string | null;
  read_at: string | null;
  created_at: string;
}

export type NotificatieType = "review" | "boeking" | "bericht" | "uitnodiging" | "groepskorting" | "systeem" | "premium";

export interface Notificatie {
  id: string;
  user_id: string;
  type: NotificatieType;
  titel_nl: string;
  titel_en: string;
  inhoud_nl: string | null;
  inhoud_en: string | null;
  link: string | null;
  gelezen: boolean;
  created_at: string;
}

export interface GesprekMetLaatsteBericht {
  id: string;
  andereDeelnemer: { user_id: string; naam: string; avatar_url: string | null } | null;
  laatsteBericht: { tekst: string; foto_url: string | null; created_at: string; van_id: string } | null;
  ongelezenAantal: number;
}

export type BoekingStatus = "aangevraagd" | "bevestigd" | "afgerond" | "geannuleerd";

export interface Boeking {
  id: string;
  customer_id: string;
  professional_id: string;
  category_id: string | null;
  community_id: string | null;
  description: string | null;
  foto_urls: string[];
  date: string | null;
  status: BoekingStatus;
  price_cents: number | null;
  customer_notes: string | null;
  professional_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoekingMetKlant extends Boeking {
  klant_naam: string;
  klant_avatar: string | null;
  community_naam: string | null;
  categorie_naam: string | null;
}

// vakman_overzicht gebruikt vp.* (wildcard) en bevriest daardoor haar eigen
// kolomnamen bij aanmaak — die volgen een onderliggende kolomrename niet
// automatisch (zelfde mechanisme als ReviewCompleet, zie migratie 0019/0022).
// Daarom hier een losstaande, bewust-Nederlandse vorm i.p.v. een extend van
// het (inmiddels Engelse) VakmanProfiel. Wordt in Fase 4 herzien.
export interface VakmanOverzicht {
  id: string;
  user_id: string;
  bedrijfsnaam: string;
  slug: string;
  kvk_nummer: string | null;
  kvk_geverifieerd: boolean;
  bio: string | null;
  website: string | null;
  logo_url: string | null;
  specialismes: string[];
  contact_voorkeur: "telefoon" | "whatsapp" | "app";
  werkgebied_postcode: string | null;
  werkgebied_km: number;
  verzekerd: boolean;
  verzekering_url: string | null;
  registratie_bron: string | null;
  geverifieerd: boolean;
  profiel_sterkte: number;
  gem_score: number;
  aantal_reviews: number;
  is_premium: boolean;
  premium_tot: string | null;
  aanvragen_deze_maand: number;
  aanvragen_limiet: number;
  eigenaar_naam: string;
  eigenaar_avatar: string | null;
  review_count: number;
  score_kwaliteit: number;
  afgeronde_klussen: number;
  categorie_slugs: string[] | null;
}
