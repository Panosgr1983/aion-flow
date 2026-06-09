import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
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
import SiteSettingsPanel from '../components/dashboard/SiteSettingsPanel';
import Pages from '../components/dashboard/Pages';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import History from '../components/dashboard/History';
import InboxPage from '../components/inbox/InboxPage';

export default function Dashboard() {
  const { isDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 pl-[260px] transition-all duration-300">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route index element={isDemoMode ? <Overview /> : <Services />} />
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
            <Route path="services" element={<Services />} />
            <Route path="blog" element={<BlogPosts />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="credentials" element={<Credentials />} />
            <Route path="core-values" element={<CoreValues />} />
            <Route path="about" element={<AboutPanel />} />
            <Route path="cta" element={<CtaPanel />} />
            <Route path="pages" element={<Pages />} />
            <Route path="site-settings" element={<SiteSettingsPanel />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="history" element={<History />} />
            <Route path="contact-messages" element={<Navigate to="/dashboard/inbox" replace />} />
            <Route path="inbox" element={<InboxPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
