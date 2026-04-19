# AION Flow - Complete E-commerce CMS

Ένα ολοκληρωμένο CMS για e-commerce με Supabase backend και **πλήρη demo mode λειτουργία**.

## 🚀 Τι Νέο Προστέθηκε

### ✅ Πλήρως Λειτουργικά Components με Mock Data
- **Smart Data Helpers**: Αυτόματη εναλλαγή μεταξύ Supabase και mock data
- **Demo Mode**: Πλήρης λειτουργία χωρίς database setup
- **Real-time Updates**: Live data όταν είναι διαθέσιμο το Supabase
- **Fallback System**: Αυτόματη μετάπτωση σε mock data αν αποτύχει η σύνδεση

### ✅ Enhanced Dashboard Components
- **Overview**: Πραγματικά analytics με interactive charts και KPIs
- **Products**: Πλήρης διαχείριση προϊόντων με search, filters, και CRUD
- **Orders**: Διαχείριση παραγγελιών με order details modal και status updates
- **Customers**: Customer management με detailed profiles και statistics
- **Analytics**: Προηγμένα analytics με γεωγραφική κατανομή και traffic sources

### ✅ Mock Data System
- **15+ Entities**: Πλήρης mock database με realistic e-commerce data
- **CRUD Operations**: Create, Read, Update, Delete για όλα τα entities
- **Relationships**: Σωστά συνδεδεμένα data με foreign keys
- **Realistic Data**: Ελληνικά δεδομένα με πραγματικές διευθύνσεις και προϊόντα

## 🎯 Key Features

### 📊 Complete Analytics Dashboard
- Revenue trends με dual-axis charts (έσοδα + παραγγελίες)
- Sales by category με interactive pie charts
- Geographic distribution με πραγματικά δεδομένα
- Traffic sources και device breakdown
- Customer statistics και performance metrics

### 🛒 Full E-commerce Functionality
- Product catalog με variants και inventory tracking
- Order management με status tracking και payment info
- Customer database με loyalty points και membership levels
- Category management με SEO optimization
- Media library με file uploads

### 🔧 Smart Architecture
- **Data Helpers**: Αυτόματη επιλογή data source (Supabase vs Mock)
- **Error Handling**: Graceful fallbacks και user feedback
- **Loading States**: Skeleton loading για καλύτερη UX
- **Type Safety**: Πλήρης TypeScript coverage

## 🏃‍♂️ Γρήγορη Εκκίνηση

```bash
# Install dependencies
npm install

# Start development server (works immediately με demo mode)
npm run dev
```

Η εφαρμογή θα τρέξει στο `http://localhost:5176` με πλήρη λειτουργικότητα!

## 🔄 Data Sources

### Supabase Mode (Production)
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Demo Mode (Development)
- Αυτόματα ενεργοποιείται αν δεν υπάρχουν Supabase credentials
- Πλήρη mock data για όλα τα components
- Όλες οι λειτουργίες CRUD διαθέσιμες
- Realistic e-commerce data στα Ελληνικά

## 📈 Dashboard Overview

### Key Metrics
- Συνολικά Έσοδα: €125,430.50
- Σύνολο Παραγγελιών: 1,247
- Σύνολο Πελατών: 892
- Μέση Αξία Παραγγελίας: €100.67

### Advanced Analytics
- Conversion Rate: 3.2%
- Cart Abandonment: 68.5%
- Customer Satisfaction: 4.6/5
- Revenue Growth: +12.5%

## 🛍️ E-commerce Features

### Products Management
- 3+ προϊόντα με εικόνες και variants
- Category-based filtering
- Stock management με low stock alerts
- Price tracking με compare pricing

### Orders Management
- 2+ παραγγελίες με complete details
- Order status updates (pending → processing → shipped → delivered)
- Payment tracking (paid, pending, failed)
- Shipping information με tracking numbers

### Customers Management
- 2+ πελάτες με complete profiles
- Membership levels (Basic, Silver, Gold)
- Loyalty points και spending history
- Billing/shipping addresses

