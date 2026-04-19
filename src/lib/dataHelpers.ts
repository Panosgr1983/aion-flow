import { supabaseHelpers } from './supabase'
import { mockHelpers } from './mockData'

// Check if Supabase is available
const isSupabaseAvailable = () => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    return !!(url && key)
  } catch {
    return false
  }
}

// Auto-select data source
export const dataHelpers = isSupabaseAvailable() ? supabaseHelpers : mockHelpers

// Export availability status for UI feedback
export const dataSource = {
  isSupabase: isSupabaseAvailable(),
  isMock: !isSupabaseAvailable(),
  status: isSupabaseAvailable() ? 'connected' : 'demo'
}

// Enhanced helpers with fallback logic
export const enhancedHelpers = {
  ...dataHelpers,

  // Categories with enhanced features
  categories: {
    ...dataHelpers.categories,
    async getAllWithStats() {
      const categories = await dataHelpers.categories.getAll()
      // Add mock stats if needed
      return categories.map(cat => ({
        ...cat,
        productCount: cat.productCount || Math.floor(Math.random() * 20),
        revenue: Math.floor(Math.random() * 10000)
      }))
    }
  },

  // Products with enhanced features
  products: {
    ...dataHelpers.products,
    async getAllWithVariants() {
      const products = await dataHelpers.products.getAll()
      // Add mock variants if needed
      return products.map(product => ({
        ...product,
        variants: product.variants || [],
        reviews: product.reviews || [],
        averageRating: product.averageRating || (Math.random() * 2 + 3).toFixed(1)
      }))
    }
  },

  // Analytics with comprehensive dashboard data
  analytics: {
    ...dataHelpers.analytics,
    async getFullDashboardData() {
      const baseStats = await dataHelpers.analytics.getDashboardStats()

      // Enhanced analytics data
      return {
        ...baseStats,
        conversionRate: 3.2,
        cartAbandonmentRate: 68.5,
        customerSatisfaction: 4.6,
        topReferrers: [
          { source: 'Google', visitors: 1250, conversions: 38 },
          { source: 'Facebook', visitors: 890, conversions: 22 },
          { source: 'Direct', visitors: 650, conversions: 45 }
        ],
        deviceBreakdown: [
          { device: 'Desktop', percentage: 45.2 },
          { device: 'Mobile', percentage: 42.8 },
          { device: 'Tablet', percentage: 12.0 }
        ],
        geographicData: [
          { country: 'Greece', orders: 892, revenue: 89250 },
          { country: 'Cyprus', orders: 156, revenue: 15600 },
          { country: 'Germany', orders: 89, revenue: 8900 }
        ]
      }
    }
  }
}