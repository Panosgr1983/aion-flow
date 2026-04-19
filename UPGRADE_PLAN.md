# AION Flow - Production Upgrade Plan

## 🎯 Στόχοι Αναβάθμισης

Μετατροπή από mock data σε πλήρως λειτουργικό CMS με Supabase backend.

## 📋 Απαραίτητα Tables στο Supabase

### 1. **profiles** - Προφίλ χρηστών
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  language TEXT DEFAULT 'el',
  timezone TEXT DEFAULT 'Europe/Athens',
  notification_preferences JSONB DEFAULT '{"email": true, "browser": true, "system": false}',
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'viewer')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. **categories** - Κατηγορίες προϊόντων
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. **products** - Προϊόντα
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  sku TEXT UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'on_backorder')),
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',
  attributes JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  weight DECIMAL(8,3),
  dimensions JSONB,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. **orders** - Παραγγελίες
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  billing_address JSONB,
  shipping_address JSONB,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. **order_items** - Αντικείμενα παραγγελίας
```sql
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. **customers** - Πελάτες
```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  company TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  addresses JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. **media** - Πολυμέσα
```sql
CREATE TABLE media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  folder TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. **settings** - Ρυθμίσεις συστήματος
```sql
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  type TEXT DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔧 RLS Policies (Row Level Security)

### Profiles
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Categories (Public read, Admin write)
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 🚀 Implementation Steps

1. **Database Setup** - Δημιουργία tables και policies
2. **Type Definitions** - Update Supabase types
3. **API Functions** - Αντικατάσταση mock με real Supabase calls
4. **Authentication** - Πλήρης Supabase Auth integration
5. **File Uploads** - Supabase Storage integration
6. **Real-time** - Live updates για dashboard
7. **Error Handling** - Comprehensive error management
8. **Testing** - Unit και integration tests

## 📊 Migration από Mock Data

- Categories: `mockCategories` → `supabase.from('categories')`
- Products: `mockProducts` → `supabase.from('products')`
- Orders: `mockOrders` → `supabase.from('orders')`
- Customers: `mockCustomers` → `supabase.from('customers')`
- Media: File uploads → Supabase Storage
- Settings: Local storage → `supabase.from('settings')`

## 🔐 Authentication Flow

1. **Sign Up/Sign In** με Supabase Auth
2. **Profile Creation** αυτόματα μετά sign up
3. **Role-based Access** (admin, editor, viewer)
4. **Session Management** με automatic refresh
5. **Password Reset** functionality

## 📁 Storage Structure

```
supabase-storage/
├── products/          # Product images
├── categories/        # Category images
├── avatars/          # User avatars
├── media/            # General media files
└── temp/             # Temporary uploads
```

## ⚡ Performance Optimizations

- **React Query** για caching και sync
- **Supabase Realtime** για live updates
- **Image optimization** με Supabase transformations
- **Pagination** για μεγάλα datasets
- **Lazy loading** για images και components

## 🧪 Testing Strategy

- **Unit Tests** για components
- **Integration Tests** για Supabase calls
- **E2E Tests** για critical flows
- **Performance Tests** για large datasets