import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  customItems?: BreadcrumbItem[];
}

export default function Breadcrumbs({ items, customItems }: BreadcrumbsProps) {
  const location = useLocation();

  // Auto-generate breadcrumbs from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Dashboard', href: '/dashboard' }
    ];

    let currentPath = '/dashboard';
    pathSegments.slice(1).forEach((segment, index) => {
      currentPath += `/${segment}`;
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        name: name.replace('-', ' '),
        href: index === pathSegments.slice(1).length - 1 ? undefined : currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = items || generateBreadcrumbs();

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-500 mx-2" />
            {item.href ? (
              <Link
                to={item.href}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-white text-sm font-medium">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}