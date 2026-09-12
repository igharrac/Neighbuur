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
      community_leden: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          rol: string;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          rol?: string;
          joined_at?: string | null;
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          rol?: string;
          joined_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "community_leden_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "community_leden_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
        ];
      };
      community_content_blokken: {
        Row: {
          id: string;
          community_id: string;
          type: Database["public"]["Enums"]["content_blok_type"];
          positie: number;
          data: Json;
          actief: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          community_id: string;
          type: Database["public"]["Enums"]["content_blok_type"];
          positie?: number;
          data: Json;
          actief?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          community_id?: string;
          type?: Database["public"]["Enums"]["content_blok_type"];
          positie?: number;
          data?: Json;
          actief?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "community_content_blokken_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
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
          { foreignKeyName: "push_subscriptions_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
        ];
      };
      berichten: {
        Row: {
          id: string;
          gesprek_id: string;
          van_id: string;
          tekst: string;
          foto_url: string | null;
          gelezen_op: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          gesprek_id: string;
          van_id: string;
          tekst: string;
          foto_url?: string | null;
          gelezen_op?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          gesprek_id?: string;
          van_id?: string;
          tekst?: string;
          foto_url?: string | null;
          gelezen_op?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "berichten_gesprek_id_fkey"; columns: ["gesprek_id"]; isOneToOne: false; referencedRelation: "gesprekken"; referencedColumns: ["id"] },
          { foreignKeyName: "berichten_van_id_fkey"; columns: ["van_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
        ];
      };
      beschikbaarheid: {
        Row: {
          id: string;
          vakman_id: string;
          datum: string;
          status: Database["public"]["Enums"]["beschikbaarheid_type"];
        };
        Insert: {
          id?: string;
          vakman_id: string;
          datum: string;
          status?: Database["public"]["Enums"]["beschikbaarheid_type"];
        };
        Update: {
          id?: string;
          vakman_id?: string;
          datum?: string;
          status?: Database["public"]["Enums"]["beschikbaarheid_type"];
        };
        Relationships: [
          { foreignKeyName: "beschikbaarheid_vakman_id_fkey"; columns: ["vakman_id"]; isOneToOne: false; referencedRelation: "vakman_profielen"; referencedColumns: ["id"] },
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
          { foreignKeyName: "review_replies_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "vakman_profielen"; referencedColumns: ["id"] },
        ];
      };
      categorieen: {
        Row: {
          id: string;
          slug: string;
          type: Database["public"]["Enums"]["categorie_type"];
          naam_nl: string;
          naam_en: string;
          beschrijving_nl: string | null;
          beschrijving_en: string | null;
          afbeelding_url: string | null;
          icoon: string | null;
          sorteer: number | null;
          actief: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          type?: Database["public"]["Enums"]["categorie_type"];
          naam_nl: string;
          naam_en: string;
          beschrijving_nl?: string | null;
          beschrijving_en?: string | null;
          afbeelding_url?: string | null;
          icoon?: string | null;
          sorteer?: number | null;
          actief?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          type?: Database["public"]["Enums"]["categorie_type"];
          naam_nl?: string;
          naam_en?: string;
          beschrijving_nl?: string | null;
          beschrijving_en?: string | null;
          afbeelding_url?: string | null;
          icoon?: string | null;
          sorteer?: number | null;
          actief?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      wijken: {
        Row: {
          id: string;
          naam: string;
          stad: string;
          postcode: string | null;
          opleverdatum: string | null;
          aantal_woningen: number | null;
          slug: string;
          actief: boolean | null;
          created_at: string | null;
          community_threshold: number | null;
        };
        Insert: {
          id?: string;
          naam: string;
          stad: string;
          postcode?: string | null;
          opleverdatum?: string | null;
          aantal_woningen?: number | null;
          slug: string;
          actief?: boolean | null;
          created_at?: string | null;
          community_threshold?: number | null;
        };
        Update: {
          id?: string;
          naam?: string;
          stad?: string;
          postcode?: string | null;
          opleverdatum?: string | null;
          aantal_woningen?: number | null;
          slug?: string;
          actief?: boolean | null;
          created_at?: string | null;
          community_threshold?: number | null;
        };
        Relationships: [];
      };
      bewoner_profielen: {
        Row: {
          id: string;
          user_id: string;
          community_id: string | null;
          wijk_id: string | null;
          opleverdatum: string | null;
          adres: string | null;
          uitnodigingscode: string | null;
          created_at: string | null;
          postcode: string | null;
          huisnummer: string | null;
          huisnummer_toevoeging: string | null;
          gebouw_label: string | null;
          toon_community_suggesties: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          community_id?: string | null;
          wijk_id?: string | null;
          opleverdatum?: string | null;
          adres?: string | null;
          uitnodigingscode?: string | null;
          created_at?: string | null;
          postcode?: string | null;
          huisnummer?: string | null;
          huisnummer_toevoeging?: string | null;
          gebouw_label?: string | null;
          toon_community_suggesties?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          community_id?: string | null;
          wijk_id?: string | null;
          opleverdatum?: string | null;
          adres?: string | null;
          uitnodigingscode?: string | null;
          created_at?: string | null;
          postcode?: string | null;
          huisnummer?: string | null;
          huisnummer_toevoeging?: string | null;
          gebouw_label?: string | null;
          toon_community_suggesties?: boolean;
        };
        Relationships: [
          { foreignKeyName: "bewoner_profielen_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
          { foreignKeyName: "bewoner_profielen_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "bewoner_profielen_wijk_id_fkey"; columns: ["wijk_id"]; isOneToOne: false; referencedRelation: "wijken"; referencedColumns: ["id"] },
        ];
      };
      groepskorting_deelnemers: {
        Row: {
          id: string;
          groepskorting_id: string;
          user_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          groepskorting_id: string;
          user_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          groepskorting_id?: string;
          user_id?: string;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "groepskorting_deelnemers_groepskorting_id_fkey"; columns: ["groepskorting_id"]; isOneToOne: false; referencedRelation: "groepskortingen"; referencedColumns: ["id"] },
          { foreignKeyName: "groepskorting_deelnemers_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
        ];
      };
      notificaties: {
        Row: {
          id: string;
          user_id: string;
          type: Database["public"]["Enums"]["notificatie_type"];
          titel_nl: string;
          titel_en: string;
          inhoud_nl: string | null;
          inhoud_en: string | null;
          link: string | null;
          gelezen: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database["public"]["Enums"]["notificatie_type"];
          titel_nl: string;
          titel_en: string;
          inhoud_nl?: string | null;
          inhoud_en?: string | null;
          link?: string | null;
          gelezen?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database["public"]["Enums"]["notificatie_type"];
          titel_nl?: string;
          titel_en?: string;
          inhoud_nl?: string | null;
          inhoud_en?: string | null;
          link?: string | null;
          gelezen?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "notificaties_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
        ];
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
          { foreignKeyName: "transactions_booking_id_fkey"; columns: ["booking_id"]; isOneToOne: false; referencedRelation: "boekingen"; referencedColumns: ["id"] },
          { foreignKeyName: "transactions_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "vakman_profielen"; referencedColumns: ["id"] },
          { foreignKeyName: "transactions_customer_id_fkey"; columns: ["customer_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
        ];
      };
      profielen: {
        Row: {
          id: string;
          naam: string;
          email: string | null;
          telefoon: string | null;
          rol: Database["public"]["Enums"]["user_role"];
          avatar_url: string | null;
          taal: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          naam: string;
          email?: string | null;
          telefoon?: string | null;
          rol?: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          taal?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          naam?: string;
          email?: string | null;
          telefoon?: string | null;
          rol?: Database["public"]["Enums"]["user_role"];
          avatar_url?: string | null;
          taal?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      boekingen: {
        Row: {
          id: string;
          klant_id: string;
          vakman_id: string;
          categorie_id: string | null;
          community_id: string | null;
          omschrijving: string | null;
          foto_urls: string[] | null;
          datum: string | null;
          status: Database["public"]["Enums"]["boeking_status"];
          prijs_cents: number | null;
          mollie_payment_id: string | null;
          notities_klant: string | null;
          notities_vakman: string | null;
          created_at: string | null;
          updated_at: string | null;
          review_verzoek_verstuurd_op: string | null;
        };
        Insert: {
          id?: string;
          klant_id: string;
          vakman_id: string;
          categorie_id?: string | null;
          community_id?: string | null;
          omschrijving?: string | null;
          foto_urls?: string[] | null;
          datum?: string | null;
          status?: Database["public"]["Enums"]["boeking_status"];
          prijs_cents?: number | null;
          mollie_payment_id?: string | null;
          notities_klant?: string | null;
          notities_vakman?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          review_verzoek_verstuurd_op?: string | null;
        };
        Update: {
          id?: string;
          klant_id?: string;
          vakman_id?: string;
          categorie_id?: string | null;
          community_id?: string | null;
          omschrijving?: string | null;
          foto_urls?: string[] | null;
          datum?: string | null;
          status?: Database["public"]["Enums"]["boeking_status"];
          prijs_cents?: number | null;
          mollie_payment_id?: string | null;
          notities_klant?: string | null;
          notities_vakman?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          review_verzoek_verstuurd_op?: string | null;
        };
        Relationships: [
          { foreignKeyName: "boekingen_klant_id_fkey"; columns: ["klant_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
          { foreignKeyName: "boekingen_vakman_id_fkey"; columns: ["vakman_id"]; isOneToOne: false; referencedRelation: "vakman_profielen"; referencedColumns: ["id"] },
          { foreignKeyName: "boekingen_categorie_id_fkey"; columns: ["categorie_id"]; isOneToOne: false; referencedRelation: "categorieen"; referencedColumns: ["id"] },
          { foreignKeyName: "boekingen_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
      gesprekken: {
        Row: {
          id: string;
          boeking_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          boeking_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          boeking_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "gesprekken_boeking_id_fkey"; columns: ["boeking_id"]; isOneToOne: false; referencedRelation: "boekingen"; referencedColumns: ["id"] },
        ];
      };
      gesprek_deelnemers: {
        Row: {
          gesprek_id: string;
          user_id: string;
        };
        Insert: {
          gesprek_id: string;
          user_id: string;
        };
        Update: {
          gesprek_id?: string;
          user_id?: string;
        };
        Relationships: [
          { foreignKeyName: "gesprek_deelnemers_gesprek_id_fkey"; columns: ["gesprek_id"]; isOneToOne: false; referencedRelation: "gesprekken"; referencedColumns: ["id"] },
          { foreignKeyName: "gesprek_deelnemers_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
        ];
      };
      communities: {
        Row: {
          id: string;
          wijk_id: string;
          naam: string;
          slug: string;
          type: string;
          beschrijving: string | null;
          banner_url: string | null;
          actief: boolean | null;
          created_at: string | null;
          status: string;
          postcode_cluster: string | null;
        };
        Insert: {
          id?: string;
          wijk_id: string;
          naam: string;
          slug: string;
          type?: string;
          beschrijving?: string | null;
          banner_url?: string | null;
          actief?: boolean | null;
          created_at?: string | null;
          status?: string;
          postcode_cluster?: string | null;
        };
        Update: {
          id?: string;
          wijk_id?: string;
          naam?: string;
          slug?: string;
          type?: string;
          beschrijving?: string | null;
          banner_url?: string | null;
          actief?: boolean | null;
          created_at?: string | null;
          status?: string;
          postcode_cluster?: string | null;
        };
        Relationships: [
          { foreignKeyName: "communities_wijk_id_fkey"; columns: ["wijk_id"]; isOneToOne: false; referencedRelation: "wijken"; referencedColumns: ["id"] },
        ];
      };
      review_votes: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          waarde: number;
        };
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          waarde?: number;
        };
        Update: {
          id?: string;
          review_id?: string;
          user_id?: string;
          waarde?: number;
        };
        Relationships: [
          { foreignKeyName: "review_votes_review_id_fkey"; columns: ["review_id"]; isOneToOne: false; referencedRelation: "reviews"; referencedColumns: ["id"] },
          { foreignKeyName: "review_votes_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
        ];
      };
      vakman_profielen: {
        Row: {
          id: string;
          user_id: string;
          bedrijfsnaam: string;
          slug: string;
          kvk_nummer: string | null;
          kvk_geverifieerd: boolean | null;
          bio: string | null;
          website: string | null;
          logo_url: string | null;
          specialismes: string[] | null;
          contact_voorkeur: Database["public"]["Enums"]["contact_voorkeur"] | null;
          werkgebied_postcode: string | null;
          werkgebied_km: number | null;
          verzekerd: boolean | null;
          verzekering_url: string | null;
          geverifieerd: boolean | null;
          registratie_bron: string | null;
          profiel_sterkte: number | null;
          gem_score: number | null;
          aantal_reviews: number | null;
          reactietijd_min: number | null;
          mollie_account_id: string | null;
          created_at: string | null;
          updated_at: string | null;
          is_premium: boolean | null;
          premium_tot: string | null;
          stripe_customer_id: string | null;
          aanvragen_deze_maand: number | null;
          aanvragen_limiet: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          bedrijfsnaam: string;
          slug: string;
          kvk_nummer?: string | null;
          kvk_geverifieerd?: boolean | null;
          bio?: string | null;
          website?: string | null;
          logo_url?: string | null;
          specialismes?: string[] | null;
          contact_voorkeur?: Database["public"]["Enums"]["contact_voorkeur"] | null;
          werkgebied_postcode?: string | null;
          werkgebied_km?: number | null;
          verzekerd?: boolean | null;
          verzekering_url?: string | null;
          geverifieerd?: boolean | null;
          registratie_bron?: string | null;
          profiel_sterkte?: number | null;
          gem_score?: number | null;
          aantal_reviews?: number | null;
          reactietijd_min?: number | null;
          mollie_account_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_premium?: boolean | null;
          premium_tot?: string | null;
          stripe_customer_id?: string | null;
          aanvragen_deze_maand?: number | null;
          aanvragen_limiet?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          bedrijfsnaam?: string;
          slug?: string;
          kvk_nummer?: string | null;
          kvk_geverifieerd?: boolean | null;
          bio?: string | null;
          website?: string | null;
          logo_url?: string | null;
          specialismes?: string[] | null;
          contact_voorkeur?: Database["public"]["Enums"]["contact_voorkeur"] | null;
          werkgebied_postcode?: string | null;
          werkgebied_km?: number | null;
          verzekerd?: boolean | null;
          verzekering_url?: string | null;
          geverifieerd?: boolean | null;
          registratie_bron?: string | null;
          profiel_sterkte?: number | null;
          gem_score?: number | null;
          aantal_reviews?: number | null;
          reactietijd_min?: number | null;
          mollie_account_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_premium?: boolean | null;
          premium_tot?: string | null;
          stripe_customer_id?: string | null;
          aanvragen_deze_maand?: number | null;
          aanvragen_limiet?: number | null;
        };
        Relationships: [
          { foreignKeyName: "vakman_profielen_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
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
          { foreignKeyName: "work_photos_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "vakman_profielen"; referencedColumns: ["id"] },
          { foreignKeyName: "work_photos_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
      groepskortingen: {
        Row: {
          id: string;
          community_id: string;
          categorie_id: string | null;
          titel_nl: string;
          titel_en: string;
          beschrijving_nl: string | null;
          beschrijving_en: string | null;
          min_deelnemers: number;
          prijs_normaal: number | null;
          prijs_groep: number | null;
          actief: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          community_id: string;
          categorie_id?: string | null;
          titel_nl: string;
          titel_en: string;
          beschrijving_nl?: string | null;
          beschrijving_en?: string | null;
          min_deelnemers?: number;
          prijs_normaal?: number | null;
          prijs_groep?: number | null;
          actief?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          community_id?: string;
          categorie_id?: string | null;
          titel_nl?: string;
          titel_en?: string;
          beschrijving_nl?: string | null;
          beschrijving_en?: string | null;
          min_deelnemers?: number;
          prijs_normaal?: number | null;
          prijs_groep?: number | null;
          actief?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "groepskortingen_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "groepskortingen_categorie_id_fkey"; columns: ["categorie_id"]; isOneToOne: false; referencedRelation: "categorieen"; referencedColumns: ["id"] },
        ];
      };
      uitnodigingen: {
        Row: {
          id: string;
          uitnodiger_id: string;
          code: string;
          community_id: string | null;
          gebruikt_door: string | null;
          gebruikt_op: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          uitnodiger_id: string;
          code: string;
          community_id?: string | null;
          gebruikt_door?: string | null;
          gebruikt_op?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          uitnodiger_id?: string;
          code?: string;
          community_id?: string | null;
          gebruikt_door?: string | null;
          gebruikt_op?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "uitnodigingen_uitnodiger_id_fkey"; columns: ["uitnodiger_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
          { foreignKeyName: "uitnodigingen_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "uitnodigingen_gebruikt_door_fkey"; columns: ["gebruikt_door"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
        ];
      };
      reviews: {
        Row: {
          id: string;
          auteur_id: string;
          vakman_id: string;
          boeking_id: string | null;
          community_id: string | null;
          tekst: string;
          scores: Json;
          foto_urls: string[] | null;
          upvote_score: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          auteur_id: string;
          vakman_id: string;
          boeking_id?: string | null;
          community_id?: string | null;
          tekst: string;
          scores: Json;
          foto_urls?: string[] | null;
          upvote_score?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          auteur_id?: string;
          vakman_id?: string;
          boeking_id?: string | null;
          community_id?: string | null;
          tekst?: string;
          scores?: Json;
          foto_urls?: string[] | null;
          upvote_score?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "reviews_auteur_id_fkey"; columns: ["auteur_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_vakman_id_fkey"; columns: ["vakman_id"]; isOneToOne: false; referencedRelation: "vakman_profielen"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_boeking_id_fkey"; columns: ["boeking_id"]; isOneToOne: false; referencedRelation: "boekingen"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: {
      review_compleet: {
        Row: {
          id: string | null;
          auteur_id: string | null;
          vakman_id: string | null;
          boeking_id: string | null;
          community_id: string | null;
          tekst: string | null;
          scores: Json | null;
          foto_urls: string[] | null;
          upvote_score: number | null;
          created_at: string | null;
          updated_at: string | null;
          auteur_naam: string | null;
          auteur_avatar: string | null;
          community_naam: string | null;
          reactie_tekst: string | null;
          reactie_datum: string | null;
          reactie_bedrijf: string | null;
          geverifieerd: boolean | null;
        };
        Relationships: [
          { foreignKeyName: "review_compleet_auteur_id_fkey"; columns: ["auteur_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
          { foreignKeyName: "review_compleet_vakman_id_fkey"; columns: ["vakman_id"]; isOneToOne: false; referencedRelation: "vakman_profielen"; referencedColumns: ["id"] },
          { foreignKeyName: "review_compleet_boeking_id_fkey"; columns: ["boeking_id"]; isOneToOne: false; referencedRelation: "boekingen"; referencedColumns: ["id"] },
          { foreignKeyName: "review_compleet_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
        ];
      };
      vakman_overzicht: {
        Row: {
          id: string | null;
          user_id: string | null;
          bedrijfsnaam: string | null;
          slug: string | null;
          kvk_nummer: string | null;
          kvk_geverifieerd: boolean | null;
          bio: string | null;
          website: string | null;
          logo_url: string | null;
          specialismes: string[] | null;
          contact_voorkeur: Database["public"]["Enums"]["contact_voorkeur"] | null;
          werkgebied_postcode: string | null;
          werkgebied_km: number | null;
          verzekerd: boolean | null;
          verzekering_url: string | null;
          geverifieerd: boolean | null;
          registratie_bron: string | null;
          profiel_sterkte: number | null;
          gem_score: number | null;
          aantal_reviews: number | null;
          reactietijd_min: number | null;
          mollie_account_id: string | null;
          created_at: string | null;
          updated_at: string | null;
          is_premium: boolean | null;
          premium_tot: string | null;
          stripe_customer_id: string | null;
          aanvragen_deze_maand: number | null;
          aanvragen_limiet: number | null;
          eigenaar_naam: string | null;
          eigenaar_avatar: string | null;
          review_count: string | null;
          score_kwaliteit: number | null;
          afgeronde_klussen: number | null;
          categorie_slugs: string[] | null;
        };
        Relationships: [
          { foreignKeyName: "vakman_overzicht_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profielen"; referencedColumns: ["id"] },
        ];
      };
      community_overzicht: {
        Row: {
          id: string | null;
          wijk_id: string | null;
          naam: string | null;
          slug: string | null;
          type: string | null;
          beschrijving: string | null;
          banner_url: string | null;
          actief: boolean | null;
          created_at: string | null;
          wijk_naam: string | null;
          wijk_stad: string | null;
          aantal_leden: string | null;
          aantal_reviews: string | null;
          lopende_acties: string | null;
        };
        Relationships: [
          { foreignKeyName: "community_overzicht_wijk_id_fkey"; columns: ["wijk_id"]; isOneToOne: false; referencedRelation: "wijken"; referencedColumns: ["id"] },
        ];
      };
    };
    Functions: {
      bereken_profiel_sterkte: {
        Args: { v_id: string };
        Returns: number;
      };
      kan_boeking_aanvragen: {
        Args: { p_vakman_id: string };
        Returns: boolean;
      };
      vakman_afgeronde_klussen: {
        Args: { p_vakman_id: string };
        Returns: number;
      };
      is_gesprek_deelnemer: {
        Args: { p_gesprek_id: string };
        Returns: boolean;
      };
      bewoners_cluster_telling: {
        Args: { p_wijk_id: string; p_postcode: string; p_gebouw_label?: string | null };
        Returns: number;
      };
      start_community: {
        Args: { p_wijk_id: string; p_postcode: string; p_titel_nl: string | null };
        Returns: { id: string; slug: string; aangemaakt: boolean }[];
      };
    };
    Enums: {
      content_blok_type: "hero_banner" | "tekst" | "afbeelding" | "reviews" | "groepskortingen" | "bewoners" | "aankondiging" | "vakman_spotlight";
      beschikbaarheid_type: "beschikbaar" | "bezet";
      categorie_type: "vakman" | "vergelijk";
      notificatie_type: "review" | "boeking" | "bericht" | "uitnodiging" | "groepskorting" | "systeem" | "premium";
      user_role: "bewoner" | "vakman" | "community_beheerder" | "admin";
      boeking_status: "aangevraagd" | "bevestigd" | "afgerond" | "geannuleerd";
      contact_voorkeur: "telefoon" | "whatsapp" | "app";
    };
  };
}
