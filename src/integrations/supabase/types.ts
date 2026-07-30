export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          created_at: string;
          entity: string | null;
          entity_id: string | null;
          id: string;
          meta: Json | null;
          user_email: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          meta?: Json | null;
          user_email?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          meta?: Json | null;
          user_email?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      banners: {
        Row: {
          created_at: string;
          id: string;
          image_url: string;
          is_active: boolean;
          link_url: string | null;
          mobile_image_url: string | null;
          position: number;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url: string;
          is_active?: boolean;
          link_url?: string | null;
          mobile_image_url?: string | null;
          position?: number;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string;
          is_active?: boolean;
          link_url?: string | null;
          mobile_image_url?: string | null;
          position?: number;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          product_id: string;
          product_image: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          product_id: string;
          product_image?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          product_id?: string;
          product_image?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_status_history: {
        Row: {
          author_id: string | null;
          created_at: string;
          id: string;
          note: string | null;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
        };
        Insert: {
          author_id?: string | null;
          created_at?: string;
          id?: string;
          note?: string | null;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
        };
        Update: {
          author_id?: string | null;
          created_at?: string;
          id?: string;
          note?: string | null;
          order_id?: string;
          status?: Database["public"]["Enums"]["order_status"];
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string | null;
          id: string;
          notes: string | null;
          payment_method: string | null;
          shipping: number;
          shipping_address: Json;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          tracking_code: string | null;
          tracking_url: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          customer_email: string;
          customer_name: string;
          customer_phone?: string | null;
          id?: string;
          notes?: string | null;
          payment_method?: string | null;
          shipping?: number;
          shipping_address?: Json;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          tracking_code?: string | null;
          tracking_url?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string | null;
          id?: string;
          notes?: string | null;
          payment_method?: string | null;
          shipping?: number;
          shipping_address?: Json;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          tracking_code?: string | null;
          tracking_url?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          color: string | null;
          created_at: string;
          id: string;
          price_override: number | null;
          product_id: string;
          size: string | null;
          sku: string | null;
          stock: number;
          updated_at: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          id?: string;
          price_override?: number | null;
          product_id: string;
          size?: string | null;
          sku?: string | null;
          stock?: number;
          updated_at?: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          id?: string;
          price_override?: number | null;
          product_id?: string;
          size?: string | null;
          sku?: string | null;
          stock?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          brand: string | null;
          category_slug: string;
          colors: Json;
          created_at: string;
          description: string;
          discount: number | null;
          gallery: Json;
          id: string;
          image_url: string;
          is_active: boolean;
          is_featured: boolean;
          low_stock_threshold: number;
          name: string;
          old_price: number | null;
          price: number;
          rating: number;
          reviews: number;
          sizes: Json;
          slug: string;
          sku: string | null;
          stock: number;
          sub: string;
          tag: string | null;
          updated_at: string;
        };
        Insert: {
          brand?: string | null;
          category_slug: string;
          colors?: Json;
          created_at?: string;
          description?: string;
          discount?: number | null;
          gallery?: Json;
          id?: string;
          image_url?: string;
          is_active?: boolean;
          is_featured?: boolean;
          low_stock_threshold?: number;
          name: string;
          old_price?: number | null;
          price: number;
          rating?: number;
          reviews?: number;
          sizes?: Json;
          slug: string;
          sku?: string | null;
          stock?: number;
          sub?: string;
          tag?: string | null;
          updated_at?: string;
        };
        Update: {
          brand?: string | null;
          category_slug?: string;
          colors?: Json;
          created_at?: string;
          description?: string;
          discount?: number | null;
          gallery?: Json;
          id?: string;
          image_url?: string;
          is_active?: boolean;
          is_featured?: boolean;
          low_stock_threshold?: number;
          name?: string;
          old_price?: number | null;
          price?: number;
          rating?: number;
          reviews?: number;
          sizes?: Json;
          slug?: string;
          sku?: string | null;
          stock?: number;
          sub?: string;
          tag?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          address_city: string | null;
          address_complement: string | null;
          address_number: string | null;
          address_state: string | null;
          address_street: string | null;
          address_zip: string | null;
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address_city?: string | null;
          address_complement?: string | null;
          address_number?: string | null;
          address_state?: string | null;
          address_street?: string | null;
          address_zip?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address_city?: string | null;
          address_complement?: string | null;
          address_number?: string | null;
          address_state?: string | null;
          address_street?: string | null;
          address_zip?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock_movements: {
        Row: {
          author_id: string | null;
          created_at: string;
          id: string;
          kind: string;
          product_id: string;
          quantity: number;
          reason: string | null;
          variant_id: string | null;
        };
        Insert: {
          author_id?: string | null;
          created_at?: string;
          id?: string;
          kind: string;
          product_id: string;
          quantity: number;
          reason?: string | null;
          variant_id?: string | null;
        };
        Update: {
          author_id?: string | null;
          created_at?: string;
          id?: string;
          kind?: string;
          product_id?: string;
          quantity?: number;
          reason?: string | null;
          variant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value?: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: Json;
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
      [_ in never]: never;
    };
    Enums: {
      app_role: "admin" | "customer" | "funcionario";
      order_status: "pendente" | "pago" | "enviado" | "entregue" | "cancelado";
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
      app_role: ["admin", "customer", "funcionario"],
      order_status: ["pendente", "pago", "enviado", "entregue", "cancelado"],
    },
  },
} as const;
