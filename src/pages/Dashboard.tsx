import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { CircuitBoard, LayoutDashboard, Package, Users, ShoppingCart, BarChart3, Settings, LogOut, FolderOpen, Image, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Overview from '../components/dashboard/Overview';
import Products from '../components/dashboard/Products';
import Customers from '../components/dashboard/Customers';
import Orders from '../components/dashboard/Orders';
import Analytics from '../components/dashboard/Analytics';
import Categories from '../components/dashboard/Categories';
import Media from '../components/dashboard/Media';
import Profile from '../components/dashboard/Profile';
import SettingsPage from '../components/dashboard/Settings';

function Dashboard() {
  const location = useLocation();
  const { signOut } = useAuth();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Categories', href: '/dashboard/categories', icon: FolderOpen },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Media', href: '/dashboard/media', icon: Image },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700">
              <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-slate-700">
                <CircuitBoard className="w-8 h-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold text-white">AION Flow</span>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-2 py-4 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'bg-slate-700/50 text-white'
                            : 'text-gray-300 hover:bg-slate-700/30 hover:text-white'
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      >
                        <item.icon
                          className={`${
                            isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'
                          } mr-3 flex-shrink-0 h-6 w-6`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <div className="flex-shrink-0 flex border-t border-slate-700 p-4">
                  <button
                    onClick={signOut}
                    className="flex-shrink-0 w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-slate-700/30 hover:text-white"
                  >
                    <LogOut className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-blue-400" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/media" element={<Media />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;