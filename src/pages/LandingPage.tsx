import React from 'react';
import { CircuitBoard, LayoutGrid, Package, Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <CircuitBoard className="w-8 h-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">AION Flow</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Build. Manage. Innovate.</span>
              <span className="block text-blue-400 mt-2">Your E-commerce Empire</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Transform your online business with our powerful e-commerce management platform. 
              Streamline operations, boost sales, and scale your business effortlessly.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link to="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 md:py-4 md:text-lg md:px-10">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<LayoutGrid className="w-8 h-8 text-blue-400" />}
              title="Intuitive Dashboard"
              description="Manage your entire e-commerce operation from a single, powerful dashboard."
            />
            <FeatureCard
              icon={<Package className="w-8 h-8 text-blue-400" />}
              title="Inventory Control"
              description="Real-time inventory tracking and automated stock management."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-blue-400" />}
              title="Customer Insights"
              description="Deep analytics and customer behavior tracking for better decisions."
            />
            <FeatureCard
              icon={<Settings className="w-8 h-8 text-blue-400" />}
              title="Advanced Automation"
              description="Automate routine tasks and focus on growing your business."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CircuitBoard className="w-6 h-6 text-blue-400" />
              <span className="ml-2 text-white font-semibold">AION Flow</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 AION Flow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-6 border border-slate-600/50 hover:border-blue-400/50 transition-colors">
      <div className="flex flex-col items-center text-center">
        {icon}
        <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
        <p className="mt-2 text-gray-300">{description}</p>
      </div>
    </div>
  );
}

export default LandingPage;