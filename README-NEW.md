# AION Flow - Production Ready CMS

Ένα ολοκληρωμένο Content Management System βασισμένο σε React, TypeScript, και Supabase για πλήρη διαχείριση e-commerce καταστημάτων.

## 🚀 Χαρακτηριστικά

- **Πλήρης Supabase Integration** - Real database, auth, και storage
- **Modern UI/UX** με gradients και responsive design
- **Διαχείριση Προϊόντων** με κατηγορίες και εικόνες
- **Διαχείριση Παραγγελιών** και πελατών
- **Media Library** με drag & drop uploads
- **Analytics Dashboard** με interactive charts
- **Authentication** με user profiles και roles
- **Real-time Updates** με Supabase subscriptions

## 🛠️ Τεχνολογίες

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Styling**: Tailwind CSS με custom AION theme
- **Icons**: Lucide React
- **Charts**: Recharts για analytics
- **Build Tool**: Vite με HMR

## 📋 Προαπαιτούμενα

- Node.js 18+
- npm ή yarn
- Supabase account

## 🚀 Γρήγορη Εγκατάσταση

1. **Clone και setup:**
   ```bash
   git clone <repository-url>
   cd aion-flow
   npm install
   ```

2. **Supabase Setup:**
   ```bash
   # Αντιγραφή environment template
   cp .env.example .env
   ```

   Επεξεργαστείτε το `.env` με τα Supabase credentials σας:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Database Migration:**
   - Πηγαίνετε στο Supabase Dashboard > SQL Editor
   - Εκτελέστε το migration script για να δημιουργήσετε τους πίνακες

4. **Εκκίνηση:**
   ```bash
   npm run dev
   ```

## 📁 Δομή Project

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   │   ├── AdminCard.tsx
│   │   └── Breadcrumbs.tsx
│   └── dashboard/    # Dashboard pages
│       ├── Overview.tsx
│       ├── Products.tsx
│       ├── Categories.tsx    # ✅ Production ready
│       ├── Orders.tsx
│       ├── Customers.tsx
│       ├── Media.tsx
│       ├── Profile.tsx
│       └── Settings.tsx
├── contexts/
│   └── AuthContext.tsx       # ✅ Supabase auth
├── lib/
│   └── supabase.ts           # ✅ Supabase client & helpers
├── pages/
├── types/
│   └── supabase.ts           # ✅ Complete type definitions
└── ...
```

## 🔧 Supabase Database Schema

### Κύριοι Πίνακες:
- `profiles` - User profiles με preferences
- `categories` - Product categories με hierarchy
- `products` - Products με images και variants
- `orders` - Customer orders
- `order_items` - Order line items
- `customers` - Customer database
- `media` - File storage metadata
- `settings` - System configuration

### Authentication:
- Row Level Security (RLS) enabled
- User roles και permissions
- Session management
- Password recovery

## 🎯 Dashboard Sections

### ✅ **Categories** - Πλήρως Λειτουργικό
- CRUD operations με Supabase
- Modal forms για create/edit
- Real-time search και filtering
- Error handling και success messages
- Product count ανά category

### 🔄 **Media Library** - UI Ready
- Drag & drop file upload
- Grid view με thumbnails
- File type validation
- Supabase Storage integration (ready)

### 🔄 **Profile Management** - UI Ready
- Multi-tab interface
- Avatar upload
- Notification preferences
- Security settings

### 🔄 **Settings** - UI Ready
- 6-tab configuration system
- Shop settings, SEO, Analytics
- User management
- Database persistence ready

## 🔒 Authentication Flow

```typescript
// Login/Signup με Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Profile management
const profile = await supabaseHelpers.profiles.getCurrent();
await supabaseHelpers.profiles.update(updates);
```

## 📊 Real-time Features

- **Live Analytics**: Real-time dashboard metrics
- **Order Updates**: Instant order status changes
- **User Activity**: Live user session tracking
- **Media Uploads**: Instant file availability

## 🚀 Production Deployment

### Vercel (Recommended):
```bash
npm run build
# Deploy με environment variables
```

### Netlify:
```bash
npm run build
# Upload dist/ folder
```

### Manual:
```bash
npm run build
npm run preview
```

## 🧪 Development

```bash
# Development με HMR
npm run dev

# Production build
npm run build

# Lint checking
npm run lint

# Type checking
npm run type-check
```

## 🔧 Environment Variables

```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional
VITE_APP_NAME=AION Flow
VITE_APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Fork το project
2. Feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Pull Request

## 📝 License

MIT License - δείτε το LICENSE αρχείο.

---

**⭐ Star αυτό το repository για να υποστηρίξετε το AION Flow! ⭐**

Για ερωτήσεις ή issues, ανοίξτε GitHub issue.