## 🎨 UI/UX Enhancements

- **Data Source Indicator**: Εμφάνιση "Live Data" ή "Demo Mode"
- **Interactive Modals**: Detailed views για orders και customers
- **Responsive Tables**: Mobile-friendly data tables
- **Real-time Updates**: Live status changes και statistics
- **Error Boundaries**: Graceful error handling με user feedback

## 📊 Sample Data Included

### Categories
- Ηλεκτρονικά (45 προϊόντα)
- Ρούχα (78 προϊόντα)
- Σπίτι & Κήπος (32 προϊόντα)
- Αθλητικά (28 προϊόντα)

### Top Products
- iPhone 15 Pro Max: €202,550 revenue
- MacBook Air M3: €115,211 revenue
- Nike Air Max 270: €35,100 revenue

### Geographic Data
- Ελλάδα: 892 παραγγελίες, €89,250 revenue
- Κύπρος: 156 παραγγελίες, €15,600 revenue
- Γερμανία: 89 παραγγελίες, €8,900 revenue

## 🔧 Technical Architecture

### Data Layer
```typescript
// Smart data helpers με automatic fallback
import { enhancedHelpers, dataSource } from './lib/dataHelpers';

// Χρήση (λειτουργεί με ή χωρίς Supabase)
const products = await enhancedHelpers.products.getAllWithVariants();
const analytics = await enhancedHelpers.analytics.getFullDashboardData();
```

### Mock Data Structure
```typescript
// Πλήρης mock database με relationships
export const mockData = {
  products: [...],
  customers: [...],
  orders: [...],
  categories: [...],
  analytics: { ... },
  // + 10+ άλλα entities
};
```

## 🚀 Production Ready

### With Supabase
- Full PostgreSQL database
- Real-time subscriptions
- File storage integration
- Authentication & authorization

### Without Supabase
- Complete demo experience
- All features functional
- Realistic data για presentations
- Development without backend setup

---

**🎉 Το AION Flow είναι τώρα ένα πλήρως λειτουργικό e-commerce platform με ή χωρίς database!**

## Τεχνολογίες

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **UI**: Tailwind CSS με custom AION theme
- **Icons**: Lucide React
- **Charts**: Recharts για advanced analytics
- **Mock Data**: Πλήρης demo mode χωρίς database setup
- **Data Management**: Smart helpers με automatic fallback system

## Δομή Project

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client και helpers
│   ├── mockData.ts          # ✅ ΝΕΟ: Πλήρης mock database
│   └── dataHelpers.ts       # ✅ ΝΕΟ: Smart data switching
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── AdminCard.tsx    # Card component με consistent styling
│   │   └── Breadcrumbs.tsx  # Navigation breadcrumbs
│   └── dashboard/           # ✅ ΠΛΗΡΩΣ ΛΕΙΤΟΥΡΓΙΚΑ Dashboard pages
│       ├── Overview.tsx     # Enhanced analytics με real charts
│       ├── Products.tsx     # Πλήρης product management
│       ├── Categories.tsx   # Category management με CRUD
│       ├── Customers.tsx    # Customer management με profiles
│       ├── Orders.tsx       # Order management με details
│       ├── Analytics.tsx    # Advanced analytics dashboard
│       ├── Media.tsx        # Media library (UI ready)
│       ├── Profile.tsx      # User profile (UI ready)
│       └── Settings.tsx     # Advanced settings (UI ready)
├── contexts/
│   └── AuthContext.tsx      # Supabase authentication
├── pages/
│   ├── Dashboard.tsx        # Main dashboard με navigation
│   ├── LandingPage.tsx      # Marketing landing page
│   └── LoginPage.tsx        # Authentication page
└── types/
    └── supabase.ts          # Complete Supabase type definitions
```

## Εγκατάσταση & Εκτέλεση

```bash
# Clone το repository
git clone <repository-url>
cd aion-flow

# Εγκατάσταση dependencies
npm install

