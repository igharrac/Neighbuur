/**
 * GEGENEREERD BESTAND — niet handmatig bewerken.
 * Gegenereerd via scripts/generate-db-types.mjs vanuit het live PostgREST-
 * schema. Draai het script opnieuw na elke migratie om dit bestand te
 * synchroniseren met de database.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          subscription: Json;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription: Json;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription?: Json;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "push_subscriptions_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      professional_profiles: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          slug: string;
          kvk_number: string | null;
          kvk_verified: boolean | null;
          bio: string | null;
          website: string | null;
          logo_url: string | null;
          specialties: string[] | null;
          contact_preference: Database["public"]["Enums"]["contact_preference"] | null;
          service_area_postcode: string | null;
          service_area_km: number | null;
          insured: boolean | null;
          insurance_url: string | null;
          verified: boolean | null;
          registration_source: string | null;
          profile_strength: number | null;
          avg_score: number | null;
          review_count: number | null;
          response_time_min: number | null;
          mollie_account_id: string | null;
          created_at: string | null;
          updated_at: string | null;
          is_premium: boolean | null;
          premium_until: string | null;
          stripe_customer_id: string | null;
          requests_this_month: number | null;
          requests_limit: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          slug: string;
          kvk_number?: string | null;
          kvk_verified?: boolean | null;
          bio?: string | null;
          website?: string | null;
          logo_url?: string | null;
          specialties?: string[] | null;
          contact_preference?: Database["public"]["Enums"]["contact_preference"] | null;
          service_area_postcode?: string | null;
          service_area_km?: number | null;
          insured?: boolean | null;
          insurance_url?: string | null;
          verified?: boolean | null;
          registration_source?: string | null;
          profile_strength?: number | null;
          avg_score?: number | null;
          review_count?: number | null;
          response_time_min?: number | null;
          mollie_account_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_premium?: boolean | null;
          premium_until?: string | null;
          stripe_customer_id?: string | null;
          requests_this_month?: number | null;
          requests_limit?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          slug?: string;
          kvk_number?: string | null;
          kvk_verified?: boolean | null;
          bio?: string | null;
          website?: string | null;
          logo_url?: string | null;
          specialties?: string[] | null;
          contact_preference?: Database["public"]["Enums"]["contact_preference"] | null;
          service_area_postcode?: string | null;
          service_area_km?: number | null;
          insured?: boolean | null;
          insurance_url?: string | null;
          verified?: boolean | null;
          registration_source?: string | null;
          profile_strength?: number | null;
          avg_score?: number | null;
          review_count?: number | null;
          response_time_min?: number | null;
          mollie_account_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_premium?: boolean | null;
          premium_until?: string | null;
          stripe_customer_id?: string | null;
          requests_this_month?: number | null;
          requests_limit?: number | null;
        };
        Relationships: [
          { foreignKeyName: "professional_profiles_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      review_replies: {
        Row: {
          id: string;
          review_id: string;
          professional_id: string;
          text: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          review_id: string;
          professional_id: string;
          text: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          review_id?: string;
          professional_id?: string;
          text?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "review_replies_review_id_fkey"; columns: ["review_id"]; isOneToOne: false; referencedRelation: "reviews"; referencedColumns: ["id"] },
          { foreignKeyName: "review_replies_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professional_profiles"; referencedColumns: ["id"] },
        ];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          user_id?: string;
        };
        Relationships: [
          { foreignKeyName: "conversation_participants_conversation_id_fkey"; columns: ["conversation_id"]; isOneToOne: false; referencedRelation: "conversations"; referencedColumns: ["id"] },
          { foreignKeyName: "conversation_participants_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      community_content_blocks: {
        Row: {
          id: string;
          community_id: string;
          type: Database["public"]["Enums"]["content_block_type"];
          position: number;
          data: Json;
          active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          community_id: string;
          type: Database["public"]["Enums"]["content_block_type"];
          position?: number;
          data: Json;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          community_id?: string;
          type?: Database["public"]["Enums"]["content_block_type"];
          position?: number;
          data?: Json;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "community_content_blocks_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
      auth_photos: {
        Row: {
          id: string;
          url: string;
          category: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          category: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          category?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          avatar_url: string | null;
          language: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          language?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          language?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          booking_id: string | null;
          professional_id: string | null;
          customer_id: string | null;
          amount_cents: number;
          commission_cents: number | null;
          status: string | null;
          mollie_payment_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          professional_id?: string | null;
          customer_id?: string | null;
          amount_cents: number;
          commission_cents?: number | null;
          status?: string | null;
          mollie_payment_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          professional_id?: string | null;
          customer_id?: string | null;
          amount_cents?: number;
          commission_cents?: number | null;
          status?: string | null;
          mollie_payment_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "transactions_booking_id_fkey"; columns: ["booking_id"]; isOneToOne: false; referencedRelation: "bookings"; referencedColumns: ["id"] },
          { foreignKeyName: "transactions_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professional_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "transactions_customer_id_fkey"; columns: ["customer_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          professional_id: string;
          category_id: string | null;
          community_id: string | null;
          description: string | null;
          foto_urls: string[] | null;
          date: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          price_cents: number | null;
          mollie_payment_id: string | null;
          customer_notes: string | null;
          professional_notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          review_request_sent_at: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          professional_id: string;
          category_id?: string | null;
          community_id?: string | null;
          description?: string | null;
          foto_urls?: string[] | null;
          date?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          price_cents?: number | null;
          mollie_payment_id?: string | null;
          customer_notes?: string | null;
          professional_notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          review_request_sent_at?: string | null;
        };
        Update: {
          id?: string;
          customer_id?: string;
          professional_id?: string;
          category_id?: string | null;
          community_id?: string | null;
          description?: string | null;
          foto_urls?: string[] | null;
          date?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          price_cents?: number | null;
          mollie_payment_id?: string | null;
          customer_notes?: string | null;
          professional_notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          review_request_sent_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "bookings_customer_id_fkey"; columns: ["customer_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "bookings_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professional_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "bookings_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "bookings_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
      invitations: {
        Row: {
          id: string;
          inviter_id: string;
          code: string;
          community_id: string | null;
          used_by: string | null;
          used_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          inviter_id: string;
          code: string;
          community_id?: string | null;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          inviter_id?: string;
          code?: string;
          community_id?: string | null;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "invitations_inviter_id_fkey"; columns: ["inviter_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "invitations_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "invitations_used_by_fkey"; columns: ["used_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      districts: {
        Row: {
          id: string;
          name: string;
          city: string;
          postal_code: string | null;
          completion_date: string | null;
          home_count: number | null;
          slug: string;
          active: boolean | null;
          created_at: string | null;
          community_threshold: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          postal_code?: string | null;
          completion_date?: string | null;
          home_count?: number | null;
          slug: string;
          active?: boolean | null;
          created_at?: string | null;
          community_threshold?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string;
          postal_code?: string | null;
          completion_date?: string | null;
          home_count?: number | null;
          slug?: string;
          active?: boolean | null;
          created_at?: string | null;
          community_threshold?: number | null;
        };
        Relationships: [];
      };
      resident_profiles: {
        Row: {
          id: string;
          user_id: string;
          community_id: string | null;
          district_id: string | null;
          completion_date: string | null;
          address: string | null;
          invite_code: string | null;
          created_at: string | null;
          postal_code: string | null;
          house_number: string | null;
          house_number_suffix: string | null;
          building_label: string | null;
          show_community_suggestions: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          community_id?: string | null;
          district_id?: string | null;
          completion_date?: string | null;
          address?: string | null;
          invite_code?: string | null;
          created_at?: string | null;
          postal_code?: string | null;
          house_number?: string | null;
          house_number_suffix?: string | null;
          building_label?: string | null;
          show_community_suggestions?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          community_id?: string | null;
          district_id?: string | null;
          completion_date?: string | null;
          address?: string | null;
          invite_code?: string | null;
          created_at?: string | null;
          postal_code?: string | null;
          house_number?: string | null;
          house_number_suffix?: string | null;
          building_label?: string | null;
          show_community_suggestions?: boolean;
        };
        Relationships: [
          { foreignKeyName: "resident_profiles_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "resident_profiles_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "resident_profiles_district_id_fkey"; columns: ["district_id"]; isOneToOne: false; referencedRelation: "districts"; referencedColumns: ["id"] },
        ];
      };
      availability: {
        Row: {
          id: string;
          professional_id: string;
          date: string;
          status: Database["public"]["Enums"]["availability_status"];
        };
        Insert: {
          id?: string;
          professional_id: string;
          date: string;
          status?: Database["public"]["Enums"]["availability_status"];
        };
        Update: {
          id?: string;
          professional_id?: string;
          date?: string;
          status?: Database["public"]["Enums"]["availability_status"];
        };
        Relationships: [
          { foreignKeyName: "availability_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professional_profiles"; referencedColumns: ["id"] },
        ];
      };
      communities: {
        Row: {
          id: string;
          district_id: string;
          name: string;
          slug: string;
          type: string;
          description: string | null;
          banner_url: string | null;
          active: boolean | null;
          created_at: string | null;
          status: string;
          postcode_cluster: string | null;
        };
        Insert: {
          id?: string;
          district_id: string;
          name: string;
          slug: string;
          type?: string;
          description?: string | null;
          banner_url?: string | null;
          active?: boolean | null;
          created_at?: string | null;
          status?: string;
          postcode_cluster?: string | null;
        };
        Update: {
          id?: string;
          district_id?: string;
          name?: string;
          slug?: string;
          type?: string;
          description?: string | null;
          banner_url?: string | null;
          active?: boolean | null;
          created_at?: string | null;
          status?: string;
          postcode_cluster?: string | null;
        };
        Relationships: [
          { foreignKeyName: "communities_district_id_fkey"; columns: ["district_id"]; isOneToOne: false; referencedRelation: "districts"; referencedColumns: ["id"] },
        ];
      };
      review_votes: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          value: number;
        };
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          value?: number;
        };
        Update: {
          id?: string;
          review_id?: string;
          user_id?: string;
          value?: number;
        };
        Relationships: [
          { foreignKeyName: "review_votes_review_id_fkey"; columns: ["review_id"]; isOneToOne: false; referencedRelation: "reviews"; referencedColumns: ["id"] },
          { foreignKeyName: "review_votes_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      group_discount_participants: {
        Row: {
          id: string;
          group_discount_id: string;
          user_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          group_discount_id: string;
          user_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          group_discount_id?: string;
          user_id?: string;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "group_discount_participants_group_discount_id_fkey"; columns: ["group_discount_id"]; isOneToOne: false; referencedRelation: "group_discounts"; referencedColumns: ["id"] },
          { foreignKeyName: "group_discount_participants_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      group_discounts: {
        Row: {
          id: string;
          community_id: string;
          category_id: string | null;
          title_nl: string;
          title_en: string;
          description_nl: string | null;
          description_en: string | null;
          min_participants: number;
          price_normal: number | null;
          price_group: number | null;
          active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          community_id: string;
          category_id?: string | null;
          title_nl: string;
          title_en: string;
          description_nl?: string | null;
          description_en?: string | null;
          min_participants?: number;
          price_normal?: number | null;
          price_group?: number | null;
          active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          community_id?: string;
          category_id?: string | null;
          title_nl?: string;
          title_en?: string;
          description_nl?: string | null;
          description_en?: string | null;
          min_participants?: number;
          price_normal?: number | null;
          price_group?: number | null;
          active?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "group_discounts_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "group_discounts_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
        ];
      };
      work_photos: {
        Row: {
          id: string;
          professional_id: string;
          community_id: string | null;
          photo_url: string;
          caption: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          professional_id: string;
          community_id?: string | null;
          photo_url: string;
          caption?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          professional_id?: string;
          community_id?: string | null;
          photo_url?: string;
          caption?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "work_photos_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professional_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "work_photos_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          photo_url: string | null;
          read_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          photo_url?: string | null;
          read_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          text?: string;
          photo_url?: string | null;
          read_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "messages_conversation_id_fkey"; columns: ["conversation_id"]; isOneToOne: false; referencedRelation: "conversations"; referencedColumns: ["id"] },
          { foreignKeyName: "messages_sender_id_fkey"; columns: ["sender_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          role: string;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          role?: string;
          joined_at?: string | null;
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "community_members_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "community_members_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      platform_stats_daily: {
        Row: {
          id: string;
          snapshot_date: string;
          resident_count: number;
          professional_count: number;
          verified_professional_count: number;
          active_community_count: number;
          dormant_community_count: number;
          avg_members_per_community: number;
          bookings_total: number;
          bookings_completed: number;
          revenue_total_cents: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          snapshot_date: string;
          resident_count?: number;
          professional_count?: number;
          verified_professional_count?: number;
          active_community_count?: number;
          dormant_community_count?: number;
          avg_members_per_community?: number;
          bookings_total?: number;
          bookings_completed?: number;
          revenue_total_cents?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          snapshot_date?: string;
          resident_count?: number;
          professional_count?: number;
          verified_professional_count?: number;
          active_community_count?: number;
          dormant_community_count?: number;
          avg_members_per_community?: number;
          bookings_total?: number;
          bookings_completed?: number;
          revenue_total_cents?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          type: Database["public"]["Enums"]["category_type"];
          name_nl: string;
          name_en: string;
          description_nl: string | null;
          description_en: string | null;
          image_url: string | null;
          icon: string | null;
          sort_order: number | null;
          active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          type?: Database["public"]["Enums"]["category_type"];
          name_nl: string;
          name_en: string;
          description_nl?: string | null;
          description_en?: string | null;
          image_url?: string | null;
          icon?: string | null;
          sort_order?: number | null;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          type?: Database["public"]["Enums"]["category_type"];
          name_nl?: string;
          name_en?: string;
          description_nl?: string | null;
          description_en?: string | null;
          image_url?: string | null;
          icon?: string | null;
          sort_order?: number | null;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          author_id: string;
          professional_id: string;
          booking_id: string | null;
          community_id: string | null;
          text: string;
          scores: Json;
          foto_urls: string[] | null;
          upvote_score: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          author_id: string;
          professional_id: string;
          booking_id?: string | null;
          community_id?: string | null;
          text: string;
          scores: Json;
          foto_urls?: string[] | null;
          upvote_score?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          author_id?: string;
          professional_id?: string;
          booking_id?: string | null;
          community_id?: string | null;
          text?: string;
          scores?: Json;
          foto_urls?: string[] | null;
          upvote_score?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "reviews_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professional_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_booking_id_fkey"; columns: ["booking_id"]; isOneToOne: false; referencedRelation: "bookings"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          title_nl: string;
          title_en: string;
          content_nl: string | null;
          content_en: string | null;
          link: string | null;
          read: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          title_nl: string;
          title_en: string;
          content_nl?: string | null;
          content_en?: string | null;
          link?: string | null;
          read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          title_nl?: string;
          title_en?: string;
          content_nl?: string | null;
          content_en?: string | null;
          link?: string | null;
          read?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "notifications_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      conversations: {
        Row: {
          id: string;
          booking_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "conversations_booking_id_fkey"; columns: ["booking_id"]; isOneToOne: false; referencedRelation: "bookings"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: {
      community_overview: {
        Row: {
          id: string | null;
          district_id: string | null;
          name: string | null;
          slug: string | null;
          type: string | null;
          description: string | null;
          banner_url: string | null;
          active: boolean | null;
          created_at: string | null;
          district_name: string | null;
          district_city: string | null;
          member_count: string | null;
          review_count: string | null;
          active_deals: string | null;
        };
        Relationships: [
          { foreignKeyName: "community_overview_district_id_fkey"; columns: ["district_id"]; isOneToOne: false; referencedRelation: "districts"; referencedColumns: ["id"] },
        ];
      };
      professional_overview: {
        Row: {
          id: string | null;
          user_id: string | null;
          company_name: string | null;
          slug: string | null;
          kvk_number: string | null;
          kvk_verified: boolean | null;
          bio: string | null;
          website: string | null;
          logo_url: string | null;
          specialties: string[] | null;
          contact_preference: Database["public"]["Enums"]["contact_preference"] | null;
          service_area_postcode: string | null;
          service_area_km: number | null;
          insured: boolean | null;
          insurance_url: string | null;
          registration_source: string | null;
          verified: boolean | null;
          profile_strength: number | null;
          avg_score: number | null;
          review_count: number | null;
          is_premium: boolean | null;
          premium_until: string | null;
          requests_this_month: number | null;
          requests_limit: number | null;
          owner_name: string | null;
          owner_avatar: string | null;
          completed_jobs: number | null;
          category_slugs: string[] | null;
        };
        Relationships: [
          { foreignKeyName: "professional_overview_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      review_complete: {
        Row: {
          id: string | null;
          author_id: string | null;
          professional_id: string | null;
          booking_id: string | null;
          community_id: string | null;
          text: string | null;
          scores: Json | null;
          foto_urls: string[] | null;
          upvote_score: number | null;
          created_at: string | null;
          updated_at: string | null;
          author_name: string | null;
          author_avatar: string | null;
          community_name: string | null;
          reply_text: string | null;
          reply_date: string | null;
          reply_company: string | null;
          verified: boolean | null;
        };
        Relationships: [
          { foreignKeyName: "review_complete_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "review_complete_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professional_profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "review_complete_booking_id_fkey"; columns: ["booking_id"]; isOneToOne: false; referencedRelation: "bookings"; referencedColumns: ["id"] },
          { foreignKeyName: "review_complete_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
    };
    Functions: {
      calculate_profile_strength: {
        Args: { v_id: string };
        Returns: number;
      };
      can_request_booking: {
        Args: { p_vakman_id: string };
        Returns: boolean;
      };
      count_professional_completed_jobs: {
        Args: { p_vakman_id: string };
        Returns: number;
      };
      is_conversation_participant: {
        Args: { p_gesprek_id: string };
        Returns: boolean;
      };
      count_residents_in_cluster: {
        Args: { p_wijk_id: string; p_postcode: string; p_gebouw_label?: string | null };
        Returns: number;
      };
      start_community: {
        Args: { p_wijk_id: string; p_postcode: string; p_titel_nl: string | null };
        Returns: { id: string; slug: string; aangemaakt: boolean }[];
      };
      reset_monthly_requests: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      contact_preference: "phone" | "whatsapp" | "app";
      content_block_type: "hero_banner" | "text" | "image" | "reviews" | "group_discounts" | "residents" | "announcement" | "professional_spotlight";
      user_role: "resident" | "professional" | "community_admin" | "admin";
      booking_status: "requested" | "confirmed" | "completed" | "cancelled";
      availability_status: "available" | "booked";
      category_type: "professional" | "compare";
      notification_type: "review" | "booking" | "message" | "invitation" | "group_discount" | "system" | "premium";
    };
  };
}
