export type UserRole = "resident" | "professional" | "community_admin" | "admin";
export type CategoryType = "professional" | "compare";

export type ContentBlockType =
  | "hero_banner"
  | "text"
  | "image"
  | "reviews"
  | "group_discounts"
  | "residents"
  | "announcement"
  | "professional_spotlight";

export interface CommunityContentBlock {
  id: string;
  community_id: string;
  type: ContentBlockType;
  position: number;
  data: Record<string, unknown>;
  active: boolean;
}

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  language: "nl" | "en";
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
  deleted_at: string | null;
}

export interface Category {
  id: string;
  slug: string;
  type: CategoryType;
  name_nl: string;
  name_en: string;
  description_nl: string | null;
  description_en: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  active: boolean;
}

export interface Development {
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
  development_id: string | null;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  banner_url: string | null;
  active: boolean;
}

export type ReviewScores = {
  kwaliteit: number;
  stiptheid: number;
  communicatie: number;
  prijs: number;
};

// Kolomnamen hier volgen de review_complete-view (herbouwd in migratie
// 0031 met expliciete Engelse kolommen i.p.v. de bevroren r.*-wildcard;
// de view zelf werd pas in migratie 0037 hernoemd van review_compleet).
export interface ReviewComplete {
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

export interface ProfessionalProfile {
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
  service_area_lat: number | null;
  service_area_lng: number | null;
  service_area_city: string | null;
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

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  photo_url: string | null;
  read_at: string | null;
  created_at: string;
}

export type NotificationType = "review" | "booking" | "message" | "invitation" | "group_discount" | "system" | "premium";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title_nl: string;
  title_en: string;
  content_nl: string | null;
  content_en: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface ConversationWithLastMessage {
  id: string;
  otherParticipant: { user_id: string; name: string; avatar_url: string | null } | null;
  lastMessage: { text: string; foto_url: string | null; created_at: string; sender_id: string } | null;
  unreadCount: number;
}

export type BookingStatus = "requested" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  customer_id: string;
  professional_id: string;
  category_id: string | null;
  community_id: string | null;
  description: string | null;
  foto_urls: string[];
  date: string | null;
  status: BookingStatus;
  price_cents: number | null;
  customer_notes: string | null;
  professional_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithCustomer extends Booking {
  customer_name: string;
  customer_avatar: string | null;
  community_name: string | null;
  category_name: string | null;
}

// professional_overview is herbouwd in migratie 0033 met expliciete Engelse
// kolommen i.p.v. de bevroren vp.*-wildcard, en volgt nu 1-op-1 de
// kolomnamen van professional_profiles — vandaar de extend. (De view
// zelf heette toen nog vakman_overzicht, pas in migratie 0037 hernoemd.)
export interface ProfessionalOverview extends ProfessionalProfile {
  owner_name: string;
  owner_avatar: string | null;
  completed_jobs: number;
  category_slugs: string[] | null;
  deactivated_at: string | null;
  deleted_at: string | null;
}
