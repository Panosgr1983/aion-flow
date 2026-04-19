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
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          company: string | null
          total_orders: number
          total_spent: number
          last_order_date: string | null
          addresses: Json
          tags: string[]
          notes: string | null
          is_active: boolean
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
          total_orders?: number
          total_spent?: number
          last_order_date?: string | null
          addresses?: Json
          tags?: string[]
          notes?: string | null
          is_active?: boolean
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
          total_orders?: number
          total_spent?: number
          last_order_date?: string | null
          addresses?: Json
          tags?: string[]
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          name: string
          file_name: string
          url: string
          thumbnail_url: string | null
          type: string
          size: number
          width: number | null
          height: number | null
          alt_text: string | null
          caption: string | null
          uploaded_by: string | null
          folder: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          file_name: string
          url: string
          thumbnail_url?: string | null
          type: string
          size: number
          width?: number | null
          height?: number | null
          alt_text?: string | null
          caption?: string | null
          uploaded_by?: string | null
          folder?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          file_name?: string
          url?: string
          thumbnail_url?: string | null
          type?: string
          size?: number
          width?: number | null
          height?: number | null
          alt_text?: string | null
          caption?: string | null
          uploaded_by?: string | null
          folder?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          product_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
          total_price: number
          product_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          product_data?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          status: string
          total_amount: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          currency: string
          billing_address: Json
          shipping_address: Json
          payment_method: string | null
          payment_status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          status?: string
          total_amount: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          currency?: string
          billing_address?: Json
          shipping_address?: Json
          payment_method?: string | null
          payment_status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          status?: string
          total_amount?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          currency?: string
          billing_address?: Json
          shipping_address?: Json
          payment_method?: string | null
          payment_status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          sku: string | null
          price: number
          compare_price: number | null
          cost_price: number | null
          stock_quantity: number
          stock_status: string
          images: string[]
          category_id: string | null
          tags: string[]
          attributes: Json
          is_active: boolean
          is_featured: boolean
          weight: number | null
          dimensions: Json
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
          sku?: string | null
          price: number
          compare_price?: number | null
          cost_price?: number | null
          stock_quantity?: number
          stock_status?: string
          images?: string[]
          category_id?: string | null
          tags?: string[]
          attributes?: Json
          is_active?: boolean
          is_featured?: boolean
          weight?: number | null
          dimensions?: Json
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
          sku?: string | null
          price?: number
          compare_price?: number | null
          cost_price?: number | null
          stock_quantity?: number
          stock_status?: string
          images?: string[]
          category_id?: string | null
          tags?: string[]
          attributes?: Json
          is_active?: boolean
          is_featured?: boolean
          weight?: number | null
          dimensions?: Json
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          location: string | null
          language: string
          timezone: string
          notification_preferences: Json
          role: string
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          language?: string
          timezone?: string
          notification_preferences?: Json
          role?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          language?: string
          timezone?: string
          notification_preferences?: Json
          role?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          type: string
          category: string
          is_public: boolean
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json
          type?: string
          category?: string
          is_public?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          type?: string
          category?: string
          is_public?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}