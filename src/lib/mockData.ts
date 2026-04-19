// Mock data utilities for demo mode
// This provides realistic data for all components when Supabase is not connected

export const mockData = {
  // Categories
  categories: [
    {
      id: '1',
      name: 'Ηλεκτρονικά',
      slug: 'electronics',
      description: 'Ηλεκτρονικά είδη και συσκευές τελευταίας τεχνολογίας',
      image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      parent_id: null,
      sort_order: 1,
      is_active: true,
      meta_title: 'Ηλεκτρονικά - AION Store',
      meta_description: 'Ανακαλύψτε την τελευταία τεχνολογία σε ηλεκτρονικά προϊόντα',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      productCount: 45
    },
    {
      id: '2',
      name: 'Ρούχα',
      slug: 'clothing',
      description: 'Ανδρικά και γυναικεία ρούχα για κάθε περίσταση',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      parent_id: null,
      sort_order: 2,
      is_active: true,
      meta_title: 'Ρούχα - AION Store',
      meta_description: 'Σύγχρονα ρούχα για άνδρες και γυναίκες',
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
      productCount: 78
    },
    {
      id: '3',
      name: 'Σπίτι & Κήπος',
      slug: 'home-garden',
      description: 'Είδη για το σπίτι και τον κήπο σας',
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      parent_id: null,
      sort_order: 3,
      is_active: true,
      meta_title: 'Σπίτι & Κήπος - AION Store',
      meta_description: 'Όλα όσα χρειάζεστε για το σπίτι και τον κήπο σας',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z',
      productCount: 32
    },
    {
      id: '4',
      name: 'Αθλητικά',
      slug: 'sports',
      description: 'Είδη αθλητισμού και φυσικής κατάστασης',
      image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      parent_id: null,
      sort_order: 4,
      is_active: true,
      meta_title: 'Αθλητικά - AION Store',
      meta_description: 'Εξοπλισμός για όλους τους αθλητισμούς',
      created_at: '2024-02-10T10:00:00Z',
      updated_at: '2024-02-10T10:00:00Z',
      productCount: 28
    }
  ],

  // Products
  products: [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'Το πιο προηγμένο iPhone με επαγγελματικές κάμερες και A17 Pro chip.',
      short_description: 'Το πιο προηγμένο iPhone μέχρι σήμερα',
      sku: 'IPH15PM-128',
      price: 1399.00,
      compare_price: 1499.00,
      cost_price: 1100.00,
      track_inventory: true,
      stock_quantity: 25,
      low_stock_threshold: 5,
      weight: 221,
      dimensions: { length: 159.9, width: 76.7, height: 8.25 },
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500'
      ],
      category_id: '1',
      brand: 'Apple',
      tags: ['smartphone', 'ios', 'premium'],
      is_active: true,
      is_featured: true,
      is_digital: false,
      seo_title: 'iPhone 15 Pro Max - Apple',
      seo_description: 'Αγοράστε το iPhone 15 Pro Max με τις καλύτερες τιμές',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      categories: { id: '1', name: 'Ηλεκτρονικά', slug: 'electronics' }
    },
    {
      id: '2',
      name: 'MacBook Air M3',
      slug: 'macbook-air-m3',
      description: 'Το πιο λεπτό laptop της Apple με το νέο M3 chip.',
      short_description: 'Ελαφρύ και ισχυρό laptop',
      sku: 'MBA-M3-13',
      price: 1299.00,
      compare_price: null,
      cost_price: 1000.00,
      track_inventory: true,
      stock_quantity: 15,
      low_stock_threshold: 3,
      weight: 1200,
      dimensions: { length: 304.1, width: 212.4, height: 11.5 },
      images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'],
      category_id: '1',
      brand: 'Apple',
      tags: ['laptop', 'macos', 'm3'],
      is_active: true,
      is_featured: true,
      is_digital: false,
      seo_title: 'MacBook Air M3 - Apple',
      seo_description: 'Το πιο λεπτό laptop με M3 chip',
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
      categories: { id: '1', name: 'Ηλεκτρονικά', slug: 'electronics' }
    },
    {
      id: '3',
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description: 'Comfortable running shoes with Air Max technology.',
      short_description: 'Άνετα αθλητικά παπούτσια',
      sku: 'NAM270-BLK',
      price: 150.00,
      compare_price: 180.00,
      cost_price: 90.00,
      track_inventory: true,
      stock_quantity: 50,
      low_stock_threshold: 10,
      weight: 300,
      dimensions: { length: 30, width: 20, height: 12 },
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'],
      category_id: '4',
      brand: 'Nike',
      tags: ['shoes', 'running', 'comfort'],
      is_active: true,
      is_featured: false,
      is_digital: false,
      seo_title: 'Nike Air Max 270 - Αθλητικά Παπούτσια',
      seo_description: 'Comfortable running shoes με Air Max technology',
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-02-01T10:00:00Z',
      categories: { id: '4', name: 'Αθλητικά', slug: 'sports' }
    }
  ],

  // Customers
  customers: [
    {
      id: '1',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+30 210 123 4567',
      company: 'Tech Solutions Ltd',
      billing_address: {
        street: '28is Oktovriou 45',
        city: 'Athens',
        state: 'Attica',
        postal_code: '106 82',
        country: 'Greece'
      },
      shipping_address: {
        street: '28is Oktovriou 45',
        city: 'Athens',
        state: 'Attica',
        postal_code: '106 82',
        country: 'Greece'
      },
      tax_id: '123456789',
      accepts_marketing: true,
      email_verified: true,
      total_orders: 5,
      total_spent: 2340.50,
      average_order_value: 468.10,
      last_order_date: '2024-03-15T14:30:00Z',
      loyalty_points: 234,
      membership_level: 'gold',
      tags: ['premium', 'tech-savvy'],
      notes: 'Προτιμάει Apple προϊόντα',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-03-15T14:30:00Z'
    },
    {
      id: '2',
      email: 'maria.papadopoulou@example.com',
      first_name: 'Maria',
      last_name: 'Papadopoulou',
      phone: '+30 2310 987 654',
      company: null,
      billing_address: {
        street: 'Tsimiski 12',
        city: 'Thessaloniki',
        state: 'Central Macedonia',
        postal_code: '546 22',
        country: 'Greece'
      },
      shipping_address: {
        street: 'Tsimiski 12',
        city: 'Thessaloniki',
        state: 'Central Macedonia',
        postal_code: '546 22',
        country: 'Greece'
      },
      tax_id: null,
      accepts_marketing: false,
      email_verified: true,
      total_orders: 2,
      total_spent: 320.00,
      average_order_value: 160.00,
      last_order_date: '2024-03-10T09:15:00Z',
      loyalty_points: 32,
      membership_level: 'silver',
      tags: ['fashion', 'regular'],
      notes: null,
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-03-10T09:15:00Z'
    }
  ],

  // Orders
  orders: [
    {
      id: '1',
      order_number: 'ORD-2024-001',
      customer_id: '1',
      status: 'delivered',
      payment_status: 'paid',
      payment_method: 'credit_card',
      payment_intent_id: 'pi_123456789',
      subtotal: 1399.00,
      tax_amount: 279.80,
      shipping_amount: 0.00,
      discount_amount: 0.00,
      total_amount: 1678.80,
      currency: 'EUR',
      billing_address: {
        street: '28is Oktovriou 45',
        city: 'Athens',
        state: 'Attica',
        postal_code: '106 82',
        country: 'Greece'
      },
      shipping_address: {
        street: '28is Oktovriou 45',
        city: 'Athens',
        state: 'Attica',
        postal_code: '106 82',
        country: 'Greece'
      },
      notes: null,
      tracking_number: 'GR123456789',
      shipped_at: '2024-03-16T10:00:00Z',
      delivered_at: '2024-03-18T14:30:00Z',
      created_at: '2024-03-15T14:30:00Z',
      updated_at: '2024-03-18T14:30:00Z',
      customers: {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com'
      },
      order_items: [
        {
          id: '1',
          order_id: '1',
          product_id: '1',
          variant_id: null,
          quantity: 1,
          unit_price: 1399.00,
          total_price: 1399.00,
          product_name: 'iPhone 15 Pro Max',
          product_sku: 'IPH15PM-128',
          product_image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100',
          attributes: null
        }
      ]
    },
    {
      id: '2',
      order_number: 'ORD-2024-002',
      customer_id: '2',
      status: 'processing',
      payment_status: 'paid',
      payment_method: 'paypal',
      payment_intent_id: 'pi_987654321',
      subtotal: 320.00,
      tax_amount: 64.00,
      shipping_amount: 5.00,
      discount_amount: 16.00,
      total_amount: 373.00,
      currency: 'EUR',
      billing_address: {
        street: 'Tsimiski 12',
        city: 'Thessaloniki',
        state: 'Central Macedonia',
        postal_code: '546 22',
        country: 'Greece'
      },
      shipping_address: {
        street: 'Tsimiski 12',
        city: 'Thessaloniki',
        state: 'Central Macedonia',
        postal_code: '546 22',
        country: 'Greece'
      },
      notes: 'Παρακαλώ συσκευασία δώρου',
      tracking_number: null,
      shipped_at: null,
      delivered_at: null,
      created_at: '2024-03-10T09:15:00Z',
      updated_at: '2024-03-10T09:15:00Z',
      customers: {
        id: '2',
        first_name: 'Maria',
        last_name: 'Papadopoulou',
        email: 'maria.papadopoulou@example.com'
      },
      order_items: [
        {
          id: '2',
          order_id: '2',
          product_id: '3',
          variant_id: null,
          quantity: 2,
          unit_price: 150.00,
          total_price: 300.00,
          product_name: 'Nike Air Max 270',
          product_sku: 'NAM270-BLK',
          product_image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100',
          attributes: null
        }
      ]
    }
  ],

  // Subscriptions
  subscriptions: [
    {
      id: '1',
      customer_id: '1',
      plan_id: '1',
      status: 'active',
      current_period_start: '2024-03-01T00:00:00Z',
      current_period_end: '2024-04-01T00:00:00Z',
      trial_end: null,
      cancel_at_period_end: false,
      cancelled_at: null,
      payment_method_id: 'pm_123456',
      billing_cycle: 'monthly',
      price: 29.99,
      currency: 'EUR',
      metadata: { features: ['premium_support', 'unlimited_storage'] },
      created_at: '2024-02-01T10:00:00Z',
      updated_at: '2024-03-01T00:00:00Z',
      customers: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com'
      },
      subscription_plans: {
        name: 'Premium Plan',
        price: 29.99,
        billing_cycle: 'monthly'
      }
    }
  ],

  // Subscription Plans
  subscriptionPlans: [
    {
      id: '1',
      name: 'Basic Plan',
      description: 'Ιδανικό για μικρές επιχειρήσεις',
      price: 9.99,
      currency: 'EUR',
      billing_cycle: 'monthly',
      trial_days: 14,
      features: {
        products: 100,
        storage: '1GB',
        support: 'email'
      },
      is_active: true,
      max_users: 1,
      storage_limit: 1073741824,
      api_calls_limit: 10000,
      sort_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Premium Plan',
      description: 'Για αναπτυσσόμενες επιχειρήσεις',
      price: 29.99,
      currency: 'EUR',
      billing_cycle: 'monthly',
      trial_days: 30,
      features: {
        products: 1000,
        storage: '10GB',
        support: 'priority',
        analytics: true
      },
      is_active: true,
      max_users: 5,
      storage_limit: 10737418240,
      api_calls_limit: 100000,
      sort_order: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Enterprise Plan',
      description: 'Για μεγάλες επιχειρήσεις',
      price: 99.99,
      currency: 'EUR',
      billing_cycle: 'monthly',
      trial_days: 0,
      features: {
        products: -1, // unlimited
        storage: '100GB',
        support: '24/7',
        analytics: true,
        customizations: true
      },
      is_active: true,
      max_users: -1, // unlimited
      storage_limit: 107374182400,
      api_calls_limit: -1, // unlimited
      sort_order: 3,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],

  // Media
  media: [
    {
      id: '1',
      name: 'product-hero.jpg',
      file_name: 'product-hero-123456.jpg',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      type: 'image/jpeg',
      size: 245760,
      folder: 'products',
      alt_text: 'Product hero image',
      caption: 'Beautiful product showcase',
      uploaded_by: '1',
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-01T10:00:00Z',
      profiles: {
        id: '1',
        full_name: 'John Doe'
      }
    },
    {
      id: '2',
      name: 'logo.png',
      file_name: 'logo-789012.png',
      url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
      type: 'image/png',
      size: 51200,
      folder: 'branding',
      alt_text: 'Company logo',
      caption: 'AION Store logo',
      uploaded_by: '1',
      created_at: '2024-02-15T10:00:00Z',
      updated_at: '2024-02-15T10:00:00Z',
      profiles: {
        id: '1',
        full_name: 'John Doe'
      }
    }
  ],

  // Analytics Data
  analytics: {
    totalRevenue: 125430.50,
    totalOrders: 1247,
    totalCustomers: 892,
    averageOrderValue: 100.67,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
    customersGrowth: 15.2,
    topProducts: [
      { name: 'iPhone 15 Pro Max', sales: 145, revenue: 202550 },
      { name: 'MacBook Air M3', sales: 89, revenue: 115211 },
      { name: 'Nike Air Max 270', sales: 234, revenue: 35100 }
    ],
    recentOrders: [
      {
        id: '1',
        order_number: 'ORD-2024-001',
        total_amount: 1678.80,
        status: 'delivered',
        customer_name: 'John Doe',
        created_at: '2024-03-15T14:30:00Z'
      },
      {
        id: '2',
        order_number: 'ORD-2024-002',
        total_amount: 373.00,
        status: 'processing',
        customer_name: 'Maria Papadopoulou',
        created_at: '2024-03-10T09:15:00Z'
      }
    ],
    salesByMonth: [
      { month: 'Jan', revenue: 85000, orders: 847 },
      { month: 'Feb', revenue: 92000, orders: 921 },
      { month: 'Mar', revenue: 101000, orders: 1001 },
      { month: 'Apr', revenue: 115000, orders: 1145 },
      { month: 'May', revenue: 128000, orders: 1278 },
      { month: 'Jun', revenue: 142000, orders: 1412 }
    ],
    salesByCategory: [
      { category: 'Ηλεκτρονικά', revenue: 89250, percentage: 71.2 },
      { category: 'Ρούχα', revenue: 23400, percentage: 18.7 },
      { category: 'Αθλητικά', revenue: 9870, percentage: 7.9 },
      { category: 'Σπίτι & Κήπος', revenue: 2910, percentage: 2.2 }
    ],
    customerStats: {
      newCustomers: 145,
      returningCustomers: 747,
      averageLifetimeValue: 285.50,
      churnRate: 3.2
    }
  },

  // Settings
  settings: [
    {
      id: '1',
      key: 'site_name',
      value: 'AION Store',
      category: 'general',
      description: 'Όνομα του e-shop',
      is_public: true,
      updated_by: '1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      key: 'site_description',
      value: 'Το καλύτερο e-commerce CMS για τις επιχειρήσεις σας',
      category: 'general',
      description: 'Περιγραφή του site',
      is_public: true,
      updated_by: '1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      key: 'currency',
      value: 'EUR',
      category: 'shop',
      description: 'Νόμισμα του καταστήματος',
      is_public: true,
      updated_by: '1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      key: 'tax_rate',
      value: 24,
      category: 'shop',
      description: 'Ποσοστό ΦΠΑ (%)',
      is_public: false,
      updated_by: '1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],

  // Coupons
  coupons: [
    {
      id: '1',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      min_order_amount: 50,
      max_uses: 100,
      used_count: 23,
      starts_at: '2024-01-01T00:00:00Z',
      expires_at: '2024-12-31T23:59:59Z',
      is_active: true,
      applicable_products: null,
      applicable_categories: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      code: 'FREESHIP',
      type: 'free_shipping',
      value: 0,
      min_order_amount: 100,
      max_uses: null,
      used_count: 45,
      starts_at: '2024-01-01T00:00:00Z',
      expires_at: null,
      is_active: true,
      applicable_products: null,
      applicable_categories: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
}

// Utility functions for demo mode
export const mockHelpers = {
  // Simulate API delays
  delay: (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate mock IDs
  generateId: () => Math.random().toString(36).substr(2, 9),

  // Simulate CRUD operations
  categories: {
    getAll: async () => {
      await mockHelpers.delay()
      return mockData.categories
    },
    create: async (data: any) => {
      await mockHelpers.delay()
      const newItem = { ...data, id: mockHelpers.generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      mockData.categories.push(newItem)
      return newItem
    },
    update: async (id: string, updates: any) => {
      await mockHelpers.delay()
      const index = mockData.categories.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.categories[index] = { ...mockData.categories[index], ...updates, updated_at: new Date().toISOString() }
        return mockData.categories[index]
      }
      throw new Error('Category not found')
    },
    delete: async (id: string) => {
      await mockHelpers.delay()
      const index = mockData.categories.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.categories.splice(index, 1)
        return true
      }
      throw new Error('Category not found')
    }
  },

  products: {
    getAll: async () => {
      await mockHelpers.delay()
      return mockData.products
    },
    getById: async (id: string) => {
      await mockHelpers.delay()
      const product = mockData.products.find(p => p.id === id)
      if (!product) throw new Error('Product not found')
      return product
    },
    create: async (data: any) => {
      await mockHelpers.delay()
      const newItem = { ...data, id: mockHelpers.generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      mockData.products.push(newItem)
      return newItem
    },
    update: async (id: string, updates: any) => {
      await mockHelpers.delay()
      const index = mockData.products.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.products[index] = { ...mockData.products[index], ...updates, updated_at: new Date().toISOString() }
        return mockData.products[index]
      }
      throw new Error('Product not found')
    },
    delete: async (id: string) => {
      await mockHelpers.delay()
      const index = mockData.products.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.products.splice(index, 1)
        return true
      }
      throw new Error('Product not found')
    }
  },

  customers: {
    getAll: async () => {
      await mockHelpers.delay()
      return mockData.customers
    },
    getById: async (id: string) => {
      await mockHelpers.delay()
      const customer = mockData.customers.find(c => c.id === id)
      if (!customer) throw new Error('Customer not found')
      return customer
    },
    create: async (data: any) => {
      await mockHelpers.delay()
      const newItem = { ...data, id: mockHelpers.generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      mockData.customers.push(newItem)
      return newItem
    },
    update: async (id: string, updates: any) => {
      await mockHelpers.delay()
      const index = mockData.customers.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.customers[index] = { ...mockData.customers[index], ...updates, updated_at: new Date().toISOString() }
        return mockData.customers[index]
      }
      throw new Error('Customer not found')
    },
    delete: async (id: string) => {
      await mockHelpers.delay()
      const index = mockData.customers.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.customers.splice(index, 1)
        return true
      }
      throw new Error('Customer not found')
    }
  },

  orders: {
    getAll: async () => {
      await mockHelpers.delay()
      return mockData.orders
    },
    getById: async (id: string) => {
      await mockHelpers.delay()
      const order = mockData.orders.find(o => o.id === id)
      if (!order) throw new Error('Order not found')
      return order
    },
    create: async (data: any) => {
      await mockHelpers.delay()
      const newItem = {
        ...data,
        id: mockHelpers.generateId(),
        order_number: `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockData.orders.push(newItem)
      return newItem
    },
    update: async (id: string, updates: any) => {
      await mockHelpers.delay()
      const index = mockData.orders.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.orders[index] = { ...mockData.orders[index], ...updates, updated_at: new Date().toISOString() }
        return mockData.orders[index]
      }
      throw new Error('Order not found')
    }
  },

  subscriptions: {
    getAll: async () => {
      await mockHelpers.delay()
      return mockData.subscriptions
    },
    getByCustomerId: async (customerId: string) => {
      await mockHelpers.delay()
      return mockData.subscriptions.filter(s => s.customer_id === customerId)
    },
    create: async (data: any) => {
      await mockHelpers.delay()
      const newItem = { ...data, id: mockHelpers.generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      mockData.subscriptions.push(newItem)
      return newItem
    },
    update: async (id: string, updates: any) => {
      await mockHelpers.delay()
      const index = mockData.subscriptions.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.subscriptions[index] = { ...mockData.subscriptions[index], ...updates, updated_at: new Date().toISOString() }
        return mockData.subscriptions[index]
      }
      throw new Error('Subscription not found')
    }
  },

  subscriptionPlans: {
    getAll: async () => {
      await mockHelpers.delay()
      return mockData.subscriptionPlans
    },
    create: async (data: any) => {
      await mockHelpers.delay()
      const newItem = { ...data, id: mockHelpers.generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      mockData.subscriptionPlans.push(newItem)
      return newItem
    },
    update: async (id: string, updates: any) => {
      await mockHelpers.delay()
      const index = mockData.subscriptionPlans.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.subscriptionPlans[index] = { ...mockData.subscriptionPlans[index], ...updates, updated_at: new Date().toISOString() }
        return mockData.subscriptionPlans[index]
      }
      throw new Error('Plan not found')
    },
    delete: async (id: string) => {
      await mockHelpers.delay()
      const index = mockData.subscriptionPlans.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.subscriptionPlans.splice(index, 1)
        return true
      }
      throw new Error('Plan not found')
    }
  },

  media: {
    getAll: async () => {
      await mockHelpers.delay()
      return mockData.media
    },
    upload: async (file: File) => {
      await mockHelpers.delay(1000) // Simulate upload delay
      const newItem = {
        id: mockHelpers.generateId(),
        name: file.name,
        file_name: `${file.name.split('.')[0]}-${Date.now()}.${file.name.split('.').pop()}`,
        url: URL.createObjectURL(file), // Mock URL
        type: file.type,
        size: file.size,
        folder: 'uploads',
        alt_text: null,
        caption: null,
        uploaded_by: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profiles: { id: '1', full_name: 'Demo User' }
      }
      mockData.media.push(newItem)
      return newItem
    },
    delete: async (id: string) => {
      await mockHelpers.delay()
      const index = mockData.media.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.media.splice(index, 1)
        return true
      }
      throw new Error('Media not found')
    }
  },

  analytics: {
    getDashboardStats: async () => {
      await mockHelpers.delay()
      return mockData.analytics
    }
  },

  settings: {
    getAll: async () => {
      await mockHelpers.delay()
      return mockData.settings
    },
    getByKey: async (key: string) => {
      await mockHelpers.delay()
      const setting = mockData.settings.find(s => s.key === key)
      return setting ? setting.value : null
    },
    update: async (key: string, value: any) => {
      await mockHelpers.delay()
      const index = mockData.settings.findIndex(item => item.key === key)
      if (index !== -1) {
        mockData.settings[index].value = value
        mockData.settings[index].updated_at = new Date().toISOString()
        return mockData.settings[index]
      } else {
        // Create new setting
        const newSetting = {
          id: mockHelpers.generateId(),
          key,
          value,
          category: 'general',
          description: `Setting for ${key}`,
          is_public: true,
          updated_by: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        mockData.settings.push(newSetting)
        return newSetting
      }
    }
  },

  coupons: {
    getAll: async () => {
      await mockHelpers.delay()
      return mockData.coupons
    },
    create: async (data: any) => {
      await mockHelpers.delay()
      const newItem = { ...data, id: mockHelpers.generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      mockData.coupons.push(newItem)
      return newItem
    },
    update: async (id: string, updates: any) => {
      await mockHelpers.delay()
      const index = mockData.coupons.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.coupons[index] = { ...mockData.coupons[index], ...updates, updated_at: new Date().toISOString() }
        return mockData.coupons[index]
      }
      throw new Error('Coupon not found')
    },
    delete: async (id: string) => {
      await mockHelpers.delay()
      const index = mockData.coupons.findIndex(item => item.id === id)
      if (index !== -1) {
        mockData.coupons.splice(index, 1)
        return true
      }
      throw new Error('Coupon not found')
    }
  }
}