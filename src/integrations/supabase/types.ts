export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      activities: {
        Row: {
          assigned_to: string;
          company_id: string | null;
          completed_at: string | null;
          contact_id: string | null;
          created_at: string;
          created_by: string;
          deal_id: string | null;
          description: string | null;
          due_at: string | null;
          id: string;
          priority: string;
          subject: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          assigned_to: string;
          company_id?: string | null;
          completed_at?: string | null;
          contact_id?: string | null;
          created_at?: string;
          created_by: string;
          deal_id?: string | null;
          description?: string | null;
          due_at?: string | null;
          id?: string;
          priority?: string;
          subject: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          assigned_to?: string;
          company_id?: string | null;
          completed_at?: string | null;
          contact_id?: string | null;
          created_at?: string;
          created_by?: string;
          deal_id?: string | null;
          description?: string | null;
          due_at?: string | null;
          id?: string;
          priority?: string;
          subject?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          company: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          owner_id: string;
          phone: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          company?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          owner_id?: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          company?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          address: string | null;
          annual_revenue: number | null;
          city: string | null;
          country: string | null;
          created_at: string;
          deleted_at: string | null;
          employee_count: number | null;
          id: string;
          industry: string | null;
          name: string;
          notes: string | null;
          owner_id: string;
          phone: string | null;
          status: string;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          annual_revenue?: number | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          employee_count?: number | null;
          id?: string;
          industry?: string | null;
          name: string;
          notes?: string | null;
          owner_id: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          annual_revenue?: number | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          employee_count?: number | null;
          id?: string;
          industry?: string | null;
          name?: string;
          notes?: string | null;
          owner_id?: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          company_id: string | null;
          created_at: string;
          deleted_at: string | null;
          email: string | null;
          first_name: string;
          id: string;
          is_primary: boolean;
          job_title: string | null;
          last_name: string;
          lifecycle_stage: string;
          mobile: string | null;
          notes: string | null;
          owner_id: string;
          phone: string | null;
          source: string | null;
          updated_at: string;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          is_primary?: boolean;
          job_title?: string | null;
          last_name: string;
          lifecycle_stage?: string;
          mobile?: string | null;
          notes?: string | null;
          owner_id: string;
          phone?: string | null;
          source?: string | null;
          updated_at?: string;
        };
        Update: {
          company_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          is_primary?: boolean;
          job_title?: string | null;
          last_name?: string;
          lifecycle_stage?: string;
          mobile?: string | null;
          notes?: string | null;
          owner_id?: string;
          phone?: string | null;
          source?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contacts_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      deal_stage_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          deal_id: string;
          from_stage_id: string | null;
          id: string;
          to_stage_id: string;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          deal_id: string;
          from_stage_id?: string | null;
          id?: string;
          to_stage_id: string;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          deal_id?: string;
          from_stage_id?: string | null;
          id?: string;
          to_stage_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deal_stage_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_stage_history_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_stage_history_from_stage_id_fkey";
            columns: ["from_stage_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_stage_history_to_stage_id_fkey";
            columns: ["to_stage_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
        ];
      };
      deals: {
        Row: {
          amount: number;
          closed_at: string | null;
          company_id: string | null;
          contact_id: string | null;
          created_at: string;
          currency: string;
          deleted_at: string | null;
          expected_close_date: string | null;
          id: string;
          lost_reason: string | null;
          owner_id: string;
          pipeline_id: string;
          position: number;
          probability: number;
          stage_id: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          amount?: number;
          closed_at?: string | null;
          company_id?: string | null;
          contact_id?: string | null;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          expected_close_date?: string | null;
          id?: string;
          lost_reason?: string | null;
          owner_id: string;
          pipeline_id: string;
          position?: number;
          probability?: number;
          stage_id: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          closed_at?: string | null;
          company_id?: string | null;
          contact_id?: string | null;
          created_at?: string;
          currency?: string;
          deleted_at?: string | null;
          expected_close_date?: string | null;
          id?: string;
          lost_reason?: string | null;
          owner_id?: string;
          pipeline_id?: string;
          position?: number;
          probability?: number;
          stage_id?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey";
            columns: ["pipeline_id"];
            isOneToOne: false;
            referencedRelation: "pipelines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_stage_id_fkey";
            columns: ["stage_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id"];
          },
        ];
      };
      nexo_clients: {
        Row: {
          campaigns: number;
          company: string;
          created_at: string;
          email: string;
          id: string;
          name: string;
          phone: string;
          revenue: number;
          status: string;
          user_id: string;
        };
        Insert: {
          campaigns?: number;
          company?: string;
          created_at?: string;
          email?: string;
          id?: string;
          name: string;
          phone?: string;
          revenue?: number;
          status?: string;
          user_id?: string;
        };
        Update: {
          campaigns?: number;
          company?: string;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          phone?: string;
          revenue?: number;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      nexo_leads: {
        Row: {
          company: string;
          created_at: string;
          email: string;
          id: string;
          name: string;
          phone: string;
          source: string;
          status: string;
          user_id: string;
          value: number;
        };
        Insert: {
          company?: string;
          created_at?: string;
          email?: string;
          id?: string;
          name: string;
          phone?: string;
          source?: string;
          status?: string;
          user_id?: string;
          value?: number;
        };
        Update: {
          company?: string;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          phone?: string;
          source?: string;
          status?: string;
          user_id?: string;
          value?: number;
        };
        Relationships: [];
      };
      nexo_profiles: {
        Row: {
          avatar_url: string | null;
          company: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      nexo_tasks: {
        Row: {
          assignee: string;
          client_id: string | null;
          created_at: string;
          description: string;
          due_date: string | null;
          id: string;
          priority: string;
          status: string;
          title: string;
          user_id: string;
        };
        Insert: {
          assignee?: string;
          client_id?: string | null;
          created_at?: string;
          description?: string;
          due_date?: string | null;
          id?: string;
          priority?: string;
          status?: string;
          title: string;
          user_id?: string;
        };
        Update: {
          assignee?: string;
          client_id?: string | null;
          created_at?: string;
          description?: string;
          due_date?: string | null;
          id?: string;
          priority?: string;
          status?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nexo_tasks_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "nexo_clients";
            referencedColumns: ["id"];
          },
        ];
      };
      pipelines: {
        Row: {
          created_at: string;
          id: string;
          is_default: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_default?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_default?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          is_active: boolean;
          manager_id: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string;
          id: string;
          is_active?: boolean;
          manager_id?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          manager_id?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      stages: {
        Row: {
          created_at: string;
          default_probability: number;
          id: string;
          name: string;
          pipeline_id: string;
          position: number;
          type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_probability?: number;
          id?: string;
          name: string;
          pipeline_id: string;
          position: number;
          type?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_probability?: number;
          id?: string;
          name?: string;
          pipeline_id?: string;
          position?: number;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stages_pipeline_id_fkey";
            columns: ["pipeline_id"];
            isOneToOne: false;
            referencedRelation: "pipelines";
            referencedColumns: ["id"];
          },
        ];
      };
      taggables: {
        Row: {
          created_at: string;
          id: string;
          tag_id: string;
          taggable_id: string;
          taggable_type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          tag_id: string;
          taggable_id: string;
          taggable_type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          tag_id?: string;
          taggable_id?: string;
          taggable_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "taggables_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_access_owner: { Args: { _owner: string }; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
      is_gerente: { Args: never; Returns: boolean };
      team_member_ids: {
        Args: { _uid: string };
        Returns: {
          id: string;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "gerente" | "vendedor";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gerente", "vendedor"],
    },
  },
} as const;
