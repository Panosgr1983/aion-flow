export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // User Management
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          email: string
          avatar_url: string | null
          role: 'admin' | 'manager' | 'user'
          language: string
          timezone: string
          notification_preferences: Json
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          email: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'user'
          language?: string
          timezone?: string
          notification_preferences?: Json
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          email?: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'user'
          language?: string
          timezone?: string
          notification_preferences?: Json
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Product Management
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          sku: string
          price: number
          compare_price: number | null
          cost_price: number | null
          track_inventory: boolean
          stock_quantity: number
          low_stock_threshold: number
          weight: number | null
          dimensions: Json | null
          images: string[]
          category_id: string | null
          brand: string | null
          tags: string[]
          is_active: boolean
          is_featured: boolean
          is_digital: boolean
          digital_file_url: string | null
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          sku: string
          price: number
          compare_price?: number | null
          cost_price?: number | null
          track_inventory?: boolean
          stock_quantity?: number
          low_stock_threshold?: number
          weight?: number | null
          dimensions?: Json | null
          images?: string[]
          category_id?: string | null
          brand?: string | null
          tags?: string[]
          is_active?: boolean
          is_featured?: boolean
          is_digital?: boolean
          digital_file_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          sku?: string
          price?: number
          compare_price?: number | null
          cost_price?: number | null
          track_inventory?: boolean
          stock_quantity?: number
          low_stock_threshold?: number
          weight?: number | null
          dimensions?: Json | null
          images?: string[]
          category_id?: string | null
          brand?: string | null
          tags?: string[]
          is_active?: boolean
          is_featured?: boolean
          is_digital?: boolean
          digital_file_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string
          price_modifier: number
          stock_quantity: number
          attributes: Json
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          sku: string
          price_modifier?: number
          stock_quantity?: number
          attributes?: Json
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          sku?: string
          price_modifier?: number
          stock_quantity?: number
          attributes?: Json
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // Order Management
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method: string | null
          payment_intent_id: string | null
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          total_amount: number
          currency: string
          billing_address: Json
          shipping_address: Json
          notes: string | null
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          payment_intent_id?: string | null
          subtotal: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount: number
          currency?: string
          billing_address: Json
          shipping_address: Json
          notes?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_method?: string | null
          payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount?: number
          currency?: string
          billing_address?: Json
          shipping_address?: Json
          notes?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          product_name: string
          product_sku: string
          product_image: string | null
          attributes: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id?: string | null
          quantity: number
          unit_price: number
          total_price: number
          product_name: string
          product_sku: string
          product_image?: string | null
          attributes?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          product_name?: string
          product_sku?: string
          product_image?: string | null
          attributes?: Json | null
          created_at?: string
        }
      }

      // Customer Management
      customers: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          company: string | null
          billing_address: Json | null
          shipping_address: Json | null
          tax_id: string | null
          accepts_marketing: boolean
          email_verified: boolean
          total_orders: number
          total_spent: number
          average_order_value: number
          last_order_date: string | null
          loyalty_points: number
          membership_level: 'bronze' | 'silver' | 'gold' | 'platinum'
          tags: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          company?: string | null
          billing_address?: Json | null
          shipping_address?: Json | null
          tax_id?: string | null
          accepts_marketing?: boolean
          email_verified?: boolean
          total_orders?: number
          total_spent?: number
          average_order_value?: number
          last_order_date?: string | null
          loyalty_points?: number
          membership_level?: 'bronze' | 'silver' | 'gold' | 'platinum'
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          company?: string | null
          billing_address?: Json | null
          shipping_address?: Json | null
          tax_id?: string | null
          accepts_marketing?: boolean
          email_verified?: boolean
          total_orders?: number
          total_spent?: number
          average_order_value?: number
          last_order_date?: string | null
          loyalty_points?: number
          membership_level?: 'bronze' | 'silver' | 'gold' | 'platinum'
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Subscription Management
      subscriptions: {
        Row: {
          id: string
          customer_id: string
          plan_id: string
          status: 'active' | 'paused' | 'cancelled' | 'expired' | 'trial'
          current_period_start: string
          current_period_end: string
          trial_end: string | null
          cancel_at_period_end: boolean
          cancelled_at: string | null
          payment_method_id: string | null
          billing_cycle: 'monthly' | 'yearly' | 'weekly'
          price: number
          currency: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          plan_id: string
          status?: 'active' | 'paused' | 'cancelled' | 'expired' | 'trial'
          current_period_start: string
          current_period_end: string
          trial_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          payment_method_id?: string | null
          billing_cycle?: 'monthly' | 'yearly' | 'weekly'
          price: number
          currency?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          plan_id?: string
          status?: 'active' | 'paused' | 'cancelled' | 'expired' | 'trial'
          current_period_start?: string
          current_period_end?: string
          trial_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          payment_method_id?: string | null
          billing_cycle?: 'monthly' | 'yearly' | 'weekly'
          price?: number
          currency?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }

      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          currency: string
          billing_cycle: 'monthly' | 'yearly' | 'weekly'
          trial_days: number
          features: Json
          is_active: boolean
          max_users: number | null
          storage_limit: number | null
          api_calls_limit: number | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          currency?: string
          billing_cycle?: 'monthly' | 'yearly' | 'weekly'
          trial_days?: number
          features?: Json
          is_active?: boolean
          max_users?: number | null
          storage_limit?: number | null
          api_calls_limit?: number | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          billing_cycle?: 'monthly' | 'yearly' | 'weekly'
          trial_days?: number
          features?: Json
          is_active?: boolean
          max_users?: number | null
          storage_limit?: number | null
          api_calls_limit?: number | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }

      // Media Management
      media: {
        Row: {
          id: string
          name: string
          file_name: string
          url: string
          type: string
          size: number
          folder: string
          alt_text: string | null
          caption: string | null
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          file_name: string
          url: string
          type: string
          size: number
          folder?: string
          alt_text?: string | null
          caption?: string | null
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          file_name?: string
          url?: string
          type?: string
          size?: number
          folder?: string
          alt_text?: string | null
          caption?: string | null
          uploaded_by?: string
          created_at?: string
          updated_at?: string
        }
      }

      // Analytics & Reporting
      analytics_events: {
        Row: {
          id: string
          event_type: string
          event_data: Json
          user_id: string | null
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          url: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          event_data?: Json
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          url?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          event_data?: Json
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          url?: string | null
          referrer?: string | null
          created_at?: string
        }
      }

      // Settings & Configuration
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          category: string
          description: string | null
          is_public: boolean
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          category: string
          description?: string | null
          is_public?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          category?: string
          description?: string | null
          is_public?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Coupons & Discounts
      coupons: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed' | 'free_shipping'
          value: number
          min_order_amount: number | null
          max_uses: number | null
          used_count: number
          starts_at: string | null
          expires_at: string | null
          is_active: boolean
          applicable_products: string[] | null
          applicable_categories: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type?: 'percentage' | 'fixed' | 'free_shipping'
          value: number
          min_order_amount?: number | null
          max_uses?: number | null
          used_count?: number
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          applicable_products?: string[] | null
          applicable_categories?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: 'percentage' | 'fixed' | 'free_shipping'
          value?: number
          min_order_amount?: number | null
          max_uses?: number | null
          used_count?: number
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          applicable_products?: string[] | null
          applicable_categories?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }

      // Reviews & Ratings
      product_reviews: {
        Row: {
          id: string
          product_id: string
          customer_id: string | null
          order_id: string | null
          rating: number
          title: string | null
          content: string | null
          is_verified: boolean
          is_featured: boolean
          helpful_count: number
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_id?: string | null
          order_id?: string | null
          rating: number
          title?: string | null
          content?: string | null
          is_verified?: boolean
          is_featured?: boolean
          helpful_count?: number
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_id?: string | null
          order_id?: string | null
          rating?: number
          title?: string | null
          content?: string | null
          is_verified?: boolean
          is_featured?: boolean
          helpful_count?: number
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}