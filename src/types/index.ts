export type UserRole = "resident" | "professional" | "community_admin" | "admin";
export type CategorieType = "professional" | "compare";

export type ContentBlokType =
  | "hero_banner"
  | "text"
  | "image"
  | "reviews"
  | "group_discounts"
  | "residents"
  | "announcement"
  | "professional_spotlight";

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

// Kolomnamen hier volgen de review_compleet-view (herbouwd in migratie
// 0031 met expliciete Engelse kolommen i.p.v. de bevroren r.*-wildcard).
export interface ReviewCompleet {
  id: string;
  author_id: string;
  professional_id: string;
  booking_id: string | null;
  community_id: string | null;
  text: string;
  scores: Partial<ReviewScores>;
  foto_urls: string[];
  upvote_score: number;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar: string | null;
  community_name: string | null;
  reply_text: string | null;
  reply_date: string | null;
  reply_company: string | null;
  verified: boolean;
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
  contact_preference: "phone" | "whatsapp" | "app";
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

export type NotificatieType = "review" | "booking" | "message" | "invitation" | "group_discount" | "system" | "premium";

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

export type BoekingStatus = "requested" | "confirmed" | "completed" | "cancelled";

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

// vakman_overzicht is herbouwd in migratie 0033 met expliciete Engelse
// kolommen i.p.v. de bevroren vp.*-wildcard, en volgt nu 1-op-1 de
// kolomnamen van professional_profiles — vandaar de extend.
export interface VakmanOverzicht extends VakmanProfiel {
  owner_name: string;
  owner_avatar: string | null;
  completed_jobs: number;
  category_slugs: string[] | null;
}
