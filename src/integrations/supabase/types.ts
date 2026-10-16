export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      album_likes: {
        Row: {
          album_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          album_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          album_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_likes_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          creche_id: string | null
          id: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          creche_id?: string | null
          id?: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          creche_id?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      attendance: {
        Row: {
          arrival_at: string | null
          child_id: string
          created_at: string
          day: string
          departure_at: string | null
          id: string
          note: string | null
          recorded_by: string | null
        }
        Insert: {
          arrival_at?: string | null
          child_id: string
          created_at?: string
          day?: string
          departure_at?: string | null
          id?: string
          note?: string | null
          recorded_by?: string | null
        }
        Update: {
          arrival_at?: string | null
          child_id?: string
          created_at?: string
          day?: string
          departure_at?: string | null
          id?: string
          note?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      child_moods: {
        Row: {
          child_id: string
          day: string
          kind: string
          mood: string
          set_by: string | null
          updated_at: string
        }
        Insert: {
          child_id: string
          day: string
          kind: string
          mood: string
          set_by?: string | null
          updated_at?: string
        }
        Update: {
          child_id?: string
          day?: string
          kind?: string
          mood?: string
          set_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_moods_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          active: boolean
          birth_date: string | null
          created_at: string
          creche_id: string
          first_name: string
          gender: Database["public"]["Enums"]["child_gender"] | null
          group_id: string | null
          id: string
          is_demo: boolean
          last_name: string
          notes: string | null
          photo_consent: boolean
          photo_path: string | null
          school: string | null
        }
        Insert: {
          active?: boolean
          birth_date?: string | null
          created_at?: string
          creche_id: string
          first_name: string
          gender?: Database["public"]["Enums"]["child_gender"] | null
          group_id?: string | null
          id?: string
          is_demo?: boolean
          last_name: string
          notes?: string | null
          photo_consent?: boolean
          photo_path?: string | null
          school?: string | null
        }
        Update: {
          active?: boolean
          birth_date?: string | null
          created_at?: string
          creche_id?: string
          first_name?: string
          gender?: Database["public"]["Enums"]["child_gender"] | null
          group_id?: string | null
          id?: string
          is_demo?: boolean
          last_name?: string
          notes?: string | null
          photo_consent?: boolean
          photo_path?: string | null
          school?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_archives: {
        Row: {
          child_id: string | null
          child_name: string
          created_at: string
          creche_id: string | null
          creche_name: string
          event: string
          file_path: string
          id: string
          signers: string | null
        }
        Insert: {
          child_id?: string | null
          child_name: string
          created_at?: string
          creche_id?: string | null
          creche_name?: string
          event: string
          file_path: string
          id?: string
          signers?: string | null
        }
        Update: {
          child_id?: string | null
          child_name?: string
          created_at?: string
          creche_id?: string | null
          creche_name?: string
          event?: string
          file_path?: string
          id?: string
          signers?: string | null
        }
        Relationships: []
      }
      creches: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          google_review_url: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          google_review_url?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          google_review_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      diaper_changes: {
        Row: {
          changed_at: string
          child_id: string
          cream: boolean
          created_at: string
          day: string
          id: string
          note: string | null
          recorded_by: string | null
          type: Database["public"]["Enums"]["diaper_type"]
        }
        Insert: {
          changed_at?: string
          child_id: string
          cream?: boolean
          created_at?: string
          day?: string
          id?: string
          note?: string | null
          recorded_by?: string | null
          type?: Database["public"]["Enums"]["diaper_type"]
        }
        Update: {
          changed_at?: string
          child_id?: string
          cream?: boolean
          created_at?: string
          day?: string
          id?: string
          note?: string | null
          recorded_by?: string | null
          type?: Database["public"]["Enums"]["diaper_type"]
        }
        Relationships: [
          {
            foreignKeyName: "diaper_changes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_contracts: {
        Row: {
          accepted_name: string | null
          child_id: string
          created_at: string
          data: Json
          docusign_envelope_id: string | null
          id: string
          planning: Json | null
          signed_at: string | null
          signed_pdf_path: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          accepted_name?: string | null
          child_id: string
          created_at?: string
          data?: Json
          docusign_envelope_id?: string | null
          id?: string
          planning?: Json | null
          signed_at?: string | null
          signed_pdf_path?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          accepted_name?: string | null
          child_id?: string
          created_at?: string
          data?: Json
          docusign_envelope_id?: string | null
          id?: string
          planning?: Json | null
          signed_at?: string | null
          signed_pdf_path?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_contracts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_entries: {
        Row: {
          arrival: string | null
          birth_date: string | null
          birth_note: string | null
          child_id: string | null
          contract_id: string | null
          created_at: string
          creche_id: string
          dates_note: string | null
          departure: string | null
          father_email: string | null
          father_phone: string | null
          forfait: string | null
          hours_per_week: number | null
          id: string
          info: string | null
          matricule: string | null
          mother_email: string | null
          mother_phone: string | null
          name: string
          school: string | null
          section: string
          sheet: string
          signed_by: string | null
          sort_order: number
          source: string
          tariff: string | null
          updated_at: string
        }
        Insert: {
          arrival?: string | null
          birth_date?: string | null
          birth_note?: string | null
          child_id?: string | null
          contract_id?: string | null
          created_at?: string
          creche_id: string
          dates_note?: string | null
          departure?: string | null
          father_email?: string | null
          father_phone?: string | null
          forfait?: string | null
          hours_per_week?: number | null
          id?: string
          info?: string | null
          matricule?: string | null
          mother_email?: string | null
          mother_phone?: string | null
          name: string
          school?: string | null
          section?: string
          sheet?: string
          signed_by?: string | null
          sort_order?: number
          source?: string
          tariff?: string | null
          updated_at?: string
        }
        Update: {
          arrival?: string | null
          birth_date?: string | null
          birth_note?: string | null
          child_id?: string | null
          contract_id?: string | null
          created_at?: string
          creche_id?: string
          dates_note?: string | null
          departure?: string | null
          father_email?: string | null
          father_phone?: string | null
          forfait?: string | null
          hours_per_week?: number | null
          id?: string
          info?: string | null
          matricule?: string | null
          mother_email?: string | null
          mother_phone?: string | null
          name?: string
          school?: string | null
          section?: string
          sheet?: string
          signed_by?: string | null
          sort_order?: number
          source?: string
          tariff?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      forecast_versions: {
        Row: {
          created_at: string
          created_by: string | null
          creche_id: string
          entries: number
          file_path: string
          id: string
          reason: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          creche_id: string
          entries?: number
          file_path: string
          id?: string
          reason: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          creche_id?: string
          entries?: number
          file_path?: string
          id?: string
          reason?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          creche_id: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          creche_id: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          creche_id?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          child_id: string
          created_at: string
          id: string
          parent_user_id: string
          relation: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          parent_user_id: string
          relation?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          parent_user_id?: string
          relation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardians_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          amount: Database["public"]["Enums"]["meal_amount"]
          at_time: string | null
          bottle_content: string | null
          bottle_ml: number | null
          child_id: string
          created_at: string
          day: string
          description: string | null
          end_time: string | null
          id: string
          moment: Database["public"]["Enums"]["meal_moment"]
          note: string | null
          recorded_by: string | null
        }
        Insert: {
          amount?: Database["public"]["Enums"]["meal_amount"]
          at_time?: string | null
          bottle_content?: string | null
          bottle_ml?: number | null
          child_id: string
          created_at?: string
          day?: string
          description?: string | null
          end_time?: string | null
          id?: string
          moment: Database["public"]["Enums"]["meal_moment"]
          note?: string | null
          recorded_by?: string | null
        }
        Update: {
          amount?: Database["public"]["Enums"]["meal_amount"]
          at_time?: string | null
          bottle_content?: string | null
          bottle_ml?: number | null
          child_id?: string
          created_at?: string
          day?: string
          description?: string | null
          end_time?: string | null
          id?: string
          moment?: Database["public"]["Enums"]["meal_moment"]
          note?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_events: {
        Row: {
          at_time: string
          child_id: string
          created_at: string
          day: string
          id: string
          kind: Database["public"]["Enums"]["medical_kind"]
          note: string | null
          recorded_by: string | null
          value: string | null
        }
        Insert: {
          at_time: string
          child_id: string
          created_at?: string
          day: string
          id?: string
          kind: Database["public"]["Enums"]["medical_kind"]
          note?: string | null
          recorded_by?: string | null
          value?: string | null
        }
        Update: {
          at_time?: string
          child_id?: string
          created_at?: string
          day?: string
          id?: string
          kind?: Database["public"]["Enums"]["medical_kind"]
          note?: string | null
          recorded_by?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_events_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_days: {
        Row: {
          allergens: string | null
          created_at: string
          dessert: string | null
          id: string
          lunch: string | null
          main_dish: string | null
          menu_week_id: string
          next_day_snack: string | null
          snack: string | null
          starch: string | null
          starter: string | null
          updated_at: string
          vegetables: string | null
          vegetarian: string | null
          weekday: number
        }
        Insert: {
          allergens?: string | null
          created_at?: string
          dessert?: string | null
          id?: string
          lunch?: string | null
          main_dish?: string | null
          menu_week_id: string
          next_day_snack?: string | null
          snack?: string | null
          starch?: string | null
          starter?: string | null
          updated_at?: string
          vegetables?: string | null
          vegetarian?: string | null
          weekday: number
        }
        Update: {
          allergens?: string | null
          created_at?: string
          dessert?: string | null
          id?: string
          lunch?: string | null
          main_dish?: string | null
          menu_week_id?: string
          next_day_snack?: string | null
          snack?: string | null
          starch?: string | null
          starter?: string | null
          updated_at?: string
          vegetables?: string | null
          vegetarian?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_days_menu_week_id_fkey"
            columns: ["menu_week_id"]
            isOneToOne: false
            referencedRelation: "menu_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_weeks: {
        Row: {
          created_at: string
          created_by: string | null
          creche_id: string
          id: string
          menu_type: Database["public"]["Enums"]["menu_kind"]
          note: string | null
          pdf_path: string | null
          published: boolean
          updated_at: string
          week_start: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          creche_id: string
          id?: string
          menu_type?: Database["public"]["Enums"]["menu_kind"]
          note?: string | null
          pdf_path?: string | null
          published?: boolean
          updated_at?: string
          week_start: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          creche_id?: string
          id?: string
          menu_type?: Database["public"]["Enums"]["menu_kind"]
          note?: string | null
          pdf_path?: string | null
          published?: boolean
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_weeks_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          child_id: string | null
          created_at: string
          created_by: string | null
          creche_id: string
          id: string
          last_message_at: string
          subject: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          created_by?: string | null
          creche_id: string
          id?: string
          last_message_at?: string
          subject: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          created_by?: string | null
          creche_id?: string
          id?: string
          last_message_at?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          image_paths: string[]
          id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          image_paths?: string[]
          id?: string
          sender_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          image_paths?: string[]
          id?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      naps: {
        Row: {
          child_id: string
          created_at: string
          day: string
          end_at: string | null
          id: string
          note: string | null
          quality: Database["public"]["Enums"]["nap_quality"]
          recorded_by: string | null
          start_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          day?: string
          end_at?: string | null
          id?: string
          note?: string | null
          quality?: Database["public"]["Enums"]["nap_quality"]
          recorded_by?: string | null
          start_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          day?: string
          end_at?: string | null
          id?: string
          note?: string | null
          quality?: Database["public"]["Enums"]["nap_quality"]
          recorded_by?: string | null
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "naps_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          ref_key: string
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          ref_key: string
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          ref_key?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_albums: {
        Row: {
          child_id: string | null
          created_at: string
          created_by: string | null
          creche_id: string
          description: string | null
          group_id: string | null
          id: string
          in_news: boolean
          title: string
          updated_at: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          created_by?: string | null
          creche_id: string
          description?: string | null
          group_id?: string | null
          id?: string
          in_news?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          created_by?: string | null
          creche_id?: string
          description?: string | null
          group_id?: string | null
          id?: string
          in_news?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_albums_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_albums_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_albums_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          album_id: string | null
          caption: string | null
          child_id: string | null
          created_at: string
          created_by: string | null
          creche_id: string
          id: string
          storage_path: string
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          child_id?: string | null
          created_at?: string
          created_by?: string | null
          creche_id: string
          id?: string
          storage_path: string
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          child_id?: string | null
          created_at?: string
          created_by?: string | null
          creche_id?: string
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      planning_days: {
        Row: {
          arrival: string | null
          child_id: string
          day: string
          departure: string | null
          id: string
          kind: string
          lunch: boolean
          note: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          arrival?: string | null
          child_id: string
          day: string
          departure?: string | null
          id?: string
          kind?: string
          lunch?: boolean
          note?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          arrival?: string | null
          child_id?: string
          day?: string
          departure?: string | null
          id?: string
          kind?: string
          lunch?: boolean
          note?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planning_days_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      planning_reminders: {
        Row: {
          child_id: string
          last_sent_at: string
          parent_user_id: string
          school_year: number
          sent_count: number
        }
        Insert: {
          child_id: string
          last_sent_at?: string
          parent_user_id: string
          school_year: number
          sent_count?: number
        }
        Update: {
          child_id?: string
          last_sent_at?: string
          parent_user_id?: string
          school_year?: number
          sent_count?: number
        }
        Relationships: []
      }
      planning_template_days: {
        Row: {
          arrival: string
          departure: string
          lunch: boolean
          template_id: string
          weekday: number
        }
        Insert: {
          arrival: string
          departure: string
          lunch?: boolean
          template_id: string
          weekday: number
        }
        Update: {
          arrival?: string
          departure?: string
          lunch?: boolean
          template_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "planning_template_days_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "planning_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      planning_templates: {
        Row: {
          child_id: string
          id: string
          months: number[]
          school_year: number
          updated_at: string
          updated_by: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          child_id: string
          id?: string
          months?: number[]
          school_year: number
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          child_id?: string
          id?: string
          months?: number[]
          school_year?: number
          updated_at?: string
          updated_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planning_templates_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          id: string
          label: string
          poll_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          label: string
          poll_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          label?: string
          poll_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          closes_at: string | null
          created_at: string
          created_by: string | null
          creche_id: string
          id: string
          question: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          creche_id: string
          id?: string
          question: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          created_by?: string | null
          creche_id?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_login_at: string | null
          full_name: string
          id: string
          language: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_login_at?: string | null
          full_name?: string
          id: string
          language?: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          language?: string
          phone?: string | null
        }
        Relationships: []
      }
      satisfaction_invites: {
        Row: {
          sent_at: string
          survey_id: string
          user_id: string
        }
        Insert: {
          sent_at?: string
          survey_id: string
          user_id: string
        }
        Update: {
          sent_at?: string
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_invites_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "satisfaction_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      satisfaction_responses: {
        Row: {
          answers: Json
          child_id: string | null
          comment: string | null
          created_at: string
          review_invited_at: string | null
          score: number
          survey_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          child_id?: string | null
          comment?: string | null
          created_at?: string
          review_invited_at?: string | null
          score: number
          survey_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          child_id?: string | null
          comment?: string | null
          created_at?: string
          review_invited_at?: string | null
          score?: number
          survey_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "satisfaction_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      satisfaction_surveys: {
        Row: {
          closes_on: string
          created_at: string
          created_by: string | null
          creche_id: string | null
          id: string
          opens_on: string
          question: string
          title: string
        }
        Insert: {
          closes_on: string
          created_at?: string
          created_by?: string | null
          creche_id?: string | null
          id?: string
          opens_on?: string
          question?: string
          title: string
        }
        Update: {
          closes_on?: string
          created_at?: string
          created_by?: string | null
          creche_id?: string | null
          id?: string
          opens_on?: string
          question?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_surveys_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_assignments: {
        Row: {
          created_at: string
          creche_id: string
          group_id: string | null
          id: string
          user_id: string
          weekly_hours: number
        }
        Insert: {
          created_at?: string
          creche_id: string
          group_id?: string | null
          id?: string
          user_id: string
          weekly_hours?: number
        }
        Update: {
          created_at?: string
          creche_id?: string
          group_id?: string | null
          id?: string
          user_id?: string
          weekly_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_creche_id_fkey"
            columns: ["creche_id"]
            isOneToOne: false
            referencedRelation: "creches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_reads: {
        Row: {
          id: string
          last_read_at: string
          thread_id: string
          user_id: string
        }
        Insert: {
          id?: string
          last_read_at?: string
          thread_id: string
          user_id: string
        }
        Update: {
          id?: string
          last_read_at?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_reads_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      transmissions: {
        Row: {
          activities: string[]
          at_time: string
          batch_id: string | null
          child_id: string
          created_at: string
          day: string
          group_id: string | null
          id: string
          observation: string | null
          recorded_by: string | null
          updated_at: string
          visible_to_parents: boolean
        }
        Insert: {
          activities?: string[]
          at_time?: string
          batch_id?: string | null
          child_id: string
          created_at?: string
          day?: string
          group_id?: string | null
          id?: string
          observation?: string | null
          recorded_by?: string | null
          updated_at?: string
          visible_to_parents?: boolean
        }
        Update: {
          activities?: string[]
          at_time?: string
          batch_id?: string | null
          child_id?: string
          created_at?: string
          day?: string
          group_id?: string | null
          id?: string
          observation?: string | null
          recorded_by?: string | null
          updated_at?: string
          visible_to_parents?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "transmissions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_planning_template: {
        Args: { _child_id: string; _school_year: number }
        Returns: number
      }
      can_access_thread: {
        Args: { _thread_id: string; _user_id: string }
        Returns: boolean
      }
      can_edit_child: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      can_edit_child_planning: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      can_edit_planning_day: {
        Args: { _child_id: string; _day: string; _user_id: string }
        Returns: boolean
      }
      can_manage_child: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_creche: {
        Args: { _creche_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_poll: {
        Args: { _poll_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_user: {
        Args: { _target_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_album: {
        Args: { _album_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_child: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_child_planning: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_poll: {
        Args: { _poll_id: string; _user_id: string }
        Returns: boolean
      }
      easter_sunday: { Args: { _year: number }; Returns: string }
      fill_planning_period: {
        Args: {
          _child_id: string
          _from_day: string
          _note?: string | null
          _to_day: string
          _week: Json
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_child_guardian: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      is_creche_parent: {
        Args: { _creche_id: string; _user_id: string }
        Returns: boolean
      }
      is_creche_director: {
        Args: { _creche_id: string; _user_id: string }
        Returns: boolean
      }
      is_creche_staff: {
        Args: { _creche_id: string; _user_id: string }
        Returns: boolean
      }
      lu_public_holiday: { Args: { _day: string }; Returns: string }
      satisfaction_results: { Args: { _survey_id: string }; Returns: Json }
      message_recipient_emails: {
        Args: { _message_id: string }
        Returns: {
          email: string
        }[]
      }
      mark_first_login: { Args: never; Returns: boolean }
      notify_child_parents: {
        Args: {
          _body: string
          _child_id: string
          _kind: string
          _link: string
          _ref_key: string
          _title: string
        }
        Returns: undefined
      }
      notify_creche_parents: {
        Args: {
          _body: string
          _creche_id: string
          _group_id: string
          _kind: string
          _link: string
          _ref_key: string
          _title: string
        }
        Returns: undefined
      }
      planning_edit_from: {
        Args: { _child_id: string; _user_id: string }
        Returns: string
      }
      rectify_planning_period: {
        Args: {
          _absent: boolean
          _arrival: string | null
          _child_id: string
          _departure: string | null
          _from_day: string
          _lunch?: boolean
          _note: string | null
          _reset?: boolean
          _to_day: string
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "educator" | "parent" | "director"
      child_gender: "garcon" | "fille"
      diaper_type: "pipi" | "selles" | "mixte" | "propre"
      meal_amount: "tout" | "partie" | "rien"
      meal_moment: "matin" | "dejeuner" | "gouter" | "biberon"
      medical_kind:
        | "temperature"
        | "perdolan"
        | "incident"
        | "soin_nez"
        | "soin_yeux"
      menu_kind: "bebe" | "moyen" | "enfant" | "foyer"
      nap_quality: "bien" | "agite" | "pas_dormi"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "educator", "parent", "director"],
      child_gender: ["garcon", "fille"],
      diaper_type: ["pipi", "selles", "mixte", "propre"],
      meal_amount: ["tout", "partie", "rien"],
      meal_moment: ["matin", "dejeuner", "gouter", "biberon"],
      medical_kind: ["temperature", "perdolan", "incident", "soin_nez", "soin_yeux"],
      menu_kind: ["bebe", "moyen", "enfant", "foyer"],
      nap_quality: ["bien", "agite", "pas_dormi"],
    },
  },
} as const
