// Hand-written to match supabase/migrations/20260818190000_init_schema.sql and
// supabase/migrations/20260819120000_partners.sql.
// Regenerate with `supabase gen types typescript --db-url <url> --schema public`
// once Docker is available locally, and diff against this file before replacing it.

export type UserRole = 'customer' | 'partner' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';
export type PartnerBusinessType =
  | 'individual'
  | 'women'
  | 'cafe'
  | 'restaurant'
  | 'shop'
  | 'fitness_wellness'
  | 'community';
export type PartnerStatus = 'pending' | 'approved' | 'rejected';
export type OrderType = 'standard' | 'business';
export type DiscountType = 'percentage' | 'flat';
export type DiscountTarget = 'all' | 'category' | 'product' | 'subscription_plan' | 'partner' | 'wholesale';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string | null;
          phone: string | null;
          avatar: string | null;
          date_of_birth: string | null;
          preferences: string[];
          push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          avatar?: string | null;
          date_of_birth?: string | null;
          preferences?: string[];
          push_token?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          profile_id: string;
          label: string;
          full_name: string;
          phone: string;
          street: string;
          apartment: string | null;
          city: string;
          state: string;
          zip_code: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'addresses_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          image: string | null;
          icon: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          price: number;
          original_price: number | null;
          category_id: string | null;
          images: string[];
          unit: string | null;
          weight: string | null;
          nutrition: Record<string, unknown> | null;
          benefits: string[];
          ingredients: string[] | null;
          storage: string | null;
          consumption_tips: string[];
          is_featured: boolean;
          is_seasonal: boolean;
          is_best_seller: boolean;
          rating: number;
          review_count: number;
          stock: number;
          is_available: boolean;
          is_preorder: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          unit: string | null;
          delivery_frequency: string | null;
          items: string[];
          benefits: string[];
          is_popular: boolean;
          color: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscription_plans']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['subscription_plans']['Insert']>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          plan_id: string;
          status: SubscriptionStatus;
          address_id: string | null;
          next_delivery_date: string | null;
          started_at: string;
          paused_at: string | null;
          cancelled_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'started_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'subscriptions_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'subscription_plans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_address_id_fkey';
            columns: ['address_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          profile_id: string;
          status: OrderStatus;
          subtotal: number;
          delivery_fee: number;
          total: number;
          delivery_address_id: string | null;
          delivery_date: string | null;
          delivery_time: string | null;
          notes: string | null;
          order_type: OrderType;
          business_name: string | null;
          contact_person: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          payment_status: PaymentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at' | 'razorpay_order_id' | 'razorpay_payment_id' | 'razorpay_signature' | 'payment_status'> & {
          id?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          payment_status?: PaymentStatus;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'orders_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_delivery_address_id_fkey';
            columns: ['delivery_address_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          price: number;
          image: string | null;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      partners: {
        Row: {
          id: string;
          profile_id: string;
          business_type: PartnerBusinessType;
          business_name: string;
          contact_person: string;
          phone: string;
          address: string | null;
          status: PartnerStatus;
          platform_fee_percent: number;
          applied_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['partners']['Row'],
          'id' | 'status' | 'platform_fee_percent' | 'applied_at' | 'reviewed_at' | 'reviewed_by'
        > & {
          id?: string;
          status?: PartnerStatus;
          platform_fee_percent?: number;
        };
        Update: Partial<Database['public']['Tables']['partners']['Insert']> & {
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'partners_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      discounts: {
        Row: {
          id: string;
          code: string | null;
          description: string | null;
          discount_type: DiscountType;
          value: number;
          target: DiscountTarget;
          target_id: string | null;
          min_order_value: number | null;
          max_discount_amount: number | null;
          is_birthday_offer: boolean;
          is_active: boolean;
          starts_at: string | null;
          expires_at: string | null;
          usage_limit: number | null;
          used_count: number;
          created_at: string;
          created_by: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['discounts']['Row'],
          'id' | 'is_birthday_offer' | 'is_active' | 'used_count' | 'created_at'
        > & {
          id?: string;
          is_birthday_offer?: boolean;
          is_active?: boolean;
          used_count?: number;
        };
        Update: Partial<Database['public']['Tables']['discounts']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      verify_razorpay_payment: {
        Args: {
          p_order_id: string;
          p_razorpay_payment_id: string;
          p_razorpay_signature: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      subscription_status: SubscriptionStatus;
      partner_business_type: PartnerBusinessType;
      partner_status: PartnerStatus;
      discount_type: DiscountType;
      discount_target: DiscountTarget;
    };
    CompositeTypes: Record<string, never>;
  };
}
