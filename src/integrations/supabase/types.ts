export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      alert_settings: {
        Row: {
          anomaly_enabled: boolean;
          drought_enabled: boolean;
          min_severity: string;
          rain_enabled: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          anomaly_enabled?: boolean;
          drought_enabled?: boolean;
          min_severity?: string;
          rain_enabled?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          anomaly_enabled?: boolean;
          drought_enabled?: boolean;
          min_severity?: string;
          rain_enabled?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      alerts: {
        Row: {
          created_at: string;
          id: string;
          kind: string;
          message: string;
          read: boolean;
          severity: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind: string;
          message: string;
          read?: boolean;
          severity?: string;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          kind?: string;
          message?: string;
          read?: boolean;
          severity?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      inspection_cards: {
        Row: {
          created_at: string;
          created_by: string | null;
          farm: string;
          id: string;
          inspection_date: string;
          lab: string;
          notes: string | null;
          product_code: string | null;
          product_name: string;
          result: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          farm: string;
          id?: string;
          inspection_date?: string;
          lab: string;
          notes?: string | null;
          product_code?: string | null;
          product_name: string;
          result?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          farm?: string;
          id?: string;
          inspection_date?: string;
          lab?: string;
          notes?: string | null;
          product_code?: string | null;
          product_name?: string;
          result?: string;
        };
        Relationships: [];
      };
      news_items: {
        Row: {
          body: string;
          category: string;
          created_at: string;
          created_by: string | null;
          id: string;
          published_at: string;
          title: string;
        };
        Insert: {
          body: string;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          published_at?: string;
          title: string;
        };
        Update: {
          body?: string;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          published_at?: string;
          title?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          code: string;
          created_at: string;
          farm: string;
          image_url: string | null;
          name: string;
          produced_at: string;
          region: string;
          timeline: Json;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          farm: string;
          image_url?: string | null;
          name: string;
          produced_at: string;
          region: string;
          timeline?: Json;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          farm?: string;
          image_url?: string | null;
          name?: string;
          produced_at?: string;
          region?: string;
          timeline?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      ticket_messages: {
        Row: {
          author_id: string;
          author_type: string;
          content: string;
          created_at: string;
          id: string;
          ticket_id: string;
        };
        Insert: {
          author_id: string;
          author_type: string;
          content: string;
          created_at?: string;
          id?: string;
          ticket_id: string;
        };
        Update: {
          author_id?: string;
          author_type?: string;
          content?: string;
          created_at?: string;
          id?: string;
          ticket_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey";
            columns: ["ticket_id"];
            isOneToOne: false;
            referencedRelation: "tickets";
            referencedColumns: ["id"];
          },
        ];
      };
      tickets: {
        Row: {
          callback_phone: string | null;
          callback_requested: boolean;
          created_at: string;
          description: string;
          id: string;
          status: string;
          subject: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          callback_phone?: string | null;
          callback_requested?: boolean;
          created_at?: string;
          description: string;
          id?: string;
          status?: string;
          subject: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          callback_phone?: string | null;
          callback_requested?: boolean;
          created_at?: string;
          description?: string;
          id?: string;
          status?: string;
          subject?: string;
          updated_at?: string;
          user_id?: string;
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "farmer" | "consumer";
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
      app_role: ["admin", "farmer", "consumer"],
    },
  },
} as const;
