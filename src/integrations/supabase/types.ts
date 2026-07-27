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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      card_design_versions: {
        Row: {
          card_id: string
          created_at: string
          design: Json
          id: string
          label: string | null
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          design: Json
          id?: string
          label?: string | null
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          design?: Json
          id?: string
          label?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_design_versions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_events: {
        Row: {
          card_id: string
          city: string | null
          country: string | null
          created_at: string
          device: string | null
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          card_id: string
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          card_id?: string
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "card_events_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          accent_color: string
          address: string | null
          avatar_url: string | null
          bio: string | null
          card_type: Database["public"]["Enums"]["card_type"]
          company: string | null
          company_id: string | null
          company_template_id: string | null
          cover_url: string | null
          created_at: string
          custom_values: Json
          department_id: string | null
          design: Json | null
          email: string | null
          extension: string | null
          id: string
          is_active: boolean
          is_published: boolean
          is_verified: boolean
          languages: string[]
          name: string
          phone: string | null
          slug: string
          socials: Json
          template: string
          title: string | null
          updated_at: string
          user_id: string
          view_count: number
          website: string | null
          whatsapp: string | null
          working_hours: string | null
        }
        Insert: {
          accent_color?: string
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          card_type?: Database["public"]["Enums"]["card_type"]
          company?: string | null
          company_id?: string | null
          company_template_id?: string | null
          cover_url?: string | null
          created_at?: string
          custom_values?: Json
          department_id?: string | null
          design?: Json | null
          email?: string | null
          extension?: string | null
          id?: string
          is_active?: boolean
          is_published?: boolean
          is_verified?: boolean
          languages?: string[]
          name: string
          phone?: string | null
          slug: string
          socials?: Json
          template?: string
          title?: string | null
          updated_at?: string
          user_id: string
          view_count?: number
          website?: string | null
          whatsapp?: string | null
          working_hours?: string | null
        }
        Update: {
          accent_color?: string
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          card_type?: Database["public"]["Enums"]["card_type"]
          company?: string | null
          company_id?: string | null
          company_template_id?: string | null
          cover_url?: string | null
          created_at?: string
          custom_values?: Json
          department_id?: string | null
          design?: Json | null
          email?: string | null
          extension?: string | null
          id?: string
          is_active?: boolean
          is_published?: boolean
          is_verified?: boolean
          languages?: string[]
          name?: string
          phone?: string | null
          slug?: string
          socials?: Json
          template?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number
          website?: string | null
          whatsapp?: string | null
          working_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_company_template_id_fkey"
            columns: ["company_template_id"]
            isOneToOne: false
            referencedRelation: "company_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "company_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          brand_primary: string
          brand_secondary: string
          city: string | null
          company_size: string | null
          contact_person: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          custom_domain: string | null
          default_template: string
          description: string | null
          email: string | null
          font_body: string | null
          font_heading: string | null
          founded_year: number | null
          id: string
          industry: string | null
          is_published: boolean
          is_verified: boolean
          legal_address: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          onboarded_at: string | null
          owner_id: string
          phone: string | null
          registration_number: string | null
          services: Json
          show_employees: boolean
          slug: string
          socials: Json
          tagline: string | null
          tax_number: string | null
          theme: string
          timezone: string | null
          updated_at: string
          verification_requested_at: string | null
          verification_status: string
          website: string | null
        }
        Insert: {
          address?: string | null
          brand_primary?: string
          brand_secondary?: string
          city?: string | null
          company_size?: string | null
          contact_person?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          custom_domain?: string | null
          default_template?: string
          description?: string | null
          email?: string | null
          font_body?: string | null
          font_heading?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_published?: boolean
          is_verified?: boolean
          legal_address?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          onboarded_at?: string | null
          owner_id: string
          phone?: string | null
          registration_number?: string | null
          services?: Json
          show_employees?: boolean
          slug: string
          socials?: Json
          tagline?: string | null
          tax_number?: string | null
          theme?: string
          timezone?: string | null
          updated_at?: string
          verification_requested_at?: string | null
          verification_status?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          brand_primary?: string
          brand_secondary?: string
          city?: string | null
          company_size?: string | null
          contact_person?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          custom_domain?: string | null
          default_template?: string
          description?: string | null
          email?: string | null
          font_body?: string | null
          font_heading?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_published?: boolean
          is_verified?: boolean
          legal_address?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          onboarded_at?: string | null
          owner_id?: string
          phone?: string | null
          registration_number?: string | null
          services?: Json
          show_employees?: boolean
          slug?: string
          socials?: Json
          tagline?: string | null
          tax_number?: string | null
          theme?: string
          timezone?: string | null
          updated_at?: string
          verification_requested_at?: string | null
          verification_status?: string
          website?: string | null
        }
        Relationships: []
      }
      company_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          company_id: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          company_id: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          company_id?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "company_audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_branches: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          country: string | null
          created_at: string
          email: string | null
          id: string
          map_url: string | null
          name: string
          phone: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          map_url?: string | null
          name: string
          phone?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          map_url?: string | null
          name?: string
          phone?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_brand_assets: {
        Row: {
          company_id: string
          created_at: string
          id: string
          kind: string
          label: string | null
          updated_at: string
          url: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          kind?: string
          label?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          kind?: string
          label?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_brand_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_custom_fields: {
        Row: {
          company_id: string
          created_at: string
          field_type: string
          id: string
          is_required: boolean
          key: string
          label: string
          permission: Database["public"]["Enums"]["field_permission"]
          sort_order: number
          updated_at: string
          visibility: Database["public"]["Enums"]["field_visibility"]
        }
        Insert: {
          company_id: string
          created_at?: string
          field_type?: string
          id?: string
          is_required?: boolean
          key: string
          label: string
          permission?: Database["public"]["Enums"]["field_permission"]
          sort_order?: number
          updated_at?: string
          visibility?: Database["public"]["Enums"]["field_visibility"]
        }
        Update: {
          company_id?: string
          created_at?: string
          field_type?: string
          id?: string
          is_required?: boolean
          key?: string
          label?: string
          permission?: Database["public"]["Enums"]["field_permission"]
          sort_order?: number
          updated_at?: string
          visibility?: Database["public"]["Enums"]["field_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "company_custom_fields_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_departments: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string
          department_id: string | null
          email: string | null
          expires_at: string
          id: string
          invited_by: string | null
          job_title: string | null
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["company_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          template_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string
          department_id?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          invited_by?: string | null
          job_title?: string | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          template_id?: string | null
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string
          department_id?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          invited_by?: string | null
          job_title?: string | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          template_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "company_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invitations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "company_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          corporate_email: string | null
          created_at: string
          department_id: string | null
          employee_code: string | null
          id: string
          job_title: string | null
          phone: string | null
          role: Database["public"]["Enums"]["company_role"]
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          corporate_email?: string | null
          created_at?: string
          department_id?: string | null
          employee_code?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          corporate_email?: string | null
          created_at?: string
          department_id?: string | null
          employee_code?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["company_role"]
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "company_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      company_templates: {
        Row: {
          accent_color: string
          company_id: string
          created_at: string
          department_id: string | null
          description: string | null
          design: Json | null
          id: string
          is_approved: boolean
          is_auto_assign: boolean
          is_default: boolean
          name: string
          sort_order: number
          target_role: Database["public"]["Enums"]["company_role"] | null
          template: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          company_id: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          design?: Json | null
          id?: string
          is_approved?: boolean
          is_auto_assign?: boolean
          is_default?: boolean
          name: string
          sort_order?: number
          target_role?: Database["public"]["Enums"]["company_role"] | null
          template?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          company_id?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          design?: Json | null
          id?: string
          is_approved?: boolean
          is_auto_assign?: boolean
          is_default?: boolean
          name?: string
          sort_order?: number
          target_role?: Database["public"]["Enums"]["company_role"] | null
          template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_templates_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "company_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      design_templates: {
        Row: {
          audience: string
          author_id: string
          author_name: string | null
          company_id: string | null
          created_at: string
          description: string | null
          design: Json
          id: string
          is_public: boolean
          preview_url: string | null
          tags: string[]
          title: string
          updated_at: string
          use_count: number
        }
        Insert: {
          audience?: string
          author_id: string
          author_name?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          design: Json
          id?: string
          is_public?: boolean
          preview_url?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          use_count?: number
        }
        Update: {
          audience?: string
          author_id?: string
          author_name?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          design?: Json
          id?: string
          is_public?: boolean
          preview_url?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "design_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          active_company_id: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarded_at: string | null
          preferred_lang: string | null
          updated_at: string
          username: string
        }
        Insert: {
          account_type?: string
          active_company_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          onboarded_at?: string | null
          preferred_lang?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          account_type?: string
          active_company_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded_at?: string | null
          preferred_lang?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_company_id_fkey"
            columns: ["active_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_cards: {
        Row: {
          accent_color: string
          address: string | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          socials: Json
          source: string
          source_card_id: string | null
          tags: string[]
          template: string
          title: string | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          accent_color?: string
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          socials?: Json
          source?: string
          source_card_id?: string | null
          tags?: string[]
          template?: string
          title?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          accent_color?: string
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          socials?: Json
          source?: string
          source_card_id?: string | null
          tags?: string[]
          template?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_cards_source_card_id_fkey"
            columns: ["source_card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      card_type: "personal" | "company" | "employee"
      company_role: "owner" | "admin" | "manager" | "employee" | "viewer"
      field_permission: "company_locked" | "employee_editable"
      field_visibility: "public" | "private" | "company_only"
      invitation_status: "pending" | "accepted" | "revoked" | "expired"
      member_status: "active" | "inactive" | "suspended" | "former"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      card_type: ["personal", "company", "employee"],
      company_role: ["owner", "admin", "manager", "employee", "viewer"],
      field_permission: ["company_locked", "employee_editable"],
      field_visibility: ["public", "private", "company_only"],
      invitation_status: ["pending", "accepted", "revoked", "expired"],
      member_status: ["active", "inactive", "suspended", "former"],
    },
  },
} as const
