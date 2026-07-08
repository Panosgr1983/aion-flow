import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../lib/useTenant';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import SuspensionBanner from '../components/dashboard/SuspensionBanner';
import TenantSelector from '../components/admin/TenantSelector';
import Overview from '../components/dashboard/Overview';
import Products from '../components/dashboard/Products';
import Categories from '../components/dashboard/Categories';
import Orders from '../components/dashboard/Orders';
import Customers from '../components/dashboard/Customers';
import MediaLibrary from '../components/dashboard/MediaLibrary';
import Profile from '../components/dashboard/Profile';
import DashboardSettings from '../components/dashboard/DashboardSettings';
import Services from '../components/dashboard/Services';
import BlogPosts from '../components/dashboard/BlogPosts';
import Testimonials from '../components/dashboard/Testimonials';
import Credentials from '../components/dashboard/Credentials';
import CoreValues from '../components/dashboard/CoreValues';
import AboutPanel from '../components/dashboard/AboutPanel';
import CtaPanel from '../components/dashboard/CtaPanel';
import BusinessInformationPanel from '../components/dashboard/BusinessInformationPanel';
import BrandingPanel from '../components/dashboard/BrandingPanel';
import SiteSettingsPanel from '../components/dashboard/SiteSettingsPanel';
import Pages from '../components/dashboard/Pages';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import History from '../components/dashboard/History';
import InboxPage from '../components/inbox/InboxPage';
import PipelinePage from '../components/inbox/PipelinePage';
import UsersManager from '../components/settings/UsersManager';
import BackupManager from '../components/settings/BackupManager';
import ObservabilityDashboard from '../components/settings/ObservabilityDashboard';
import UsageDashboard from '../components/settings/UsageDashboard';
import SystemDebug from '../components/settings/SystemDebug';
import PlatformOverview from '../components/settings/PlatformOverview';
import PlatformGuard from '../components/settings/PlatformGuard';
import TenantOverview from '../components/dashboard/TenantOverview';
import TenantSiteManagement from '../components/dashboard/TenantSiteManagement';
import ErrorBoundary from '../components/dashboard/ErrorBoundary';
// import EmailSyncManager from '../components/settings/EmailSyncManager';

// Artist Module v0.1 — read-only panels
import BiographyPanel from '../modules/artist/pages/BiographyPanel';
import FilmographyPanel from '../modules/artist/pages/FilmographyPanel';
import TelevisionPanel from '../modules/artist/pages/TelevisionPanel';
import TheatrePanel from '../modules/artist/pages/TheatrePanel';
import TimelinePanel from '../modules/artist/pages/TimelinePanel';
import GalleryPanel from '../modules/artist/pages/GalleryPanel';
import PressPanel from '../modules/artist/pages/PressPanel';
import ShowreelPanel from '../modules/artist/pages/ShowreelPanel';

export default function Dashboard() {
  const { isDemoMode } = useAuth();
  const tenant = useTenant();

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {tenant.isSuperAdmin && !tenant.loading && <TenantSelector />}
      <SuspensionBanner status={tenant.tenantStatus} />
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 pl-[260px] transition-all duration-300">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          <ErrorBoundary>
          <Routes>
            <Route index element={<TenantOverview />} />
            <Route path="platform" element={<PlatformGuard><PlatformOverview /></PlatformGuard>} />
            {isDemoMode && (
              <>
                <Route path="categories" element={<Categories />} />
                <Route path="orders" element={<Orders />} />
                <Route path="customers" element={<Customers />} />
              </>
            )}
            <Route path="products" element={<Products />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<DashboardSettings />} />
            <Route path="settings/users" element={<UsersManager />} />
            <Route path="settings/backup" element={<BackupManager />} />
            <Route path="settings/observability" element={<PlatformGuard><ObservabilityDashboard /></PlatformGuard>} />
            <Route path="settings/usage" element={<PlatformGuard><UsageDashboard /></PlatformGuard>} />
            <Route path="settings/system" element={<PlatformGuard><SystemDebug /></PlatformGuard>} />
            {/* <Route path="settings/email-sync" element={<EmailSyncManager />} /> */}
            <Route path="services" element={<Services />} />
            <Route path="blog" element={<BlogPosts />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="credentials" element={<Credentials />} />
            <Route path="core-values" element={<CoreValues />} />
            <Route path="about" element={<AboutPanel />} />
            <Route path="cta" element={<CtaPanel />} />
            <Route path="business-info" element={<BusinessInformationPanel />} />
            <Route path="branding" element={<BrandingPanel />} />
            <Route path="pages" element={<Pages />} />
            <Route path="site-settings" element={<SiteSettingsPanel />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="history" element={<PlatformGuard><History /></PlatformGuard>} />
            <Route path="contact-messages" element={<Navigate to="/dashboard/inbox" replace />} />
            <Route path="inbox" element={<PlatformGuard><InboxPage /></PlatformGuard>} />
            <Route path="pipeline" element={<PlatformGuard><PipelinePage /></PlatformGuard>} />
            <Route path="tenant" element={<TenantOverview />} />
            <Route path="tenant-site" element={<TenantSiteManagement />} />
            {/* Artist Module v0.1 — read-only panels */}
            <Route path="artist" element={<BiographyPanel />} />
            <Route path="artist/bio" element={<BiographyPanel />} />
            <Route path="artist/films" element={<FilmographyPanel />} />
            <Route path="artist/tv" element={<TelevisionPanel />} />
            <Route path="artist/theatre" element={<TheatrePanel />} />
            <Route path="artist/timeline" element={<TimelinePanel />} />
            <Route path="artist/gallery" element={<GalleryPanel />} />
            <Route path="artist/press" element={<PressPanel />} />
            <Route path="artist/showreels" element={<ShowreelPanel />} />
          </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
