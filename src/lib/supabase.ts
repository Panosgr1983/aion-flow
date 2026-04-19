import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && supabaseKey &&
  supabaseUrl !== 'https://demo.supabase.co' &&
  supabaseKey !== 'demo-key'

export const isSupabaseAvailable = hasValidCredentials

// Create Supabase client only if we have valid credentials
export const supabase = hasValidCredentials
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Helper functions for common operations
export const supabaseHelpers = {
  // Categories
  categories: {
    async getAll() {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data
    },

    async create(category: Database['public']['Tables']['categories']['Insert']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Database['public']['Tables']['categories']['Update']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async delete(id: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  // Products
  products: {
    async getAll() {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    async getById(id: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          ),
          product_variants (*),
          product_reviews (
            id,
            rating,
            title,
            content,
            is_verified,
            created_at,
            customers (
              first_name,
              last_name
            )
          )
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },

    async create(product: Database['public']['Tables']['products']['Insert']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Database['public']['Tables']['products']['Update']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async delete(id: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  // Product Variants
  productVariants: {
    async getByProductId(productId: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data
    },

    async create(variant: Database['public']['Tables']['product_variants']['Insert']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('product_variants')
        .insert(variant)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Database['public']['Tables']['product_variants']['Update']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async delete(id: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  // Orders
  orders: {
    async getAll() {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email
          ),
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              id,
              name,
              images
            )
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    async getById(id: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*),
          order_items (
            *,
            products (*),
            product_variants (*)
          )
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },

    async create(order: Database['public']['Tables']['orders']['Insert']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Database['public']['Tables']['orders']['Update']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Order Items
  orderItems: {
    async create(items: Database['public']['Tables']['order_items']['Insert'][]) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('order_items')
        .insert(items)
        .select()
      if (error) throw error
      return data
    }
  },

  // Customers
  customers: {
    async getAll() {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    async getById(id: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          orders (
            id,
            order_number,
            total_amount,
            status,
            created_at
          ),
          subscriptions (
            id,
            status,
            plan_id,
            current_period_end,
            subscription_plans (
              name,
              price,
              billing_cycle
            )
          )
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },

    async create(customer: Database['public']['Tables']['customers']['Insert']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Database['public']['Tables']['customers']['Update']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async delete(id: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  // Subscriptions
  subscriptions: {
    async getAll() {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email
          ),
          subscription_plans (
            name,
            price,
            billing_cycle
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    async getByCustomerId(customerId: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    async create(subscription: Database['public']['Tables']['subscriptions']['Insert']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscription)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Database['public']['Tables']['subscriptions']['Update']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Subscription Plans
  subscriptionPlans: {
    async getAll() {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data
    },

    async create(plan: Database['public']['Tables']['subscription_plans']['Insert']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(plan)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Database['public']['Tables']['subscription_plans']['Update']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async delete(id: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  // Media
  media: {
    async getAll() {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('media')
        .select(`
          *,
          profiles (
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    async upload(file: File, folder = 'general') {
      if (!supabase) throw new Error('Supabase not available')
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      // Save to database
      const { data, error } = await supabase
        .from('media')
        .insert({
          name: file.name,
          file_name: fileName,
          url: publicUrl,
          type: file.type,
          size: file.size,
          folder,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async delete(id: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { data: mediaItem, error: fetchError } = await supabase
        .from('media')
        .select('url')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      const filePath = mediaItem.url.split('/').pop()
      if (filePath) {
        await supabase.storage
          .from('media')
          .remove([filePath])
      }

      // Delete from database
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id)

      if (error) throw error
    }
  },

  // Settings
  settings: {
    async getAll() {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('category', { ascending: true })
      if (error) throw error
      return data
    },

    async getByKey(key: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single()
      if (error) throw error
      return data.value
    },

    async update(key: string, value: any) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          key,
          value,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Coupons
  coupons: {
    async getAll() {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    async create(coupon: Database['public']['Tables']['coupons']['Insert']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('coupons')
        .insert(coupon)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Database['public']['Tables']['coupons']['Update']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async delete(id: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  // Product Reviews
  productReviews: {
    async getByProductId(productId: string) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          customers (
            first_name,
            last_name
          )
        `)
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    async create(review: Database['public']['Tables']['product_reviews']['Insert']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('product_reviews')
        .insert(review)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(id: string, updates: Database['public']['Tables']['product_reviews']['Update']) {
      const { data, error } = await supabase
        .from('product_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Analytics
  analytics: {
    async getDashboardStats() {
      // This would typically use database views or complex queries
      // For now, return mock data that would come from analytics
      const mockStats = {
        totalRevenue: 125430.50,
        totalOrders: 1247,
        totalCustomers: 892,
        averageOrderValue: 100.67,
        revenueGrowth: 12.5,
        ordersGrowth: 8.3,
        customersGrowth: 15.2,
        topProducts: [
          { name: 'iPhone 15 Pro', sales: 145, revenue: 217500 },
          { name: 'MacBook Air M3', sales: 89, revenue: 133500 },
          { name: 'AirPods Pro', sales: 234, revenue: 35100 }
        ],
        recentOrders: [],
        salesByMonth: [
          { month: 'Jan', revenue: 85000 },
          { month: 'Feb', revenue: 92000 },
          { month: 'Mar', revenue: 101000 },
          { month: 'Apr', revenue: 115000 },
          { month: 'May', revenue: 128000 },
          { month: 'Jun', revenue: 142000 }
        ]
      }
      return mockStats
    },

    async trackEvent(eventType: string, eventData: any) {
      const { data, error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: eventType,
          event_data: eventData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
      if (error) throw error
      return data
    }
  },

  // Profiles
  profiles: {
    async getCurrent() {
      if (!supabase) throw new Error('Supabase not available')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    },

    async update(updates: Database['public']['Tables']['profiles']['Update']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async createProfile(profile: Database['public']['Tables']['profiles']['Insert']) {
      if (!supabase) throw new Error('Supabase not available')
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()

      if (error) throw error
      return data
    }
  }
}