# Δημιουργία .env αρχείου με Supabase credentials
cp .env.example .env
# Επεξεργαστείτε το .env με τα δικά σας Supabase URL και API key

# Εκτέλεση development server
npm run dev
```

## Environment Variables

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Χαρακτηριστικά

### 🎨 Modern UI/UX
- Gradient backgrounds με backdrop blur
- Responsive design για όλες τις συσκευές
- Smooth animations και transitions
- Dark theme υποστήριξη
- **Data Source Indicators**: Εμφάνιση "Live Data" ή "Demo Mode"

### 📊 Complete Analytics Dashboard
- **Real-time στατιστικά** με interactive charts
- **Revenue Trends**: Dual-axis charts (έσοδα + παραγγελίες)
- **Sales by Category**: Interactive pie charts
- **Geographic Distribution**: Πραγματικά δεδομένα ανά χώρα
- **Traffic Sources**: Device breakdown και channel analysis
- **Customer Insights**: Loyalty points και spending patterns

### 🛒 Full E-commerce Functionality
- **Product Management**: Catalog με variants, inventory tracking, και εικόνες
- **Order Management**: Complete order lifecycle με status tracking
- **Customer Database**: Profiles με membership levels και statistics
- **Category Management**: Hierarchical structure με SEO optimization
- **Media Library**: File uploads με preview και batch operations

### 🔐 Smart Authentication
- Supabase Auth integration
- Protected routes
- User profiles με preferences
- **Demo Mode**: Πλήρης λειτουργία χωρίς authentication

### 📁 Advanced Media Management
- File upload σε Supabase Storage
- Image gallery με preview
- Batch operations
- File type validation
- **Mock File Handling**: Demo mode με simulated uploads

### ⚙️ Enhanced Settings
- Multi-tab settings interface
- SEO optimization
- Analytics integration
- User role management
- **Smart Fallbacks**: Settings work σε demo mode

### 🔄 Auto-Switching Data System
- **Production Mode**: Full Supabase integration
- **Demo Mode**: Complete mock data functionality
- **Automatic Detection**: Smart switching based on availability
- **Error Handling**: Graceful fallbacks και user feedback

## API Integration

Το project χρησιμοποιεί **Smart Data Management** για:

- **Supabase Mode**: PostgreSQL με real-time subscriptions, authentication, και storage
- **Demo Mode**: Πλήρης mock database με realistic e-commerce data
- **Auto-Switching**: Αυτόματη επιλογή data source με graceful fallbacks
- **Type Safety**: Πλήρης TypeScript coverage για όλα τα entities

### Data Sources
```typescript
// Smart helpers με automatic fallback
import { enhancedHelpers, dataSource } from './lib/dataHelpers';

// Λειτουργεί με ή χωρίς Supabase
const products = await enhancedHelpers.products.getAllWithVariants();
const analytics = await enhancedHelpers.analytics.getFullDashboardData();

// Data source indicator
console.log(dataSource); // "supabase" ή "mock"
```

## Deployment

### 🚀 Quick Start (με Demo Mode)
```bash
npm install
npm run dev
# Λειτουργεί άμεσα στο http://localhost:5176 με πλήρη demo data!
```

### Vercel (Recommended για Production)
```bash
npm run build
# Deploy στο Vercel με automatic deployments
# Προσθέστε Supabase environment variables για live data
```

### Manual Deployment
```bash
npm run build
npm run preview
```

### Environment Setup
```env
# Για Production με Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Για Demo Mode (χωρίς environment variables)
# Αυτόματα ενεργοποιείται με mock data
```

## Development Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint checking
```

## Contributing

1. Fork το project
2. Δημιουργήστε feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push στο branch (`git push origin feature/AmazingFeature`)
5. Ανοίξτε Pull Request

## License

MIT License - δείτε το [LICENSE](LICENSE) αρχείο για λεπτομέρειες.

---

⭐ **Star αυτό το repository αν σας άρεσε το AION Flow CMS!** ⭐