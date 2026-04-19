import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function AdminCard({ children, title, className = '' }: AdminCardProps) {
  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}